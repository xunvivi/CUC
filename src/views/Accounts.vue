<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTwitterStore, type TwitterAccount } from '../stores/twitter'

const twitterStore = useTwitterStore()
const loading = ref(true)
const showAddModal = ref(false)
const newAccount = ref({
  username: '',
  accessToken: '',
  accessSecret: ''
})
const validationError = ref('')
const addLoading = ref(false)

// Form validation
const validateForm = () => {
  if (!newAccount.value.username) {
    validationError.value = 'Username is required'
    return false
  }
  if (!newAccount.value.accessToken) {
    validationError.value = 'Access Token is required'
    return false
  }
  if (!newAccount.value.accessSecret) {
    validationError.value = 'Access Token Secret is required'
    return false
  }
  return true
}

// Add new account
const addAccount = async () => {
  validationError.value = ''
  
  if (!validateForm()) {
    return
  }
  
  try {
    addLoading.value = true
    await twitterStore.addAccount(
      newAccount.value.username,
      newAccount.value.accessToken,
      newAccount.value.accessSecret
    )
    
    // Reset form and close modal
    newAccount.value = {
      username: '',
      accessToken: '',
      accessSecret: ''
    }
    showAddModal.value = false
  } catch (error) {
    console.error('Failed to add account:', error)
  } finally {
    addLoading.value = false
  }
}

// Toggle account status
const toggleAccountStatus = (account: TwitterAccount) => {
  account.isActive = !account.isActive
  // In a real application, this would call an API to update the account status
}

// Load accounts
onMounted(async () => {
  try {
    await twitterStore.fetchAccounts()
  } catch (error) {
    console.error('Failed to load accounts:', error)
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
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">Twitter Accounts</h1>
        <p class="text-gray-600 dark:text-gray-300">
          Manage all your connected Twitter accounts
        </p>
      </div>
      <button 
        @click="showAddModal = true"
        class="btn-primary mt-4 sm:mt-0 inline-flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Twitter Account
      </button>
    </div>
    
    <!-- Accounts list -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="account in twitterStore.accounts" :key="account.id" 
           class="card hover:shadow-card-hover transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center">
            <img 
              :src="account.profileImage" 
              :alt="account.username" 
              class="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm"
            />
            <div class="ml-3">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">
                @{{ account.username }}
              </h3>
              <div class="flex items-center">
                <span 
                  class="text-xs px-2 py-1 rounded-full" 
                  :class="account.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                             'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'"
                >
                  {{ account.isActive ? 'Active' : 'Inactive' }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  Last synced: {{ new Date(account.lastSyncedAt).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="relative">
            <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Account stats -->
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">Followers</p>
            <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ account.followerCount.toLocaleString() }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">Following</p>
            <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ account.followingCount.toLocaleString() }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400">Tweets</p>
            <p class="text-lg font-semibold text-gray-800 dark:text-white">{{ account.tweetCount.toLocaleString() }}</p>
          </div>
        </div>
        
        <!-- Action buttons -->
        <div class="flex justify-between">
          <button 
            @click="toggleAccountStatus(account)"
            class="px-4 py-2 text-sm rounded-md transition-colors duration-200"
            :class="account.isActive ? 
              'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30' : 
              'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'"
          >
            {{ account.isActive ? 'Deactivate' : 'Activate' }}
          </button>
          
          <div class="flex space-x-2">
            <button class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Add account card -->
      <div 
        @click="showAddModal = true"
        class="card flex flex-col items-center justify-center min-h-[250px] border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-cuc-red-300 dark:hover:border-cuc-red-700 cursor-pointer transition-colors duration-300"
      >
        <div class="w-16 h-16 rounded-full bg-cuc-red-50 dark:bg-cuc-red-900/20 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-cuc-red-600 dark:text-cuc-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-1">Add New Account</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
          Connect a new Twitter account to your dashboard
        </p>
      </div>
    </div>
    
    <!-- Add Account Modal -->
    <div v-if="showAddModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddModal = false"></div>
      
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 z-10 overflow-hidden animate-fade-in">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white">Add Twitter Account</h2>
            <button @click="showAddModal = false" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="addAccount">
            <!-- Validation error -->
            <div v-if="validationError" class="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {{ validationError }}
            </div>
            
            <!-- Username field -->
            <div class="mb-4">
              <label for="username" class="label">Twitter Username</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">@</span>
                <input 
                  id="username" 
                  v-model="newAccount.username" 
                  type="text" 
                  class="input pl-8"
                  placeholder="username"
                />
              </div>
            </div>
            
            <!-- Access Token field -->
            <div class="mb-4">
              <label for="access_token" class="label">Access Token</label>
              <input 
                id="access_token" 
                v-model="newAccount.accessToken" 
                type="text" 
                class="input"
                placeholder="Enter Twitter API access token"
              />
            </div>
            
            <!-- Access Token Secret field -->
            <div class="mb-4">
              <label for="access_secret" class="label">Access Token Secret</label>
              <input 
                id="access_secret" 
                v-model="newAccount.accessSecret" 
                type="password" 
                class="input"
                placeholder="Enter access token secret"
              />
            </div>
            
            <!-- Info message -->
            <div class="mb-6 p-3 bg-blue-50 text-blue-700 text-sm rounded-md dark:bg-blue-900/20 dark:text-blue-400">
              <p>You can find your Twitter API credentials in the <a href="#" class="underline">Twitter Developer Portal</a>.</p>
            </div>
            
            <!-- Form buttons -->
            <div class="flex justify-end space-x-3">
              <button 
                type="button"
                @click="showAddModal = false"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="btn-primary flex items-center"
                :disabled="addLoading"
              >
                <svg v-if="addLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ addLoading ? 'Adding...' : 'Add Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>