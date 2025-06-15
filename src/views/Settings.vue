<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const loading = ref(false)
const success = ref(false)
const error = ref('')

// User settings
const settings = ref({
  profile: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: ''
  },
  notifications: {
    email: true,
    browser: true,
    automationAlerts: true,
    weeklyReport: true
  },
  automation: {
    maxDailyTweets: 15,
    pauseAutomation: false,
    allowRetweets: true,
    allowLikes: true,
    allowReplies: true
  },
  api: {
    apiKey: 'sk-*******************',
    webhookUrl: '',
    allowExternalApps: false
  }
})

// Save settings
const saveSettings = async (section: string) => {
  loading.value = true
  error.value = ''
  success.value = false
  
  try {
    // Validate password match if attempting to change it
    if (section === 'profile' && 
        settings.value.profile.password && 
        settings.value.profile.password !== settings.value.profile.confirmPassword) {
      error.value = 'Passwords do not match'
      return
    }
    
    // In a real app, this would call your backend API
    // Simulating an API call for this example
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to save settings'
  } finally {
    loading.value = false
    
    // Reset success message after 3 seconds
    if (success.value) {
      setTimeout(() => {
        success.value = false
      }, 3000)
    }
  }
}

// Load user settings
onMounted(async () => {
  if (userStore.user) {
    settings.value.profile.username = userStore.user.username
    settings.value.profile.email = userStore.user.email
    settings.value.profile.avatar = userStore.user.avatar || ''
  } else {
    await userStore.fetchUserInfo()
    if (userStore.user) {
      settings.value.profile.username = userStore.user.username
      settings.value.profile.email = userStore.user.email
      settings.value.profile.avatar = userStore.user.avatar || ''
    }
  }
})

// Generate new API key
const generateApiKey = () => {
  // In a real app, this would call your backend API to generate a new key
  settings.value.api.apiKey = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
      <p class="text-gray-600 dark:text-gray-300">
        Manage your account and application settings
      </p>
    </div>
    
    <!-- Profile Settings -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-cuc-red-600 dark:text-cuc-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Profile Settings
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
          <div class="space-y-4">
            <!-- Username field -->
            <div>
              <label for="username" class="label">Username</label>
              <input 
                id="username" 
                v-model="settings.profile.username" 
                type="text" 
                class="input"
              />
            </div>
            
            <!-- Email field -->
            <div>
              <label for="email" class="label">Email</label>
              <input 
                id="email" 
                v-model="settings.profile.email" 
                type="email" 
                class="input"
              />
            </div>
            
            <!-- Password fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="password" class="label">New Password</label>
                <input 
                  id="password" 
                  v-model="settings.profile.password" 
                  type="password" 
                  class="input"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label for="confirm_password" class="label">Confirm Password</label>
                <input 
                  id="confirm_password" 
                  v-model="settings.profile.confirmPassword" 
                  type="password" 
                  class="input"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col items-center">
          <div class="mb-4">
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
              <img 
                v-if="settings.profile.avatar" 
                :src="settings.profile.avatar" 
                alt="Profile picture" 
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-cuc-red-100 text-cuc-red-600 flex items-center justify-center">
                <span class="text-4xl font-medium">{{ settings.profile.username?.charAt(0).toUpperCase() || 'U' }}</span>
              </div>
            </div>
          </div>
          <button class="btn-secondary text-sm">
            Change Avatar
          </button>
        </div>
      </div>
      
      <!-- Messages -->
      <div v-if="error" class="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {{ error }}
      </div>
      <div v-if="success" class="mt-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400">
        Settings saved successfully!
      </div>
      
      <!-- Save button -->
      <div class="mt-6 flex justify-end">
        <button 
          @click="saveSettings('profile')" 
          class="btn-primary inline-flex items-center"
          :disabled="loading"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ loading ? 'Saving...' : 'Save Profile' }}
        </button>
      </div>
    </div>
    
    <!-- Notification Settings -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-cuc-red-600 dark:text-cuc-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Notification Settings
      </h2>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-800 dark:text-white">Email Notifications</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Receive email notifications for important events</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="settings.notifications.email" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cuc-red-300 dark:peer-focus:ring-cuc-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cuc-red-600"></div>
          </label>
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-800 dark:text-white">Browser Notifications</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Receive browser notifications for real-time updates</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="settings.notifications.browser" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cuc-red-300 dark:peer-focus:ring-cuc-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cuc-red-600"></div>
          </label>
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-800 dark:text-white">Automation Alerts</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Get notified when automation rules are triggered</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="settings.notifications.automationAlerts" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cuc-red-300 dark:peer-focus:ring-cuc-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cuc-red-600"></div>
          </label>
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-800 dark:text-white">Weekly Report</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Receive a weekly analytics report by email</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="settings.notifications.weeklyReport" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cuc-red-300 dark:peer-focus:ring-cuc-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cuc-red-600"></div>
          </label>
        </div>
      </div>
      
      <!-- Save button -->
      <div class="mt-6 flex justify-end">
        <button 
          @click="saveSettings('notifications')" 
          class="btn-primary inline-flex items-center"
          :disabled="loading"
        >
          Save Notification Settings
        </button>
      </div>
    </div>
    
    <!-- Automation Settings -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-cuc-red-600 dark:text-cuc-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Automation Settings
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div class="space-y-4">
            <div>
              <label for="max_daily_tweets" class="label">Maximum Daily Tweets</label>
              <input 
                id="max_daily_tweets" 
                v-model="settings.automation.maxDailyTweets" 
                type="number" 
                min="1" 
                max="50" 
                class="input"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Limit the number of tweets that can be sent per day across all accounts
              </p>
            </div>
            
            <div class="flex items-center">
              <input 
                id="pause_automation" 
                v-model="settings.automation.pauseAutomation" 
                type="checkbox" 
                class="h-4 w-4 text-cuc-red-600 focus:ring-cuc-red-500 border-gray-300 rounded"
              />
              <label for="pause_automation" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Temporarily pause all automation
              </label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="font-medium text-gray-800 dark:text-white mb-3">Allowed Automation Actions</h3>
          <div class="space-y-2">
            <div class="flex items-center">
              <input 
                id="allow_retweets" 
                v-model="settings.automation.allowRetweets" 
                type="checkbox" 
                class="h-4 w-4 text-cuc-red-600 focus:ring-cuc-red-500 border-gray-300 rounded"
              />
              <label for="allow_retweets" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Allow automated retweets
              </label>
            </div>
            
            <div class="flex items-center">
              <input 
                id="allow_likes" 
                v-model="settings.automation.allowLikes" 
                type="checkbox" 
                class="h-4 w-4 text-cuc-red-600 focus:ring-cuc-red-500 border-gray-300 rounded"
              />
              <label for="allow_likes" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Allow automated likes
              </label>
            </div>
            
            <div class="flex items-center">
              <input 
                id="allow_replies" 
                v-model="settings.automation.allowReplies" 
                type="checkbox" 
                class="h-4 w-4 text-cuc-red-600 focus:ring-cuc-red-500 border-gray-300 rounded"
              />
              <label for="allow_replies" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Allow automated replies
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Save button -->
      <div class="mt-6 flex justify-end">
        <button 
          @click="saveSettings('automation')" 
          class="btn-primary inline-flex items-center"
          :disabled="loading"
        >
          Save Automation Settings
        </button>
      </div>
    </div>
    
    <!-- API Settings -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-cuc-red-600 dark:text-cuc-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        API Settings
      </h2>
      
      <div class="space-y-4">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-medium text-gray-800 dark:text-white">API Key</h3>
            <button 
              @click="generateApiKey"
              class="text-xs px-2 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded transition-colors duration-200"
            >
              Regenerate
            </button>
          </div>
          <div class="flex items-center">
            <input 
              v-model="settings.api.apiKey"
              type="text"
              readonly
              class="input bg-gray-100 dark:bg-gray-700 mr-2"
            />
            <button class="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Use this API key to authenticate API requests. Keep it secure.
          </p>
        </div>
        
        <div>
          <label for="webhook_url" class="label">Webhook URL</label>
          <input 
            id="webhook_url" 
            v-model="settings.api.webhookUrl" 
            type="text" 
            class="input"
            placeholder="https://"
          />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Receive real-time updates via webhook when tweets are published or engagement occurs
          </p>
        </div>
        
        <div class="flex items-center">
          <input 
            id="allow_external" 
            v-model="settings.api.allowExternalApps" 
            type="checkbox" 
            class="h-4 w-4 text-cuc-red-600 focus:ring-cuc-red-500 border-gray-300 rounded"
          />
          <label for="allow_external" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Allow external applications to access your accounts
          </label>
        </div>
      </div>
      
      <!-- Save button -->
      <div class="mt-6 flex justify-end">
        <button 
          @click="saveSettings('api')" 
          class="btn-primary inline-flex items-center"
          :disabled="loading"
        >
          Save API Settings
        </button>
      </div>
    </div>
  </div>
</template>