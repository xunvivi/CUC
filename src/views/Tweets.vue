<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTwitterStore, type Tweet } from '../stores/twitter'

const twitterStore = useTwitterStore()
const loading = ref(true)
const showComposeModal = ref(false)
const tweets = ref<Tweet[]>([])
const filterStatus = ref('all')
const searchQuery = ref('')

// New tweet form
const newTweet = ref({
  accountId: '',
  content: '',
  mediaUrls: [] as string[],
  scheduledFor: ''
})
const isScheduling = ref(false)
const formError = ref('')
const submitting = ref(false)

// Get account options for dropdown
const accountOptions = computed(() => {
  return twitterStore.accounts
    .filter(account => account.isActive)
    .map(account => ({
      id: account.id,
      username: account.username
    }))
})

// Handle media upload
const uploadedFiles = ref<string[]>([])
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    // In a real application, you would upload these files to your server or directly to Twitter
    // For this demo, we'll just use placeholder URLs
    const newFile = `https://picsum.photos/500/300?random=${Math.random()}`
    uploadedFiles.value.push(newFile)
    newTweet.value.mediaUrls.push(newFile)
  }
}

const removeUploadedFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
  newTweet.value.mediaUrls.splice(index, 1)
}

// Filter tweets
const filteredTweets = computed(() => {
  let result = [...tweets.value]
  
  // Filter by status
  if (filterStatus.value !== 'all') {
    result = result.filter(tweet => tweet.status === filterStatus.value)
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(tweet => 
      tweet.content.toLowerCase().includes(query) || 
      twitterStore.accounts.find(a => a.id === tweet.accountId)?.username.toLowerCase().includes(query)
    )
  }
  
  return result
})

// Create new tweet
const submitTweet = async () => {
  formError.value = ''
  
  // Validate form
  if (!newTweet.value.accountId) {
    formError.value = 'Please select an account'
    return
  }
  
  if (!newTweet.value.content.trim()) {
    formError.value = 'Tweet content cannot be empty'
    return
  }
  
  if (isScheduling.value && !newTweet.value.scheduledFor) {
    formError.value = 'Please select a date and time for scheduling'
    return
  }
  
  try {
    submitting.value = true
    
    const result = await twitterStore.createTweet(
      newTweet.value.accountId,
      newTweet.value.content,
      newTweet.value.mediaUrls.length > 0 ? newTweet.value.mediaUrls : undefined,
      isScheduling.value ? newTweet.value.scheduledFor : undefined
    )
    
    if (result) {
      // Reset form and close modal
      newTweet.value = {
        accountId: '',
        content: '',
        mediaUrls: [],
        scheduledFor: ''
      }
      uploadedFiles.value = []
      isScheduling.value = false
      showComposeModal.value = false
      
      // Add the new tweet to our list
      tweets.value.unshift(result)
    }
  } catch (error) {
    console.error('Failed to create tweet:', error)
    formError.value = 'Failed to create tweet. Please try again.'
  } finally {
    submitting.value = false
  }
}

// Format tweet date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date)
}

// Get account username by ID
const getAccountUsername = (accountId: string) => {
  const account = twitterStore.accounts.find(a => a.id === accountId)
  return account ? account.username : 'Unknown'
}

// Load tweets
onMounted(async () => {
  try {
    // Ensure accounts are loaded
    if (twitterStore.accounts.length === 0) {
      await twitterStore.fetchAccounts()
    }
    
    // Load tweets
    await twitterStore.fetchTweets()
    tweets.value = [...twitterStore.tweets]
  } catch (error) {
    console.error('Failed to load tweets:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="relative">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">Tweets</h1>
        <p class="text-gray-600 dark:text-gray-300">
          Manage and schedule tweets for your accounts
        </p>
      </div>
      <button 
        @click="showComposeModal = true"
        class="btn-primary mt-4 sm:mt-0 inline-flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Compose Tweet
      </button>
    </div>
    
    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Search -->
        <div class="relative md:w-1/3">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search tweets..."
            class="input pl-10"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <!-- Status filter -->
        <div class="flex space-x-2">
          <button 
            @click="filterStatus = 'all'"
            class="px-3 py-2 text-sm rounded-md transition-colors duration-200"
            :class="filterStatus === 'all' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
          >
            All
          </button>
          <button 
            @click="filterStatus = 'published'"
            class="px-3 py-2 text-sm rounded-md transition-colors duration-200"
            :class="filterStatus === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
          >
            Published
          </button>
          <button 
            @click="filterStatus = 'scheduled'"
            class="px-3 py-2 text-sm rounded-md transition-colors duration-200"
            :class="filterStatus === 'scheduled' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
          >
            Scheduled
          </button>
          <button 
            @click="filterStatus = 'draft'"
            class="px-3 py-2 text-sm rounded-md transition-colors duration-200"
            :class="filterStatus === 'draft' ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
          >
            Drafts
          </button>
          <button 
            @click="filterStatus = 'failed'"
            class="px-3 py-2 text-sm rounded-md transition-colors duration-200"
            :class="filterStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
          >
            Failed
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tweets list -->
    <div class="space-y-4">
      <div v-if="loading" class="flex justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-cuc-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <div v-else-if="filteredTweets.length === 0" class="text-center py-12">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-1">No tweets found</h3>
        <p class="text-gray-500 dark:text-gray-400">
          Try changing your filters or create a new tweet
        </p>
      </div>
      
      <div v-else>
        <div v-for="tweet in filteredTweets" :key="tweet.id" class="card hover:shadow-card-hover transition-all duration-300">
          <div class="flex justify-between mb-4">
            <div class="flex items-center">
              <span 
                class="px-2 py-1 text-xs rounded-full" 
                :class="tweet.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        tweet.status === 'scheduled' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                        tweet.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
              >
                {{ tweet.status.charAt(0).toUpperCase() + tweet.status.slice(1) }}
              </span>
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
                @{{ getAccountUsername(tweet.accountId) }}
              </span>
            </div>
            
            <div class="text-sm text-gray-500 dark:text-gray-400">
              {{ tweet.status === 'scheduled' ? 'Scheduled for: ' + formatDate(tweet.scheduledFor || '') : formatDate(tweet.createdAt) }}
            </div>
          </div>
          
          <p class="text-gray-800 dark:text-gray-200 mb-4">{{ tweet.content }}</p>
          
          <!-- Media -->
          <div v-if="tweet.mediaUrls && tweet.mediaUrls.length > 0" class="mb-4">
            <div class="grid grid-cols-1 gap-2" :class="tweet.mediaUrls.length > 1 ? 'sm:grid-cols-2' : ''">
              <img 
                v-for="(url, index) in tweet.mediaUrls" 
                :key="index" 
                :src="url" 
                :alt="`Media for tweet ${tweet.id}`" 
                class="rounded-lg w-full h-48 object-cover"
              />
            </div>
          </div>
          
          <!-- Stats for published tweets -->
          <div v-if="tweet.status === 'published' && tweet.stats" class="grid grid-cols-4 gap-2 mb-4 py-3 border-t border-b border-gray-100 dark:border-gray-700">
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">Likes</p>
              <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ tweet.stats.likes }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">Retweets</p>
              <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ tweet.stats.retweets }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">Replies</p>
              <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ tweet.stats.replies }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500 dark:text-gray-400">Impressions</p>
              <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ tweet.stats.impressions }}</p>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div class="flex justify-end space-x-2">
            <button class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </button>
            <button class="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Compose Tweet Modal -->
    <div v-if="showComposeModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showComposeModal = false"></div>
      
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 z-10 overflow-hidden animate-fade-in">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">Compose New Tweet</h2>
            <button @click="showComposeModal = false" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="submitTweet">
            <!-- Validation error -->
            <div v-if="formError" class="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {{ formError }}
            </div>
            
            <!-- Account selection -->
            <div class="mb-4">
              <label for="account" class="label">Twitter Account</label>
              <select 
                id="account" 
                v-model="newTweet.accountId" 
                class="input"
              >
                <option value="" disabled>Select an account</option>
                <option v-for="account in accountOptions" :key="account.id" :value="account.id">
                  @{{ account.username }}
                </option>
              </select>
            </div>
            
            <!-- Tweet content -->
            <div class="mb-4">
              <label for="content" class="label">Tweet Content</label>
              <textarea 
                id="content" 
                v-model="newTweet.content" 
                rows="4" 
                class="input resize-none"
                placeholder="What's happening?"
                maxlength="280"
              ></textarea>
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{{ 280 - newTweet.content.length }} characters remaining</span>
                <span>Add hashtags with #</span>
              </div>
            </div>
            
            <!-- Media uploads -->
            <div class="mb-4">
              <label class="label">Media</label>
              
              <div v-if="uploadedFiles.length > 0" class="grid grid-cols-2 gap-2 mb-2">
                <div v-for="(file, index) in uploadedFiles" :key="index" class="relative">
                  <img :src="file" class="h-24 w-full object-cover rounded-md" alt="Uploaded media" />
                  <button 
                    type="button"
                    @click="removeUploadedFile(index)"
                    class="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <label 
                class="block w-full px-4 py-2 border border-gray-300 border-dashed rounded-md text-center cursor-pointer text-gray-600 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm">Click to upload photo or video</span>
                <input type="file" class="hidden" accept="image/*,video/*" @change="handleFileUpload" />
              </label>
            </div>
            
            <!-- Schedule toggle -->
            <div class="flex items-center mb-4">
              <input 
                id="schedule" 
                v-model="isScheduling" 
                type="checkbox" 
                class="h-4 w-4 text-cuc-red-600 focus:ring-cuc-red-500 border-gray-300 rounded"
              />
              <label for="schedule" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Schedule for later
              </label>
            </div>
            
            <!-- Schedule datetime -->
            <div v-if="isScheduling" class="mb-4">
              <label for="scheduled_time" class="label">Schedule Date and Time</label>
              <input 
                id="scheduled_time" 
                v-model="newTweet.scheduledFor" 
                type="datetime-local" 
                class="input"
              />
            </div>
            
            <!-- Form buttons -->
            <div class="flex justify-end space-x-3">
              <button 
                type="button"
                @click="showComposeModal = false"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="btn-primary flex items-center"
                :disabled="submitting"
              >
                <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ submitting ? 'Sending...' : (isScheduling ? 'Schedule Tweet' : 'Send Tweet') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>