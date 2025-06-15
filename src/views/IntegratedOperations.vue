<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// 接口定义
interface ContentGenerationRequest {
  topic: string
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin'
  tone: 'professional' | 'casual' | 'humorous' | 'inspiring'
  length: 'short' | 'medium' | 'long'
}

interface CommentGenerationRequest {
  originalPost: string
  commentType: 'supportive' | 'questioning' | 'informative' | 'engaging'
  tone: 'friendly' | 'professional' | 'witty'
}

interface ContentEvaluation {
  culturalFitScore: number
  viralityScore: number
  suggestions: string[]
  wordReplacements: { original: string; suggested: string }[]
  overallFeedback: string
}

interface SocialAccount {
  id: string
  platform: string
  username: string
  isConnected: boolean
}

// 响应式数据
const currentStep = ref(1)
const loading = ref(false)

// 内容生成
const contentRequest = reactive<ContentGenerationRequest>({
  topic: '',
  platform: 'twitter',
  tone: 'professional',
  length: 'medium'
})
const generatedContent = ref('')

// 评论生成
const commentRequest = reactive<CommentGenerationRequest>({
  originalPost: '',
  commentType: 'supportive',
  tone: 'friendly'
})
const generatedComment = ref('')

// 内容评估
const contentToEvaluate = ref('')
const evaluation = ref<ContentEvaluation | null>(null)

// 社交媒体账户
const socialAccounts = ref<SocialAccount[]>([
  { id: '1', platform: 'Twitter', username: '@example', isConnected: true },
  { id: '2', platform: 'Facebook', username: 'Example Page', isConnected: false },
  { id: '3', platform: 'Instagram', username: '@example_insta', isConnected: true },
  { id: '4', platform: 'LinkedIn', username: 'Example Company', isConnected: false }
])
const selectedAccount = ref('')

// 计算属性
const isStepComplete = computed(() => {
  switch (currentStep.value) {
    case 1: return generatedContent.value.length > 0
    case 2: return generatedComment.value.length > 0
    case 3: return evaluation.value !== null
    case 4: return selectedAccount.value !== ''
    default: return false
  }
})

const connectedAccounts = computed(() => 
  socialAccounts.value.filter(account => account.isConnected)
)

// 方法
const generateContent = async () => {
  if (!contentRequest.topic.trim()) return
  
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const sampleContents = {
      twitter: `🚀 探索${contentRequest.topic}的无限可能！在这个快速变化的时代，我们需要保持学习和创新的心态。#${contentRequest.topic} #创新思维`,
      facebook: `今天想和大家分享关于${contentRequest.topic}的一些思考。这个话题不仅影响着我们的日常生活，更关系到未来的发展方向。让我们一起来讨论吧！`,
      instagram: `✨ ${contentRequest.topic}带来的灵感时刻 ✨\n\n每一次探索都是成长的机会，每一个发现都值得庆祝。\n\n#${contentRequest.topic} #inspiration #growth`,
      linkedin: `在专业领域中，${contentRequest.topic}正在重塑我们的工作方式。作为行业从业者，我认为我们需要积极拥抱这些变化，并从中寻找新的机遇。`
    }
    
    generatedContent.value = sampleContents[contentRequest.platform] || sampleContents.twitter
  } catch (error) {
    console.error('内容生成失败:', error)
  } finally {
    loading.value = false
  }
}

const generateComment = async () => {
  if (!commentRequest.originalPost.trim()) return
  
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const sampleComments = {
      supportive: `非常赞同您的观点！这个话题确实值得深入思考。期待看到更多相关的分享。👍`,
      questioning: `这是一个有趣的角度，不过我想问一下，您认为在实际应用中会遇到什么挑战呢？`,
      informative: `补充一个相关信息：最近的研究表明，这个领域正在经历快速发展，建议大家关注最新动态。`,
      engaging: `太棒了！这让我想起了之前的一次经历... 大家有类似的体验吗？来聊聊吧！💬`
    }
    
    generatedComment.value = sampleComments[commentRequest.commentType]
  } catch (error) {
    console.error('评论生成失败:', error)
  } finally {
    loading.value = false
  }
}

const evaluateContent = async () => {
  if (!contentToEvaluate.value.trim()) return
  
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    evaluation.value = {
      culturalFitScore: Math.floor(Math.random() * 30) + 70,
      viralityScore: Math.floor(Math.random() * 40) + 60,
      suggestions: [
        '增加更多情感色彩的词汇以提高参与度',
        '考虑加入当前热门话题标签',
        '可以添加问句来鼓励用户互动'
      ],
      wordReplacements: [
        { original: '思考', suggested: '深度思考' },
        { original: '发展', suggested: '蓬勃发展' },
        { original: '机会', suggested: '绝佳机会' }
      ],
      overallFeedback: '内容整体质量良好，具有一定的传播潜力。建议适当增加互动元素和情感表达。'
    }
  } catch (error) {
    console.error('内容评估失败:', error)
  } finally {
    loading.value = false
  }
}

const publishContent = async () => {
  if (!selectedAccount.value) return
  
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('内容发布成功！')
    // 重置表单
    resetForm()
  } catch (error) {
    console.error('发布失败:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  currentStep.value = 1
  generatedContent.value = ''
  generatedComment.value = ''
  contentToEvaluate.value = ''
  evaluation.value = null
  selectedAccount.value = ''
  contentRequest.topic = ''
  commentRequest.originalPost = ''
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
    // 自动填充内容到下一步
    if (currentStep.value === 3 && !contentToEvaluate.value) {
      contentToEvaluate.value = generatedContent.value || generatedComment.value
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          社交媒体内容管理中心
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          从内容创作到发布的一站式解决方案
        </p>
      </div>

      <!-- 步骤指示器 -->
      <div class="mb-8">
        <div class="flex items-center justify-between max-w-3xl mx-auto">
          <div 
            v-for="step in 4" 
            :key="step"
            class="flex items-center"
            :class="{ 'flex-1': step < 4 }"
          >
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200"
              :class="currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
            >
              {{ step }}
            </div>
            <div class="ml-3 text-sm font-medium">
              <span :class="currentStep >= step ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'">
                {{ ['内容生成', '评论生成', '内容评估', '发布管理'][step - 1] }}
              </span>
            </div>
            <div 
              v-if="step < 4"
              class="flex-1 h-0.5 ml-4"
              :class="currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
            ></div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 左侧操作面板 -->
        <div class="space-y-6">
          <!-- 步骤1: 内容生成 -->
          <div 
            v-show="currentStep === 1"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300"
          >
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              📝 社交媒体内容生成
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  话题内容
                </label>
                <textarea
                  v-model="contentRequest.topic"
                  class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="3"
                  placeholder="请输入要创作的话题或关键词..."
                ></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    平台选择
                  </label>
                  <select 
                    v-model="contentRequest.platform"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    语调风格
                  </label>
                  <select 
                    v-model="contentRequest.tone"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="professional">专业</option>
                    <option value="casual">轻松</option>
                    <option value="humorous">幽默</option>
                    <option value="inspiring">激励</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  内容长度
                </label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input type="radio" v-model="contentRequest.length" value="short" class="mr-2">
                    <span class="text-sm">简短</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" v-model="contentRequest.length" value="medium" class="mr-2">
                    <span class="text-sm">中等</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" v-model="contentRequest.length" value="long" class="mr-2">
                    <span class="text-sm">详细</span>
                  </label>
                </div>
              </div>
              
              <button 
                @click="generateContent"
                :disabled="!contentRequest.topic.trim() || loading"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? '生成中...' : '生成内容' }}
              </button>
            </div>
          </div>

          <!-- 步骤2: 评论生成 -->
          <div 
            v-show="currentStep === 2"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300"
          >
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              💬 社交媒体评论生成
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  原始帖子内容
                </label>
                <textarea
                  v-model="commentRequest.originalPost"
                  class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="3"
                  placeholder="请输入要回复的帖子内容..."
                ></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    评论类型
                  </label>
                  <select 
                    v-model="commentRequest.commentType"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="supportive">支持型</option>
                    <option value="questioning">提问型</option>
                    <option value="informative">信息型</option>
                    <option value="engaging">互动型</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    语调风格
                  </label>
                  <select 
                    v-model="commentRequest.tone"
                    class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="friendly">友好</option>
                    <option value="professional">专业</option>
                    <option value="witty">机智</option>
                  </select>
                </div>
              </div>
              
              <button 
                @click="generateComment"
                :disabled="!commentRequest.originalPost.trim() || loading"
                class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? '生成中...' : '生成评论' }}
              </button>
            </div>
          </div>

          <!-- 步骤3: 内容评估 -->
          <div 
            v-show="currentStep === 3"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300"
          >
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              🎯 内容质量评估
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  待评估内容
                </label>
                <textarea
                  v-model="contentToEvaluate"
                  class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows="4"
                  placeholder="请输入要评估的内容..."
                ></textarea>
              </div>
              
              <button 
                @click="evaluateContent"
                :disabled="!contentToEvaluate.trim() || loading"
                class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? '评估中...' : '开始评估' }}
              </button>
            </div>
          </div>

          <!-- 步骤4: 发布管理 -->
          <div 
            v-show="currentStep === 4"
            class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300"
          >
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              🚀 发布到社交媒体
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择账户
                </label>
                <div class="space-y-2">
                  <div 
                    v-for="account in connectedAccounts" 
                    :key="account.id"
                    class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                    :class="selectedAccount === account.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''"
                    @click="selectedAccount = account.id"
                  >
                    <input 
                      type="radio" 
                      :value="account.id" 
                      v-model="selectedAccount" 
                      class="mr-3"
                    >
                    <div class="flex-1">
                      <div class="font-medium text-gray-800 dark:text-white">
                        {{ account.platform }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ account.username }}
                      </div>
                    </div>
                    <span class="text-green-600 dark:text-green-400 text-sm">
                      已连接
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                @click="publishContent"
                :disabled="!selectedAccount || loading"
                class="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? '发布中...' : '立即发布' }}
              </button>
            </div>
          </div>

          <!-- 导航按钮 -->
          <div class="flex justify-between pt-4">
            <button 
              @click="prevStep"
              :disabled="currentStep === 1"
              class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              上一步
            </button>
            <button 
              @click="nextStep"
              :disabled="currentStep === 4 || !isStepComplete"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {{ currentStep === 4 ? '完成' : '下一步' }}
            </button>
          </div>
        </div>

        <!-- 右侧内容预览面板 -->
        <div class="space-y-6">
          <!-- 生成内容预览 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📄 生成内容预览
            </h3>
            <div 
              v-if="generatedContent"
              class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500"
            >
              <p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ generatedContent }}</p>
            </div>
            <div v-else class="p-4 text-gray-500 dark:text-gray-400 text-center">
              生成的内容将在这里显示
            </div>
          </div>

          <!-- 生成评论预览 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              💭 生成评论预览
            </h3>
            <div 
              v-if="generatedComment"
              class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-green-500"
            >
              <p class="text-gray-800 dark:text-gray-200">{{ generatedComment }}</p>
            </div>
            <div v-else class="p-4 text-gray-500 dark:text-gray-400 text-center">
              生成的评论将在这里显示
            </div>
          </div>

          <!-- 评估结果预览 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              📊 评估结果
            </h3>
            <div v-if="evaluation" class="space-y-4">
              <!-- 评分 -->
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ evaluation.culturalFitScore }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">文化契合度</div>
                </div>
                <div class="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ evaluation.viralityScore }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">传播力预测</div>
                </div>
              </div>
              
              <!-- 改进建议 -->
              <div class="space-y-2">
                <h4 class="font-medium text-gray-800 dark:text-white">改进建议：</h4>
                <ul class="space-y-1">
                  <li 
                    v-for="suggestion in evaluation.suggestions" 
                    :key="suggestion"
                    class="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                  >
                    <span class="text-orange-500 mr-2">•</span>
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
              
              <!-- 词汇建议 -->
              <div v-if="evaluation.wordReplacements.length > 0" class="space-y-2">
                <h4 class="font-medium text-gray-800 dark:text-white">词汇优化建议：</h4>
                <div class="space-y-1">
                  <div 
                    v-for="replacement in evaluation.wordReplacements" 
                    :key="replacement.original"
                    class="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded flex items-center justify-between"
                  >
                    <span class="text-gray-600 dark:text-gray-400">
                      "<span class="line-through">{{ replacement.original }}</span>" → 
                      "<span class="text-green-600 dark:text-green-400 font-medium">{{ replacement.suggested }}</span>"
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 整体反馈 -->
              <div class="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                <h4 class="font-medium text-gray-800 dark:text-white mb-2">整体评价：</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ evaluation.overallFeedback }}</p>
              </div>
            </div>
            <div v-else class="p-4 text-gray-500 dark:text-gray-400 text-center">
              内容评估结果将在这里显示
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .grid-cols-1.lg\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}</style>