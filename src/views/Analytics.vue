<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTwitterStore } from '../stores/twitter'
import { Bar, Line, Pie } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const twitterStore = useTwitterStore()
const loading = ref(true)
const selectedAccount = ref('all')
const timeRange = ref('week')

// Data for charts
const followerGrowthData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'CUC_Official',
      borderColor: '#E60000',
      backgroundColor: 'rgba(230, 0, 0, 0.1)',
      data: [9500, 9800, 10100, 10500, 10900, 11200, 11500, 11800, 12100, 12300, 12400, 12500],
      tension: 0.4,
      fill: true
    },
    {
      label: 'CUC_MediaLab',
      borderColor: '#1DA1F2',
      backgroundColor: 'rgba(29, 161, 242, 0.1)',
      data: [6000, 6300, 6500, 6800, 7100, 7400, 7600, 7800, 8200, 8400, 8600, 8720],
      tension: 0.4,
      fill: true
    }
  ]
})

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

const contentTypeData = ref({
  labels: ['Text Only', 'With Image', 'With Video', 'With Link', 'Polls'],
  datasets: [
    {
      backgroundColor: ['#E60000', '#FFB800', '#36A2EB', '#4CAF50', '#9C27B0'],
      data: [35, 25, 15, 20, 5]
    }
  ]
})

const bestTimeData = ref({
  labels: ['6-9 AM', '9-12 PM', '12-3 PM', '3-6 PM', '6-9 PM', '9-12 AM', '12-6 AM'],
  datasets: [
    {
      label: 'Engagement Rate',
      backgroundColor: 'rgba(230, 0, 0, 0.7)',
      borderColor: '#E60000',
      borderWidth: 1,
      data: [3.2, 4.1, 4.5, 5.2, 4.8, 3.9, 2.1]
    }
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    }
  }
}

// Stats data
const overallStats = ref({
  totalFollowers: 26450,
  totalEngagement: 18750,
  avgEngagementRate: 4.2,
  totalImpressions: 125000
})

// Top tweets
const topTweets = ref([
  {
    content: 'We are excited to announce our new media research lab opening next month! #MediaInnovation #CUC',
    account: 'CUC_Official',
    engagement: 145,
    likes: 98,
    retweets: 32,
    replies: 15,
    date: '2023-10-15'
  },
  {
    content: 'Check out our students\' latest creative projects at the annual Media Showcase this weekend!',
    account: 'CUC_MediaLab',
    engagement: 112,
    likes: 76,
    retweets: 25,
    replies: 11,
    date: '2023-09-28'
  },
  {
    content: 'Our research team has published a new paper on social media engagement strategies in the digital age.',
    account: 'CUC_Research',
    engagement: 98,
    likes: 65,
    retweets: 22,
    replies: 11,
    date: '2023-10-05'
  }
])

// Audience demographics
const demographics = ref({
  age: {
    '18-24': 22,
    '25-34': 35,
    '35-44': 25,
    '45-54': 12,
    '55+': 6
  },
  gender: {
    'Male': 48,
    'Female': 47,
    'Other': 5
  },
  interests: [
    { name: 'Media & Communication', percentage: 78 },
    { name: 'Technology', percentage: 65 },
    { name: 'Education', percentage: 58 },
    { name: 'Arts & Culture', percentage: 45 },
    { name: 'Social Issues', percentage: 42 }
  ]
})

// Get account options
const accountOptions = computed(() => {
  return [
    { value: 'all', label: 'All Accounts' },
    ...twitterStore.accounts.map(account => ({
      value: account.id,
      label: '@' + account.username
    }))
  ]
})

// Get time range options
const timeRangeOptions = [
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'quarter', label: 'Past 3 Months' },
  { value: 'year', label: 'Past Year' }
]

// Update charts based on filters
const updateCharts = () => {
  // In a real app, this would fetch data based on the selected account and time range
  loading.value = true
  
  setTimeout(() => {
    // Simulate chart data update
    if (selectedAccount.value !== 'all') {
      // Filter data for a specific account
      followerGrowthData.value.datasets = followerGrowthData.value.datasets.filter(ds => 
        ds.label === twitterStore.accounts.find(a => a.id === selectedAccount.value)?.username
      )
    }
    
    // Update time range
    if (timeRange.value === 'week') {
      followerGrowthData.value.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    } else if (timeRange.value === 'month') {
      followerGrowthData.value.labels = Array.from({length: 30}, (_, i) => (i + 1).toString())
    }
    
    loading.value = false
  }, 500)
}

// Format number with commas
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Download analytics report
const downloadReport = () => {
  // In a real app, this would generate and download a PDF or CSV report
  alert('Analytics report download initialized!')
}

// Load data
onMounted(async () => {
  try {
    // Ensure accounts are loaded
    if (twitterStore.accounts.length === 0) {
      await twitterStore.fetchAccounts()
    }
    
    // In a real app, you would fetch analytics data here
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    loading.value = false
  } catch (error) {
    console.error('Failed to load analytics data:', error)
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">Analytics</h1>
        <p class="text-gray-600 dark:text-gray-300">
          Comprehensive analytics for your Twitter accounts
        </p>
      </div>
      <button 
        @click="downloadReport"
        class="btn-primary mt-4 sm:mt-0 inline-flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export Report
      </button>
    </div>
    
    <!-- Filters -->
    <div class="card mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <!-- Account selector -->
        <div class="sm:w-1/3">
          <label for="account_filter" class="label">Account</label>
          <select 
            id="account_filter" 
            v-model="selectedAccount" 
            class="input"
            @change="updateCharts"
          >
            <option v-for="option in accountOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Time range selector -->
        <div class="sm:w-1/3">
          <label for="time_range" class="label">Time Range</label>
          <select 
            id="time_range" 
            v-model="timeRange" 
            class="input"
            @change="updateCharts"
          >
            <option v-for="option in timeRangeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Stats grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- Total Followers -->
      <div class="card bg-gradient-to-br from-white to-cuc-red-50 dark:from-gray-800 dark:to-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-cuc-red-100 dark:bg-cuc-red-900/30 text-cuc-red-600 dark:text-cuc-red-400 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Followers</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ formatNumber(overallStats.totalFollowers) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Total Engagement -->
      <div class="card bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Engagement</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ formatNumber(overallStats.totalEngagement) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Engagement Rate -->
      <div class="card bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Avg. Engagement Rate</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ overallStats.avgEngagementRate }}%</p>
          </div>
        </div>
      </div>
      
      <!-- Impressions -->
      <div class="card bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Impressions</p>
            <p class="text-2xl font-bold text-gray-800 dark:text-white">{{ formatNumber(overallStats.totalImpressions) }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Charts section -->
    <div v-if="loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-cuc-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Follower Growth -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Follower Growth</h2>
        <div class="h-80">
          <Line :data="followerGrowthData" :options="chartOptions" />
        </div>
      </div>
      
      <!-- Engagement by Day -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Engagement by Day</h2>
        <div class="h-80">
          <Bar :data="engagementData" :options="chartOptions" />
        </div>
      </div>
      
      <!-- Content Performance -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Content Type Performance</h2>
        <div class="h-80">
          <Pie :data="contentTypeData" :options="chartOptions" />
        </div>
      </div>
      
      <!-- Best Time to Post -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Best Time to Post (Engagement Rate %)</h2>
        <div class="h-80">
          <Bar :data="bestTimeData" :options="chartOptions" />
        </div>
      </div>
    </div>
    
    <!-- Top Performing Tweets -->
    <div class="card mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Top Performing Tweets</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tweet</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Likes</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Retweets</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Replies</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Engagement</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(tweet, index) in topTweets" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-normal">
                <p class="text-sm text-gray-800 dark:text-gray-200">{{ tweet.content }}</p>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-600 dark:text-gray-400">@{{ tweet.account }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ new Date(tweet.date).toLocaleDateString() }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-cuc-red-600 dark:text-cuc-red-400 font-medium">{{ tweet.likes }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-green-600 dark:text-green-400 font-medium">{{ tweet.retweets }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-blue-600 dark:text-blue-400 font-medium">{{ tweet.replies }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-bold text-gray-800 dark:text-white">{{ tweet.engagement }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Audience Demographics -->
    <div class="card">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Audience Demographics</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Age distribution -->
        <div>
          <h3 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Age Distribution</h3>
          <div class="space-y-2">
            <div v-for="(percentage, age) in demographics.age" :key="age" class="flex items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400 w-16">{{ age }}</span>
              <div class="flex-1 mx-2">
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-cuc-red-600 dark:bg-cuc-red-500" :style="`width: ${percentage}%`"></div>
                </div>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ percentage }}%</span>
            </div>
          </div>
        </div>
        
        <!-- Gender distribution -->
        <div>
          <h3 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Gender Distribution</h3>
          <div class="space-y-2">
            <div v-for="(percentage, gender) in demographics.gender" :key="gender" class="flex items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400 w-16">{{ gender }}</span>
              <div class="flex-1 mx-2">
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    class="h-full" 
                    :class="gender === 'Male' ? 'bg-blue-500' : gender === 'Female' ? 'bg-pink-500' : 'bg-purple-500'"
                    :style="`width: ${percentage}%`"
                  ></div>
                </div>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ percentage }}%</span>
            </div>
          </div>
        </div>
        
        <!-- Interests -->
        <div>
          <h3 class="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Top Interests</h3>
          <div class="space-y-2">
            <div v-for="interest in demographics.interests" :key="interest.name" class="flex items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400 w-32 truncate">{{ interest.name }}</span>
              <div class="flex-1 mx-2">
                <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-cuc-red-500 to-cuc-gold-500" :style="`width: ${interest.percentage}%`"></div>
                </div>
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ interest.percentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>