import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface TwitterAccount {
  id: string
  username: string
  profileImage: string
  isActive: boolean
  followerCount: number
  followingCount: number
  tweetCount: number
  lastSyncedAt: string
}

export interface BotAccount {
  id: string
  username: string
  isActive: boolean
}

export interface Tweet {
  id: string
  accountId: string
  content: string
  mediaUrls?: string[]
  scheduledFor?: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  createdAt: string
  updatedAt: string
  stats?: {
    likes: number
    retweets: number
    replies: number
    impressions: number
  }
}

export interface AutomationRule {
  id: string
  accountId: string
  type: 'like' | 'retweet' | 'reply'
  criteria: {
    keywords?: string[]
    users?: string[]
    hashtags?: string[]
  }
  action: {
    template?: string
    rate: 'low' | 'medium' | 'high'
    isActive: boolean
  }
  createdAt: string
}

export interface Strategy {
  id: string
  name: string
  botAccountIds: string[]
  targetType: 'account' | 'tweet' | 'comment'
  targetId: string
  actions: Array<{
    type: 'like' | 'retweet' | 'reply'
    count: number
    schedule: string
    replyTemplate?: string
    botIds: string[]
  }>
  isActive: boolean
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: string
  results: {
    likes: number
    retweets: number
    replies: number
    botLoss: number
    timestamp: string
    operationStats: Array<{
      type: 'like' | 'retweet' | 'reply'
      botCount: number
      plannedCount: number
      actualCount: number
      botLoss: number
      botLossRate: number
    }>
    totalBotLossRate: number
  } | null
  showResults?: boolean
}

export const useTwitterStore = defineStore('twitter', () => {
  const accounts = ref<TwitterAccount[]>([])
  const botAccounts = ref<BotAccount[]>([])
  const tweets = ref<Tweet[]>([])
  const automationRules = ref<AutomationRule[]>([])
  const strategies = ref<Strategy[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeAccounts = computed(() => accounts.value.filter(account => account.isActive))
  const activeBotAccounts = computed(() => botAccounts.value.filter(account => account.isActive))

  // Mock data for accounts
  const mockAccounts: TwitterAccount[] = [
    {
      id: '1',
      username: 'CUC_Official',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      isActive: true,
      followerCount: 12500,
      followingCount: 450,
      tweetCount: 2340,
      lastSyncedAt: new Date().toISOString()
    },
    {
      id: '2',
      username: 'CUC_MediaLab',
      profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      isActive: true,
      followerCount: 8720,
      followingCount: 980,
      tweetCount: 1870,
      lastSyncedAt: new Date().toISOString()
    },
    {
      id: '3',
      username: 'CUC_Research',
      profileImage: 'https://randomuser.me/api/portraits/men/67.jpg',
      isActive: false,
      followerCount: 5230,
      followingCount: 342,
      tweetCount: 920,
      lastSyncedAt: new Date().toISOString()
    }
  ]

  // Mock data for bot accounts
  const mockBotAccounts: BotAccount[] = [
    {
      id: 'bot1',
      username: 'Bot1',
      isActive: true
    },
    {
      id: 'bot2',
      username: 'Bot2',
      isActive: true
    },
    {
      id: 'bot3',
      username: 'Bot3',
      isActive: false
    }
  ]

  async function fetchAccounts() {
    try {
      loading.value = true
      error.value = null
      await new Promise(resolve => setTimeout(resolve, 800))
      accounts.value = mockAccounts
      return accounts.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch accounts'
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchBotAccounts() {
    try {
      loading.value = true
      error.value = null
      await new Promise(resolve => setTimeout(resolve, 800))
      botAccounts.value = mockBotAccounts
      return botAccounts.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch bot accounts'
      return []
    } finally {
      loading.value = false
    }
  }

  async function addAccount(username: string, accessToken: string, accessSecret: string) {
    try {
      loading.value = true
      error.value = null
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newAccount: TwitterAccount = {
        id: (accounts.value.length + 1).toString(),
        username,
        profileImage: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 100)}.jpg`,
        isActive: true,
        followerCount: Math.floor(Math.random() * 10000),
        followingCount: Math.floor(Math.random() * 1000),
        tweetCount: Math.floor(Math.random() * 3000),
        lastSyncedAt: new Date().toISOString()
      }
      accounts.value.push(newAccount)
      return newAccount
    } catch (err: any) {
      error.value = err.message || 'Failed to add account'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchTweets() {
    try {
      loading.value = true
      error.value = null
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockTweets: Tweet[] = [
        {
          id: '1',
          accountId: '1',
          content: 'We are excited to announce our new media research lab opening next month! #MediaInnovation #CUC',
          status: 'published',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          stats: {
            likes: 145,
            retweets: 32,
            replies: 12,
            impressions: 2800
          }
        },
        {
          id: '2',
          accountId: '1',
          content: 'Join us this Saturday for the annual media showcase where our students will present their latest projects! #CUCShowcase',
          mediaUrls: ['https://picsum.photos/500/300'],
          status: 'scheduled',
          scheduledFor: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          accountId: '2',
          content: 'Our research team has published a new paper on social media engagement strategies in the digital age.',
          status: 'published',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          stats: {
            likes: 98,
            retweets: 25,
            replies: 5,
            impressions: 1900
          }
        }
      ]
      tweets.value = mockTweets
      return tweets.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch tweets'
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchAutomationRules() {
    try {
      loading.value = true
      error.value = null
      await new Promise(resolve => setTimeout(resolve, 800))
      const mockRules: AutomationRule[] = [
        {
          id: '1',
          accountId: '1',
          type: 'like',
          criteria: {
            keywords: ['media', 'communication', 'journalism', 'CUC'],
            hashtags: ['#MediaStudies', '#Journalism']
          },
          action: {
            rate: 'medium',
            isActive: true
          },
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          accountId: '1',
          type: 'retweet',
          criteria: {
            users: ['@MediaStudies', '@JournalismDaily'],
            hashtags: ['#MediaInnovation']
          },
          action: {
            rate: 'low',
            isActive: true
          },
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '3',
          accountId: '2',
          type: 'reply',
          criteria: {
            keywords: ['research', 'media lab', 'CUC'],
          },
          action: {
            template: 'Thank you for mentioning our research! Feel free to check out more at our website.',
            rate: 'low',
            isActive: false
          },
          createdAt: new Date(Date.now() - 259200000).toISOString()
        }
      ]
      automationRules.value = mockRules
      return automationRules.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch automation rules'
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchStrategies() {
    try {
      loading.value = true
      error.value = null
      await new Promise(resolve => setTimeout(resolve, 800))
      strategies.value = []
      return strategies.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch strategies'
      return []
    } finally {
      loading.value = false
    }
  }

  async function createTweet(accountId: string, content: string, mediaUrls?: string[], scheduledFor?: string) {
    try {
      loading.value = true
      error.value = null
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newTweet: Tweet = {
        id: (tweets.value.length + 1).toString(),
        accountId,
        content,
        mediaUrls,
        status: scheduledFor ? 'scheduled' : 'published',
        scheduledFor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: scheduledFor ? undefined : {
          likes: 0,
          retweets: 0,
          replies: 0,
          impressions: 0
        }
      }
      tweets.value.push(newTweet)
      return newTweet
    } catch (err: any) {
      error.value = err.message || 'Failed to create tweet'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    accounts,
    botAccounts,
    tweets,
    automationRules,
    strategies,
    loading,
    error,
    activeAccounts,
    activeBotAccounts,
    fetchAccounts,
    fetchBotAccounts,
    addAccount,
    fetchTweets,
    fetchAutomationRules,
    fetchStrategies,
    createTweet
  }
})