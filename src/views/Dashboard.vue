<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTwitterStore } from '../stores/twitter'
import { Bar, Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useUserStore } from '../stores/user'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const twitterStore = useTwitterStore()
const userStore = useUserStore()
const loading = ref(true)

// Data for charts
const engagementData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Likes',
      backgroundColor: '#FF4141',
      data: [65, 59, 80, 81, 56, 55, 40]
    },
    {
      label: 'Retweets',
      backgroundColor: '#4CAF50',
      data: [28, 48, 40, 19, 86, 27, 90]
    },
    {
      label: 'Replies',
      backgroundColor: '#2196F3',
      data: [12, 19, 3, 5, 2, 3, 7]
    }
  ]
})

const followerGrowthData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'CUC_Official',
      borderColor: '#E60000',
      backgroundColor: 'rgba(230, 0, 0, 0.1)',
      data: [10200, 10800, 11500, 11900, 12200, 12500],
      tension: 0.4,
      fill: true
    },
    {
      label: 'CUC_MediaLab',
      borderColor: '#1DA1F2',
      backgroundColor: 'rgba(29, 161, 242, 0.1)',
      data: [6700, 7100, 7500, 7900, 8300, 8720],
      tension: 0.4,
      fill: true
    }
  ]
})

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Weekly Engagement'
    }
  }
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Follower Growth'
    }
  }
}

// Recent activity
const recentActivity = ref([
  { type: 'tweet', account: 'CUC_Official', content: 'We are excited to announce our new media research lab opening next month!', time: '2 hours ago', engagement: 145 },
  { type: 'schedule', account: 'CUC_MediaLab', content: 'Join us this Saturday for the annual media showcase.', time: '5 hours ago', scheduledFor: 'Tomorrow at 9:00 AM' },
  { type: 'automation', account: 'CUC_Official', content: 'Automated rule triggered 12 likes on related media content', time: '1 day ago', count: 12 },
  { type: 'tweet', account: 'CUC_Research', content: 'Our research team has published a new paper on social media engagement.', time: '2 days ago', engagement: 98 }
])

// Stats counters
const totalTweets = ref(0)
const totalEngagement = ref(0)
const activeAccounts = ref(0)
const scheduledTweets = ref(0)

// Load data
onMounted(async () => {
  try {
    await twitterStore.fetchAccounts()
    await twitterStore.fetchTweets()
    
    // Calculate stats
    totalTweets.value = twitterStore.tweets.length
    totalEngagement.value = twitterStore.tweets.reduce((sum, tweet) => sum + ((tweet.stats?.likes || 0) + (tweet.stats?.retweets || 0) + (tweet.stats?.replies || 0)), 0)
    activeAccounts.value = twitterStore.accounts.filter(account => account.isActive).length
    scheduledTweets.value = twitterStore.tweets.filter(tweet => tweet.status === 'scheduled').length
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
})

const username = computed(() => userStore.user?.username || 'User')
</script>

<template>
  <div>
    <!-- Welcome section -->
    <div class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
        Welcome back, {{ username }}!
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        Here's what's happening with your Twitter accounts today
      </p>
    </div>
    
    <!-- Stats grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Tweets -->
      <div class="card bg-gradient-to-br from-white to-cuc-red-50 dark:from-gray-800 dark:to-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-cuc-red-100 dark:bg-cuc-red-900/30 text-cuc-red-600 dark:text-cuc-red-400 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Tweets</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalTweets }}</p>
          </div>
        </div>
      </div>
      
      <!-- Engagement -->
      <div class="card bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Engagement</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ totalEngagement }}</p>
          </div>
        </div>
      </div>
      
      <!-- Active Accounts -->
      <div class="card bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Active Accounts</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ activeAccounts }}</p>
          </div>
        </div>
      </div>
      
      <!-- Scheduled -->
      <div class="card bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Scheduled Tweets</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ scheduledTweets }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Charts & Activity section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Engagement chart -->
      <div class="card lg:col-span-2">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Engagement Analytics</h2>
        <div class="h-64">
          <Bar :data="engagementData" :options="barChartOptions" />
        </div>
      </div>
      
      <!-- Recent activity -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
        <div class="space-y-4">
          <div v-for="(activity, index) in recentActivity" :key="index" class="flex items-start pb-4 border-b border-gray-100 dark:border-gray-700 last:border-none">
            <!-- Activity icon -->
            <div class="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center mr-3" 
                :class="activity.type === 'tweet' ? 'bg-cuc-red-100 text-cuc-red-600 dark:bg-cuc-red-900/30 dark:text-cuc-red-400' : 
                        activity.type === 'schedule' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'">
              <svg v-if="activity.type === 'tweet'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <svg v-else-if="activity.type === 'schedule'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
            
            <!-- Activity details -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                @{{ activity.account }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-300 truncate">
                {{ activity.content }}
              </p>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ activity.time }}</span>
                <span v-if="activity.engagement" class="text-xs text-cuc-red-600 dark:text-cuc-red-400 font-medium">
                  {{ activity.engagement }} engagements
                </span>
                <span v-if="activity.scheduledFor" class="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {{ activity.scheduledFor }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Follower growth -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Follower Growth</h2>
      <div class="h-64">
        <Line :data="followerGrowthData" :options="lineChartOptions" />
      </div>
    </div>
  </div>
</template>