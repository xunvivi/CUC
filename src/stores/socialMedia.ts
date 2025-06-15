import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SocialAccount {
  id: string
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok'
  username: string
  displayName: string
  profileImage: string
  isConnected: boolean
  followerCount: number
  followingCount: number
  postsCount: number
  lastSyncedAt: Date
  accessToken?: string
  refreshToken?: string
}

export interface ContentGenerationRequest {
  topic: string
  platform: string
  tone: 'professional' | 'casual' | 'humorous' | 'inspiring'
  length: 'short' | 'medium' | 'long'
  keywords?: string[]
  targetAudience?: string
}

export interface CommentGenerationRequest {
  originalPost: string
  commentType: 'supportive' | 'questioning' | 'informative' | 'engaging'
  tone: 'friendly' | 'professional' | 'witty'
  context?: string
}

export interface ContentEvaluation {
  culturalFitScore: number
  viralityScore: number
  engagementScore: number
  sentimentScore: number
  suggestions: string[]
  wordReplacements: { original: string; suggested: string; reason: string }[]
  overallFeedback: string
  riskFactors: string[]
  recommendedTags: string[]
}

export interface PublishRequest {
  content: string
  accounts: string[]
  scheduledTime?: Date
  tags?: string[]
  mediaUrls?: string[]
}

export const useSocialMediaStore = defineStore('socialMedia', () => {
  // State
  const accounts = ref<SocialAccount[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const generatedContent = ref('')
  const generatedComment = ref('')
  const currentEvaluation = ref<ContentEvaluation | null>(null)
  
  // API配置
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
  
  // Computed
  const connectedAccounts = computed(() => 
    accounts.value.filter(account => account.isConnected)
  )
  
  const accountsByPlatform = computed(() => {
    const grouped: Record<string, SocialAccount[]> = {}
    accounts.value.forEach(account => {
      if (!grouped[account.platform]) {
        grouped[account.platform] = []
      }
      grouped[account.platform].push(account)
    })
    return grouped
  })
  
  // Actions
  const fetchAccounts = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/accounts`)
      if (!response.ok) throw new Error('获取账户列表失败')
      
      const data = await response.json()
      accounts.value = data.map((account: any) => ({
        ...account,
        lastSyncedAt: new Date(account.lastSyncedAt)
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      // 模拟数据作为后备
      accounts.value = [
        {
          id: '1',
          platform: 'twitter',
          username: 'example_user',
          displayName: 'Example User',
          profileImage: 'https://via.placeholder.com/64',
          isConnected: true,
          followerCount: 1250,
          followingCount: 890,
          postsCount: 456,
          lastSyncedAt: new Date()
        },
        {
          id: '2',
          platform: 'facebook',
          username: 'example_page',
          displayName: 'Example Page',
          profileImage: 'https://via.placeholder.com/64',
          isConnected: false,
          followerCount: 3200,
          followingCount: 120,
          postsCount: 234,
          lastSyncedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ]
    } finally {
      isLoading.value = false
    }
  }
  
  const generateContent = async (request: ContentGenerationRequest): Promise<string> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/content/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      
      if (!response.ok) throw new Error('内容生成失败')
      
      const data = await response.json()
      generatedContent.value = data.content
      return data.content
    } catch (err) {
      error.value = err instanceof Error ? err.message : '内容生成失败'
      
      // 模拟生成内容
      const sampleContents = {
        twitter: `🚀 探索${request.topic}的无限可能！在这个快速变化的时代，我们需要保持学习和创新的心态。#${request.topic} #创新思维`,
        facebook: `今天想和大家分享关于${request.topic}的一些思考。这个话题不仅影响着我们的日常生活，更关系到未来的发展方向。让我们一起来讨论吧！`,
        instagram: `✨ ${request.topic}带来的灵感时刻 ✨\n\n每一次探索都是成长的机会，每一个发现都值得庆祝。\n\n#${request.topic} #inspiration #growth`,
        linkedin: `在专业领域中，${request.topic}正在重塑我们的工作方式。作为行业从业者，我认为我们需要积极拥抱这些变化，并从中寻找新的机遇。`
      }
      
      const content = sampleContents[request.platform as keyof typeof sampleContents] || sampleContents.twitter
      generatedContent.value = content
      return content
    } finally {
      isLoading.value = false
    }
  }
  
  const generateComment = async (request: CommentGenerationRequest): Promise<string> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/comment/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      
      if (!response.ok) throw new Error('评论生成失败')
      
      const data = await response.json()
      generatedComment.value = data.comment
      return data.comment
    } catch (err) {
      error.value = err instanceof Error ? err.message : '评论生成失败'
      
      // 模拟生成评论
      const sampleComments = {
        supportive: `非常赞同您的观点！这个话题确实值得深入思考。期待看到更多相关的分享。👍`,
        questioning: `这是一个有趣的角度，不过我想问一下，您认为在实际应用中会遇到什么挑战呢？`,
        informative: `补充一个相关信息：最近的研究表明，这个领域正在经历快速发展，建议大家关注最新动态。`,
        engaging: `太棒了！这让我想起了之前的一次经历... 大家有类似的体验吗？来聊聊吧！💬`
      }
      
      const comment = sampleComments[request.commentType]
      generatedComment.value = comment
      return comment
    } finally {
      isLoading.value = false
    }
  }
  
  const evaluateContent = async (content: string): Promise<ContentEvaluation> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/content/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      if (!response.ok) throw new Error('内容评估失败')
      
      const evaluation = await response.json()
      currentEvaluation.value = evaluation
      return evaluation
    } catch (err) {
      error.value = err instanceof Error ? err.message : '内容评估失败'
      
      // 模拟评估结果
      const evaluation: ContentEvaluation = {
        culturalFitScore: Math.floor(Math.random() * 30) + 70,
        viralityScore: Math.floor(Math.random() * 40) + 60,
        engagementScore: Math.floor(Math.random() * 35) + 65,
        sentimentScore: Math.floor(Math.random() * 25) + 75,
        suggestions: [
          '增加更多情感色彩的词汇以提高参与度',
          '考虑加入当前热门话题标签',
          '可以添加问句来鼓励用户互动',
          '建议在适当位置添加表情符号'
        ],
        wordReplacements: [
          { original: '思考', suggested: '深度思考', reason: '增强表达强度' },
          { original: '发展', suggested: '蓬勃发展', reason: '更具感染力' },
          { original: '机会', suggested: '绝佳机会', reason: '提升吸引力' }
        ],
        overallFeedback: '内容整体质量良好，具有一定的传播潜力。建议适当增加互动元素和情感表达，以提高用户参与度。',
        riskFactors: [],
        recommendedTags: ['#创新', '#思考', '#分享', '#成长']
      }
      
      currentEvaluation.value = evaluation
      return evaluation
    } finally {
      isLoading.value = false
    }
  }
  
  const publishContent = async (request: PublishRequest): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/content/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      
      if (!response.ok) throw new Error('内容发布失败')
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '内容发布失败'
      
      // 模拟发布成功
      await new Promise(resolve => setTimeout(resolve, 2000))
      return true
    } finally {
      isLoading.value = false
    }
  }
  
  const connectAccount = async (platform: string, credentials: any): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, credentials })
      })
      
      if (!response.ok) throw new Error('账户连接失败')
      
      // 刷新账户列表
      await fetchAccounts()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '账户连接失败'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  const disconnectAccount = async (accountId: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/disconnect`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('账户断开连接失败')
      
      // 更新本地状态
      const account = accounts.value.find(acc => acc.id === accountId)
      if (account) {
        account.isConnected = false
      }
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '账户断开连接失败'
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  const clearError = () => {
    error.value = null
  }
  
  const resetContent = () => {
    generatedContent.value = ''
    generatedComment.value = ''
    currentEvaluation.value = null
  }
  
  return {
    // State
    accounts,
    isLoading,
    error,
    generatedContent,
    generatedComment,
    currentEvaluation,
    
    // Computed
    connectedAccounts,
    accountsByPlatform,
    
    // Actions
    fetchAccounts,
    generateContent,
    generateComment,
    evaluateContent,
    publishContent,
    connectAccount,
    disconnectAccount,
    clearError,
    resetContent
  }
})