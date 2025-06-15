<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useTwitterStore, type BotAccount, type Strategy } from '../stores/twitter'
import { v4 as uuidv4 } from 'uuid'
import * as echarts from 'echarts'
import type { EChartsOption, RadarSeriesOption } from 'echarts'
import { marked } from 'marked'

const twitterStore = useTwitterStore()
const loading = ref(true)
const showAddStrategyModal = ref(false)
const strategies = ref<Strategy[]>([])
const filterStatus = ref('all')
const searchQuery = ref('')

// New strategy form
const newStrategy = ref({
  name: '',
  botAccountIds: [] as string[],
  targetType: 'account' as 'account' | 'tweet' | 'comment',
  targetId: '',
  actions: [] as Array<{
    type: 'like' | 'retweet' | 'reply';
    count: number;
    schedule: string;
    replyTemplate?: string;
    botIds: string[];
  }>,
  isActive: true
})
const formError = ref('')
const submitting = ref(false)
const currentBotInput = ref('')
const currentAction = ref({
  type: 'like' as 'like' | 'retweet' | 'reply',
  count: 1,
  schedule: '',
  replyTemplate: '',
  botIds: [] as string[]
})

// Predefined completed strategies
const initStrategies = () => {
  strategies.value = [
    {
      id: uuidv4(),
      name: 'Boost Media Lab Launch',
      botAccountIds: ['bot1', 'bot2'],
      targetType: 'tweet',
      targetId: '123456789',
      actions: [
        { type: 'like', count: 100, schedule: '2025-06-10T10:00:00', botIds: ['bot1', 'bot2'] },
        { type: 'retweet', count: 50, schedule: '2025-06-10T10:30:00', botIds: ['bot1'] },
        { type: 'reply', count: 20, schedule: '2025-06-10T11:00:00', replyTemplate: 'Great initiative! Looking forward to more updates! #MediaLab', botIds: ['bot2'] }
      ],
      isActive: true,
      status: 'completed',
      createdAt: '2025-06-10T09:00:00Z',
      results: {
        likes: 120,
        retweets: 60,
        replies: 25,
        botLoss: 2,
        timestamp: '2025-06-10T12:00:00Z',
        operationStats: [
          { type: 'like', botCount: 2, plannedCount: 100, actualCount: 120, botLoss: 1, botLossRate: 0.5 },
          { type: 'retweet', botCount: 1, plannedCount: 50, actualCount: 60, botLoss: 0, botLossRate: 0 },
          { type: 'reply', botCount: 1, plannedCount: 20, actualCount: 25, botLoss: 1, botLossRate: 1 }
        ],
        totalBotLossRate: 0.5
      },
      showResults: false
    },
    {
      id: uuidv4(),
      name: 'Promote Research Paper',
      botAccountIds: ['bot2', 'bot3'],
      targetType: 'account',
      targetId: 'CUC_Research',
      actions: [
        { type: 'like', count: 80, schedule: '2025-06-12T14:00:00', botIds: ['bot2', 'bot3'] },
        { type: 'reply', count: 30, schedule: '2025-06-12T14:30:00', replyTemplate: 'Amazing research! Can we get a copy of the paper? #CUCResearch', botIds: ['bot3'] }
      ],
      isActive: true,
      status: 'completed',
      createdAt: '2025-06-12T13:00:00Z',
      results: {
        likes: 90,
        retweets: 20,
        replies: 35,
        botLoss: 0,
        timestamp: '2025-06-12T15:00:00Z',
        operationStats: [
          { type: 'like', botCount: 2, plannedCount: 80, actualCount: 90, botLoss: 0, botLossRate: 0 },
          { type: 'reply', botCount: 1, plannedCount: 30, actualCount: 35, botLoss: 0, botLossRate: 0 }
        ],
        totalBotLossRate: 0
      },
      showResults: false
    }
  ]
}

// Get bot account options for dropdown
const botAccountOptions = computed(() => {
  return twitterStore.botAccounts
    .filter((account: BotAccount) => account.isActive)
    .map((account: BotAccount) => ({
      id: account.id,
      username: account.username
    }))
})

// Add bot account to strategy
const addBotAccount = () => {
  const botId = currentBotInput.value.trim()
  if (botId && !newStrategy.value.botAccountIds.includes(botId)) {
    newStrategy.value.botAccountIds.push(botId)
    currentBotInput.value = ''
  }
}

// Remove bot account from strategy
const removeBotAccount = (index: number) => {
  newStrategy.value.botAccountIds.splice(index, 1)
}

// Add action to strategy
const addAction = () => {
  if (currentAction.value.count < 1) {
    formError.value = '操作数量必须大于0'
    return
  }
  if (!currentAction.value.schedule) {
    formError.value = '请指定操作时间'
    return
  }
  if (currentAction.value.type === 'reply' && !currentAction.value.replyTemplate?.trim()) {
    formError.value = '回复操作需要填写回复模板'
    return
  }
  if (!currentAction.value.botIds.length) {
    formError.value = '请指定执行操作的机器人账号'
    return
  }
  newStrategy.value.actions.push({ ...currentAction.value })
  currentAction.value = { type: 'like', count: 1, schedule: '', replyTemplate: '', botIds: [] }
}

// Remove action from strategy
const removeAction = (index: number) => {
  newStrategy.value.actions.splice(index, 1)
}

// Filter strategies
const filteredStrategies = computed(() => {
  let result = [...strategies.value]
  if (filterStatus.value !== 'all') {
    result = result.filter(strategy => strategy.status === filterStatus.value)
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(strategy => {
      const nameMatch = strategy.name.toLowerCase().includes(query)
      const targetMatch = strategy.targetId.toLowerCase().includes(query)
      const accountMatch = strategy.botAccountIds.some((id: string) => {
        const account = twitterStore.botAccounts.find((a: BotAccount) => a.id === id)
        return account?.username.toLowerCase().includes(query) || false
      })
      return nameMatch || targetMatch || accountMatch
    })
  }
  return result
})

// Submit new strategy
const submitStrategy = async () => {
  formError.value = ''
  if (!newStrategy.value.name.trim()) {
    formError.value = '请输入策略名称'
    return
  }
  if (!newStrategy.value.botAccountIds.length) {
    formError.value = '请至少选择一个机器人账号'
    return
  }
  if (!newStrategy.value.targetId.trim()) {
    formError.value = '请输入目标ID'
    return
  }
  if (!newStrategy.value.actions.length) {
    formError.value = '请至少添加一个操作'
    return
  }
  try {
    submitting.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newId = uuidv4()
    const createdStrategy: Strategy = {
      id: newId,
      name: newStrategy.value.name,
      botAccountIds: [...newStrategy.value.botAccountIds],
      targetType: newStrategy.value.targetType,
      targetId: newStrategy.value.targetId,
      actions: [...newStrategy.value.actions],
      isActive: newStrategy.value.isActive,
      status: 'pending',
      createdAt: new Date().toISOString(),
      results: null
    }
    strategies.value.unshift(createdStrategy)
    newStrategy.value = {
      name: '',
      botAccountIds: [],
      targetType: 'account',
      targetId: '',
      actions: [],
      isActive: true
    }
    showAddStrategyModal.value = false
  } catch (error) {
    console.error('创建自动化策略失败:', error)
    formError.value = '创建自动化策略失败，请重试。'
  } finally {
    submitting.value = false
  }
}

// Toggle strategy status
const toggleStrategyStatus = (strategy: Strategy) => {
  strategy.isActive = !strategy.isActive
}

// Execute strategy (simulate Twitter API call)
const executeStrategy = async (strategy: Strategy) => {
  try {
    strategy.status = 'running'
    await new Promise(resolve => setTimeout(resolve, 2000))
    const operationStats = strategy.actions.map(a => {
      const baseLossRate = a.type === 'reply' ? 0.15 : a.type === 'retweet' ? 0.1 : 0.05
      const botLoss = Math.floor(a.botIds.length * (baseLossRate * (1 + Math.random() * 0.2)))
      return {
        type: a.type,
        botCount: a.botIds.length,
        plannedCount: a.count,
        actualCount: Math.floor(a.count * (1 + Math.random() * 0.2)),
        botLoss,
        botLossRate: botLoss / a.botIds.length || 0
      }
    })
    const totalBotLoss = operationStats.reduce((sum, stat) => sum + stat.botLoss, 0)
    const totalBotCount = new Set(strategy.botAccountIds).size
    strategy.results = {
      likes: operationStats.filter(o => o.type === 'like').reduce((sum, op) => sum + op.actualCount, 0),
      retweets: operationStats.filter(o => o.type === 'retweet').reduce((sum, op) => sum + op.actualCount, 0),
      replies: operationStats.filter(o => o.type === 'reply').reduce((sum, op) => sum + op.actualCount, 0),
      botLoss: totalBotLoss,
      timestamp: new Date().toISOString(),
      operationStats,
      totalBotLossRate: totalBotLoss / totalBotCount || 0
    }
    strategy.status = 'completed'
  } catch (error) {
    console.error('执行策略失败:', error)
    strategy.status = 'failed'
  }
}

// Get source account (mocked for now)
const getSourceAccount = (strategy: Strategy) => {
  if (strategy.targetType === 'account') {
    return `@${strategy.targetId}`
  }
  return '@SourceUser' // Mocked; use Twitter API in production
}

// Calculate impressions
const calculateImpressions = (likes: number, retweets: number, replies: number) => {
  return likes * 50 + retweets * 100 + replies * 75
}

// Initialize radar chart for a target
const initRadarChart = async (strategyId: string, results: any) => {
  await nextTick()
  const chartDom = document.getElementById(`chart-${strategyId}`)
  if (!chartDom) {
    console.error(`Chart container chart-${strategyId} not found`)
    return
  }
  try {
    const myChart = echarts.init(chartDom)
    const likeEffectiveness = results.operationStats.find((s: any) => s.type === 'like')?.actualCount / (results.operationStats.find((s: any) => s.type === 'like')?.plannedCount || 1) || 0
    const retweetEffectiveness = results.operationStats.find((s: any) => s.type === 'retweet')?.actualCount / (results.operationStats.find((s: any) => s.type === 'retweet')?.plannedCount || 1) || 0
    const replyEffectiveness = results.operationStats.find((s: any) => s.type === 'reply')?.actualCount / (results.operationStats.find((s: any) => s.type === 'reply')?.plannedCount || 1) || 0
    const survivalRate = 1 - results.totalBotLossRate
    const option: EChartsOption = {
      title: {
        text: '策略操作效果',
        left: 'center',
        textStyle: {
          fontSize: 16,
          color: '#333'
        }
      },
      tooltip: { trigger: 'item' },
      legend: { data: ['操作效果'], bottom: 10 },
      radar: {
        indicator: [
          { name: '点赞效果', max: 2 },
          { name: '转发效果', max: 2 },
          { name: '回复效果', max: 2 },
          { name: '机器人存活率', max: 1 }
        ],
        radius: '65%',
        center: ['50%', '50%']
      },
      series: [{
        type: 'radar',
        data: [{
          value: [likeEffectiveness, retweetEffectiveness, replyEffectiveness, survivalRate],
          name: '操作效果'
        }],
        areaStyle: { opacity: 0.2 }
      } as RadarSeriesOption]
    }
    myChart.setOption(option)
  } catch (error) {
    console.error(`Failed to initialize chart for strategy ${strategyId}:`, error)
  }
}

// Generate effect analysis
const getEffectAnalysis = (strategy: Strategy) => {
  if (!strategy.results || !strategy.results.operationStats) {
    return '无效果数据可分析。'
  }
  const { results } = strategy
  const totalImpressions = calculateImpressions(results.likes, results.retweets, results.replies)
  const operationInsights = results.operationStats.map(stat => {
    const effectiveness = stat.actualCount / (stat.plannedCount || 1)
    return {
      type: stat.type,
      effectiveness,
      botLossRate: stat.botLossRate,
      status: effectiveness >= 1 ? '超预期' : effectiveness >= 0.8 ? '接近预期' : '未达预期'
    }
  })
  const bestOperation = operationInsights.reduce((best, curr) => curr.effectiveness > best.effectiveness ? curr : best, operationInsights[0] || { effectiveness: 0 })
  const worstOperation = operationInsights.reduce((worst, curr) => curr.effectiveness < worst.effectiveness ? curr : worst, operationInsights[0] || { effectiveness: Infinity })
  const highLossOperations = operationInsights.filter(op => op.botLossRate > 0.3)
  const recommendations = []
  if (worstOperation.effectiveness < 0.8) {
    recommendations.push(`优化${worstOperation.type === 'like' ? '点赞' : worstOperation.type === 'retweet' ? '转发' : '回复'}操作，可能需要调整机器人分配或目标内容。`)
  }
  if (highLossOperations.length) {
    recommendations.push(`以下操作机器人损失率较高：${highLossOperations.map(op => op.type === 'like' ? '点赞' : op.type === 'retweet' ? '转发' : '回复').join('、')}，建议减少高风险操作或更换机器人账号。`)
  }
  if (results.totalBotLossRate > 0.3) {
    recommendations.push('整体机器人损失率较高，建议优化策略以降低账号封禁风险。')
  } else {
    recommendations.push('机器人存活率较高，继续保持当前策略的稳定性。')
  }
  return `
### 效果分析
- **总计**：点赞 ${results.likes} 次，转发 ${results.retweets} 次，回复 ${results.replies} 次，预计浏览量 ${totalImpressions.toLocaleString()}。
- **操作表现**：
  ${operationInsights.map(op => `- ${op.type === 'like' ? '点赞' : op.type === 'retweet' ? '转发' : '回复'}：效果 ${op.status}（实际/计划 = ${(op.effectiveness * 100).toFixed(1)}%），损失率 ${(op.botLossRate * 100).toFixed(1)}%`).join('\n  ')}
- **亮点**：${bestOperation.type === 'like' ? '点赞' : bestOperation.type === 'retweet' ? '转发' : '回复'}表现最佳，效果达到 ${(bestOperation.effectiveness * 100).toFixed(1)}%。
- **问题**：${worstOperation.type === 'like' ? '点赞' : worstOperation.type === 'retweet' ? '转发' : '回复'}效果较低，仅 ${(worstOperation.effectiveness * 100).toFixed(1)}%。
- **机器人损失**：总损失率 ${(results.totalBotLossRate * 100).toFixed(1)}%，共损失 ${results.botLoss} 个机器人账号。
- **建议**：
  ${recommendations.join('\n  - ')}
- **总体评价**：${results.totalBotLossRate < 0.3 && operationInsights.every(op => op.effectiveness >= 0.8) ? '策略效果良好，达到预期效果。' : '策略部分达标，但需针对问题进行优化。'}
  `
}

// Show results and initialize chart
const showResults = async (strategy: Strategy) => {
  strategy.showResults = !strategy.showResults
  if (strategy.showResults && strategy.results) {
    await initRadarChart(strategy.id, strategy.results)
  }
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

// Load strategies
onMounted(async () => {
  try {
    if (twitterStore.botAccounts.length === 0) {
      await twitterStore.fetchBotAccounts()
    }
    await initStrategies()
  } catch (error) {
    console.error('加载自动化策略失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="automation-container">
    <!-- 头部 -->
    <div class="header">
      <div>
        <h1 class="header-title">自动化策略</h1>
        <p class="header-description">管理机器人账号的自动化操作</p>
      </div>
      <button @click="showAddStrategyModal = true" class="primary-button header-button">
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        新增自动化策略
      </button>
    </div>

    <!-- 过滤器 -->
    <div class="card filter-container">
      <div class="filter-content">
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索策略..."
            class="search-input"
          />
          <div class="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div class="filter-buttons">
          <button
            @click="filterStatus = 'all'"
            class="filter-button"
            :class="{ 'filter-button-active': filterStatus === 'all' }"
          >
            全部
          </button>
          <button
            @click="filterStatus = 'pending'"
            class="filter-button"
            :class="{ 'filter-button-pending': filterStatus === 'pending' }"
          >
            待执行
          </button>
          <button
            @click="filterStatus = 'running'"
            class="filter-button"
            :class="{ 'filter-button-running': filterStatus === 'running' }"
          >
            执行中
          </button>
          <button
            @click="filterStatus = 'completed'"
            class="filter-button"
            :class="{ 'filter-button-completed': filterStatus === 'completed' }"
          >
            已完成
          </button>
        </div>
      </div>
    </div>

    <!-- 策略列表 -->
    <div class="strategy-list">
      <div v-if="loading" class="loading">
        <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div v-else-if="filteredStrategies.length === 0" class="no-strategies">
        <div class="no-strategies-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-large" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 class="no-strategies-title">未找到自动化策略</h3>
        <p class="no-strategies-description">尝试更改过滤条件或创建新策略</p>
      </div>
      <div v-else>
        <div v-for="strategy in filteredStrategies" :key="strategy.id" class="card strategy-card">
          <div class="strategy-header">
            <div class="strategy-status">
              <div
                class="status-icon"
                :class="{
                  'status-pending': strategy.status === 'pending',
                  'status-running': strategy.status === 'running',
                  'status-completed': strategy.status === 'completed',
                  'status-failed': strategy.status === 'failed'
                }"
              >
                <svg v-if="strategy.status === 'pending'" xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="strategy.status === 'running'" xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m-7-3h10" />
                </svg>
                <svg v-else-if="strategy.status === 'completed'" xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 class="strategy-title">{{ strategy.name }}</h3>
                <div class="strategy-meta">
                  <span class="meta-item">目标：{{ strategy.targetType === 'account' ? '@' : strategy.targetType === 'tweet' ? '推文' : '评论' }}{{ strategy.targetId }}</span>
                  <span
                    class="status-label"
                    :class="{ 'status-active': strategy.isActive, 'status-inactive': !strategy.isActive }"
                  >
                    {{ strategy.isActive ? '启用' : '禁用' }}
                  </span>
                  <span class="meta-item">创建时间：{{ formatDate(strategy.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="strategy-actions">
              <button class="action-button">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 机器人账号 -->
          <div class="bot-accounts">
            <h4 class="section-title">机器人账号</h4>
            <div class="bot-list">
              <div v-for="botId in strategy.botAccountIds" :key="botId" class="bot-item">
                @{{ twitterStore.botAccounts.find((a: BotAccount) => a.id === botId)?.username || '未知' }}
              </div>
            </div>
          </div>

          <!-- 操作详情 -->
          <div class="action-details">
            <h4 class="section-title">操作详情</h4>
            <div class="action-list">
              <div v-for="(action, index) in strategy.actions" :key="index" class="action-item">
                <div class="action-type" :class="{
                  'action-like': action.type === 'like',
                  'action-retweet': action.type === 'retweet',
                  'action-reply': action.type === 'reply'
                }">
                  {{ action.type === 'like' ? '点赞' : action.type === 'retweet' ? '转发' : '回复' }}
                </div>
                <div class="action-info">
                  操作对象：{{ strategy.targetType === 'account' ? '@' : strategy.targetType === 'tweet' ? '推文' : '评论' }}{{ strategy.targetId }}
                </div>
                <div class="action-info">
                  操作账号：{{ action.botIds.map(id => '@' + (twitterStore.botAccounts.find((a: BotAccount) => a.id === id)?.username || '未知')).join(', ') }}
                </div>
                <div class="action-info">数量：{{ action.count }}</div>
                <div class="action-info">时间：{{ action.schedule }}</div>
                <div v-if="action.type === 'reply' && action.replyTemplate" class="action-reply">
                  回复内容：{{ action.replyTemplate }}
                </div>
              </div>
            </div>
          </div>

          <!-- 效果展示 -->
          <div v-if="strategy.results" class="results-section">
            <button @click="showResults(strategy)" class="results-toggle">
              {{ strategy.showResults ? '收起效果' : '查看效果' }}
            </button>
            <div v-if="strategy.showResults" class="results-content">
              <div class="results-stats">
                <h4 class="section-title">效果统计</h4>
                <table class="results-table">
                  <thead>
                    <tr class="table-header">
                      <th>目标内容</th>
                      <th>来源账号</th>
                      <th>机器人账号数</th>
                      <th>点赞机器人</th>
                      <th>转发机器人</th>
                      <th>回复机器人</th>
                      <th>最终点赞</th>
                      <th>最终转发</th>
                      <th>最终回复</th>
                      <th>浏览量</th>
                      <th>点赞损失率</th>
                      <th>转发损失率</th>
                      <th>回复损失率</th>
                      <th>总损失率</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="table-row">
                      <td>{{ strategy.targetType === 'account' ? '@' : strategy.targetType === 'tweet' ? '推文' : '评论' }}{{ strategy.targetId }}</td>
                      <td>{{ getSourceAccount(strategy) }}</td>
                      <td>{{ new Set(strategy.botAccountIds).size }}</td>
                      <td>{{ strategy.actions.filter(a => a.type === 'like').reduce((sum, a) => sum + a.botIds.length, 0) }}</td>
                      <td>{{ strategy.actions.filter(a => a.type === 'retweet').reduce((sum, a) => sum + a.botIds.length, 0) }}</td>
                      <td>{{ strategy.actions.filter(a => a.type === 'reply').reduce((sum, a) => sum + a.botIds.length, 0) }}</td>
                      <td>{{ strategy.results.likes }}</td>
                      <td>{{ strategy.results.retweets }}</td>
                      <td>{{ strategy.results.replies }}</td>
                      <td>{{ calculateImpressions(strategy.results.likes, strategy.results.retweets, strategy.results.replies).toLocaleString() }}</td>
                      <td>{{ ((strategy.results.operationStats.find(s => s.type === 'like')?.botLossRate || 0) * 100).toFixed(1) }}%</td>
                      <td>{{ ((strategy.results.operationStats.find(s => s.type === 'retweet')?.botLossRate || 0) * 100).toFixed(1) }}%</td>
                      <td>{{ ((strategy.results.operationStats.find(s => s.type === 'reply')?.botLossRate || 0) * 100).toFixed(1) }}%</td>
                      <td>{{ (strategy.results.totalBotLossRate * 100).toFixed(1) }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="results-chart">
                <h4 class="section-title">效果可视化</h4>
                <div :id="'chart-' + strategy.id" class="chart-container"></div>
              </div>
              <div class="results-analysis">
                <h4 class="section-title">效果分析</h4>
                <div v-html="marked(getEffectAnalysis(strategy))"></div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="strategy-controls">
            <button
              @click="toggleStrategyStatus(strategy)"
              class="control-button"
              :class="{ 'control-disable': strategy.isActive, 'control-enable': !strategy.isActive }"
            >
              {{ strategy.isActive ? '禁用' : '启用' }}
            </button>
            <div class="control-actions">
              <button
                v-if="strategy.status === 'pending'"
                @click="executeStrategy(strategy)"
                class="primary-button"
              >
                执行
              </button>
              <button class="delete-button">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建策略弹窗 -->
    <div v-if="showAddStrategyModal" class="modal-overlay">
      <div class="modal-backdrop" @click="showAddStrategyModal = false"></div>
      <div class="modal-content">
        <div class="modal-inner">
          <div class="modal-header">
            <h2 class="modal-title">新建自动化策略</h2>
            <button @click="showAddStrategyModal = false" class="modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form @submit.prevent="submitStrategy">
            <div v-if="formError" class="error-message">
              {{ formError }}
            </div>
            <div class="form-group">
              <label for="name" class="form-label">策略名称</label>
              <input
                id="name"
                v-model="newStrategy.name"
                type="text"
                class="form-input"
                placeholder="输入策略名称"
              />
            </div>
            <div class="form-group">
              <label for="bot_accounts" class="form-label">机器人账号</label>
              <div class="bot-input-group">
                <select
                  id="bot_accounts"
                  v-model="currentBotInput"
                  class="form-input bot-select"
                >
                  <option value="" disabled>选择机器人账号</option>
                  <option v-for="account in botAccountOptions" :key="account.id" :value="account.id">
                    @{{ account.username }}
                  </option>
                </select>
                <button
                  type="button"
                  @click="addBotAccount"
                  class="secondary-button add-bot-button"
                >
                  添加
                </button>
              </div>
              <div v-if="newStrategy.botAccountIds.length" class="bot-selected-list">
                <div v-for="(botId, index) in newStrategy.botAccountIds" :key="botId" class="bot-selected-item">
                  @{{ twitterStore.botAccounts.find((a: BotAccount) => a.id === botId)?.username || '未知' }}
                  <button
                    type="button"
                    @click="removeBotAccount(index)"
                    class="remove-bot-button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">目标类型</label>
              <div class="target-type-grid">
                <div
                  @click="newStrategy.targetType = 'account'"
                  class="target-type-item"
                  :class="{ 'target-type-selected-account': newStrategy.targetType === 'account' }"
                >
                  <span class="target-type-label">账号</span>
                </div>
                <div
                  @click="newStrategy.targetType = 'tweet'"
                  class="target-type-item"
                  :class="{ 'target-type-selected-tweet': newStrategy.targetType === 'tweet' }"
                >
                  <span class="target-type-label">推文</span>
                </div>
                <div
                  @click="newStrategy.targetType = 'comment'"
                  class="target-type-item"
                  :class="{ 'target-type-selected-comment': newStrategy.targetType === 'comment' }"
                >
                  <span class="target-type-label">评论</span>
                </div>
              </div>
            </div>
            <div class="form-group">
              <label for="target_id" class="form-label">目标ID</label>
              <input
                id="target_id"
                v-model="newStrategy.targetId"
                type="text"
                class="form-input"
                :placeholder="newStrategy.targetType === 'account' ? '输入目标账号ID' : newStrategy.targetType === 'tweet' ? '输入推文ID' : '输入评论ID'"
              />
            </div>
            <div class="form-group">
              <h3 class="form-section-title">操作设置</h3>
              <div class="action-form-group">
                <label class="form-label">操作类型</label>
                <select v-model="currentAction.type" class="form-input">
                  <option value="like">点赞</option>
                  <option value="retweet">转发</option>
                  <option value="reply">回复</option>
                </select>
              </div>
              <div class="action-form-group">
                <label class="form-label">操作数量</label>
                <input
                  v-model.number="currentAction.count"
                  type="number"
                  class="form-input"
                  placeholder="输入操作数量"
                  min="1"
                />
              </div>
              <div class="action-form-group">
                <label class="form-label">操作时间</label>
                <input
                  v-model="currentAction.schedule"
                  type="datetime-local"
                  class="form-input"
                />
              </div>
              <div class="action-form-group">
                <label class="form-label">执行账号</label>
                <select
                  multiple
                  v-model="currentAction.botIds"
                  class="form-input bot-multi-select"
                >
                  <option v-for="botId in newStrategy.botAccountIds" :key="botId" :value="botId">
                    @{{ twitterStore.botAccounts.find((a: BotAccount) => a.id === botId)?.username || '未知' }}
                  </option>
                </select>
              </div>
              <div v-if="currentAction.type === 'reply'" class="action-form-group">
                <label class="form-label">回复模板</label>
                <textarea
                  v-model="currentAction.replyTemplate"
                  rows="2"
                  class="form-input"
                  placeholder="输入回复内容..."
                  maxlength="280"
                ></textarea>
              </div>
              <button
                type="button"
                @click="addAction"
                class="primary-button add-action-button"
              >
                添加操作
              </button>
              <div v-if="newStrategy.actions.length" class="action-preview-list">
                <div v-for="(action, index) in newStrategy.actions" :key="index" class="action-preview-item">
                  <div class="action-type" :class="{
                    'action-like': action.type === 'like',
                    'action-retweet': action.type === 'retweet',
                    'action-reply': action.type === 'reply'
                  }">
                    {{ action.type === 'like' ? '点赞' : action.type === 'retweet' ? '转发' : '回复' }}
                  </div>
                  <div class="action-info">
                    操作对象：{{ newStrategy.targetType === 'account' ? '@' : newStrategy.targetType === 'tweet' ? '推文' : '评论' }}{{ newStrategy.targetId }}
                  </div>
                  <div class="action-info">
                    操作账号：{{ action.botIds.map(id => '@' + (twitterStore.botAccounts.find((a: BotAccount) => a.id === id)?.username || '未知')).join(', ') }}
                  </div>
                  <div class="action-info">数量：{{ action.count }}</div>
                  <div class="action-info">时间：{{ action.schedule }}</div>
                  <div v-if="action.type === 'reply' && action.replyTemplate" class="action-reply">
                    回复内容：{{ action.replyTemplate }}
                  </div>
                  <button
                    type="button"
                    @click="removeAction(index)"
                    class="delete-action-button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="form-checkbox">
              <input
                id="is_active"
                v-model="newStrategy.isActive"
                type="checkbox"
                class="checkbox"
              />
              <label for="is_active" class="checkbox-label">立即启用策略</label>
            </div>
            <div class="form-actions">
              <button
                type="button"
                @click="showAddStrategyModal = false"
                class="secondary-button"
              >
                取消
              </button>
              <button
                type="submit"
                class="primary-button submit-button"
                :disabled="submitting"
              >
                <svg v-if="submitting" class="spinner-small" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ submitting ? '创建中...' : '创建策略' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.automation-container {
  padding: 1.5rem;
  background-color: #f3f4f6;
  min-height: 100vh;
}
.header {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (min-width: 640px) {
  .header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}
@media (min-width: 640px) {
  .header-title {
    font-size: 1.875rem;
  }
}
.header-description {
  color: #4b5563;
}
.header-button {
  margin-top: 1rem;
}
@media (min-width: 640px) {
  .header-button {
    margin-top: 0;
  }
}
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.filter-container {
  padding: 1rem;
  margin-bottom: 1.5rem;
}
.filter-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
@media (min-width: 768px) {
  .filter-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.search-wrapper {
  position: relative;
}
@media (min-width: 768px) {
  .search-wrapper {
    width: 33.333%;
  }
}
.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
}
.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
.search-icon {
  position: absolute;
  top: 0;
  left: 0;
  padding-left: 0.75rem;
  display: flex;
  align-items: center;
  height: 100%;
  pointer-events: none;
}
.filter-buttons {
  display: flex;
  gap: 0.5rem;
}
.filter-button {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  color: #4b5563;
  transition: background-color 0.2s, color 0.2s;
}
.filter-button:hover {
  background-color: #f3f4f6;
}
.filter-button-active {
  background-color: #f3f4f6;
  color: #1f2937;
}
.filter-button-pending {
  background-color: #fef3c7;
  color: #92400e;
}
.filter-button-running {
  background-color: #dbeafe;
  color: #1e40af;
}
.filter-button-completed {
  background-color: #d1fae5;
  color: #065f46;
}
.strategy-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.loading {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}
.spinner {
  width: 2rem;
  height: 2rem;
  color: #3b82f6;
  animation: spin 1s linear infinite;
}
.spinner-circle {
  opacity: 0.25;
}
.spinner-path {
  opacity: 0.75;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.no-strategies {
  text-align: center;
  padding: 3rem 0;
}
.no-strategies-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  background-color: #f3f4f6;
  margin-bottom: 1rem;
}
.no-strategies-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}
.no-strategies-description {
  color: #6b7280;
}
.strategy-card {
  padding: 1rem;
  transition: box-shadow 0.3s;
}
.strategy-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.strategy-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.strategy-status {
  display: flex;
  align-items: center;
}
.status-icon {
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-right: 0.75rem;
}
.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}
.status-running {
  background-color: #dbeafe;
  color: #1e40af;
}
.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}
.status-failed {
  background-color: #fee2e2;
  color: #dc2626;
}
.strategy-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}
.strategy-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.meta-item {
  font-size: 0.875rem;
  color: #6b7280;
  margin-right: 0.5rem;
}
.status-label {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  margin-left: 0.5rem;
}
.status-active {
  background-color: #d1fae5;
  color: #065f46;
}
.status-inactive {
  background-color: #f3f4f6;
  color: #1f2937;
}
.strategy-actions {
  position: relative;
}
.action-button {
  padding: 0.5rem;
  border-radius: 9999px;
  color: #6b7280;
  transition: background-color 0.2s;
}
.action-button:hover {
  background-color: #f3f4f6;
}
.bot-accounts {
  margin-bottom: 1rem;
}
.section-title {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}
.bot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.bot-item {
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  color: #1f2937;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
.action-details {
  margin-bottom: 1rem;
}
.action-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.action-item {
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}
.action-type {
  font-size: 0.875rem;
  font-weight: 500;
}
.action-like {
  color: #dc2626;
}
.action-retweet {
  color: #059669;
}
.action-reply {
  color: #3b82f6;
}
.action-info {
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 0.25rem;
}
.action-reply {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #1e40af;
}
.results-section {
  margin-bottom: 1rem;
}
.results-toggle {
  color: #3b82f6;
  font-size: 0.875rem;
}
.results-toggle:hover {
  text-decoration: underline;
}
.results-content {
  margin-top: 1rem;
}
.results-stats {
  margin-bottom: 1rem;
}
.results-table {
  width: 100%;
  font-size: 0.875rem;
  color: #4b5563;
}
.table-header {
  background-color: #f3f4f6;
}
.table-header th {
  padding: 0.5rem;
  text-align: left;
}
.table-row {
  border-top: 1px solid #e5e7eb;
}
.table-row td {
  padding: 0.5rem;
}
.results-chart {
  margin-bottom: 1rem;
}
.chart-container {
  width: 100%;
  height: 20rem;
}
.results-analysis {
  color: #4b5563;
}
.results-analysis h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}
.results-analysis ul {
  list-style-type: disc;
  padding-left: 1.25rem;
}
.strategy-controls {
  display: flex;
  justify-content: space-between;
}
.control-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}
.control-disable {
  background-color: #fee2e2;
  color: #dc2626;
}
.control-disable:hover {
  background-color: #fecaca;
}
.control-enable {
  background-color: #d1fae5;
  color: #065f46;
}
.control-enable:hover {
  background-color: #a7f3d0;
}
.control-actions {
  display: flex;
  gap: 0.5rem;
}
.delete-button {
  padding: 0.5rem;
  border-radius: 0.375rem;
  background-color: #fee2e2;
  color: #dc2626;
  transition: background-color 0.2s;
}
.delete-button:hover {
  background-color: #fecaca;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
.modal-content {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 32rem;
  margin: 1rem;
  z-index: 10;
  overflow-y: auto;
  max-height: 90vh;
}
.modal-inner {
  padding: 1.5rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}
.modal-close {
  padding: 0.5rem;
  border-radius: 9999px;
  color: #6b7280;
  transition: background-color 0.2s;
}
.modal-close:hover {
  background-color: #f3f4f6;
}
.error-message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border-left: 4px solid #dc2626;
  color: #dc2626;
}
.form-group {
  margin-bottom: 1rem;
}
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
}
.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
.bot-input-group {
  display: flex;
}
.bot-select {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  flex: 1;
}
.add-bot-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.bot-selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.bot-selected-item {
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  color: #1f2937;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
}
.remove-bot-button {
  margin-left: 0.25rem;
  color: #6b7280;
}
.remove-bot-button:hover {
  color: #1f2937;
}
.target-type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
.target-type-item {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  text-align: center;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: border-color 0.2s;
}
.target-type-item:hover {
  border-color: #3b82f6;
}
.target-type-selected-account {
  border-color: #3b82f6;
  background-color: #dbeafe;
  color: #1e40af;
}
.target-type-selected-tweet {
  border-color: #059669;
  background-color: #d1fae5;
  color: #065f46;
}
.target-type-selected-comment {
  border-color: #dc2626;
  background-color: #fee2e2;
  color: #dc2626;
}
.target-type-label {
  font-size: 0.875rem;
  font-weight: 500;
}
.form-section-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.5rem;
}
.action-form-group {
  margin-bottom: 0.75rem;
}
.bot-multi-select {
  height: 6rem;
}
.add-action-button {
  width: 100%;
}
.action-preview-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.action-preview-item {
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}
.delete-action-button {
  color: #dc2626;
  margin-top: 0.5rem;
}
.delete-action-button:hover {
  color: #b91c1c;
}
.form-checkbox {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}
.checkbox {
  width: 1rem;
  height: 1rem;
  color: #3b82f6;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}
.checkbox:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
.checkbox-label {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
.primary-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.2s;
}
.primary-button:hover {
  background-color: #2563eb;
}
.primary-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}
.secondary-button {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}
.secondary-button:hover {
  background-color: #d1d5db;
}
.submit-button {
  display: inline-flex;
  align-items: center;
}
.spinner-small {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  margin-left: -0.25rem;
  animation: spin 1s linear infinite;
}
.icon {
  width: 1.25rem;
  height: 1.25rem;
}
.icon-small {
  width: 1rem;
  height: 1rem;
}
.icon-large {
  width: 2rem;
  height: 2rem;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .automation-container {
    background-color: #111827;
  }
  .header-title {
    color: white;
  }
  .header-description {
    color: #d1d5db;
  }
  .card {
    background-color: #1f2937;
  }
  .filter-button {
    color: #d1d5db;
  }
  .filter-button:hover {
    background-color: #374151;
  }
  .filter-button-active {
    background-color: #374151;
    color: white;
  }
  .filter-button-pending {
    background-color: #78350f;
    color: #fef3c7;
  }
  .filter-button-running {
    background-color: #1e40af;
    color: #dbeafe;
  }
  .filter-button-completed {
    background-color: #064e3b;
    color: #d1fae5;
  }
  .search-input {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  .search-icon {
    color: #6b7280;
  }
  .no-strategies-icon {
    background-color: #1f2937;
  }
  .no-strategies-title {
    color: white;
  }
  .no-strategies-description {
    color: #9ca3af;
  }
  .strategy-title {
    color: white;
  }
  .meta-item {
    color: #9ca3af;
  }
  .status-label {
    color: #1f2937;
  }
  .status-active {
    background-color: #064e3b;
    color: #d1fae5;
  }
  .status-inactive {
    background-color: #374151;
    color: #d1d5db;
  }
  .action-button:hover {
    background-color: #374151;
  }
  .action-button {
    color: #9ca3af;
  }
  .section-title {
    color: #d1d5db;
  }
  .bot-item {
    background-color: #374151;
    color: #d1d5db;
  }
  .action-item {
    background-color: #1f2937;
  }
  .action-info {
    color: #d1d5db;
  }
  .action-reply {
    color: #3b82f6;
  }
  .results-toggle {
    color: #3b82f6;
  }
  .results-table {
    color: #d1d5db;
  }
  .table-header {
    background-color: #374151;
  }
  .table-row {
    border-top-color: #4b5563;
  }
  .results-analysis {
    color: #d1d5db;
  }
  .results-analysis h3 {
    color: white;
  }
  .control-disable {
    background-color: #7f1d1d;
    color: #fee2e2;
  }
  .control-disable:hover {
    background-color: #991b1b;
  }
  .control-enable {
    background-color: #064e3b;
    color: #d1fae5;
  }
  .control-enable:hover {
    background-color: #065f46;
  }
  .delete-button {
    background-color: #7f1d1d;
    color: #fee2e2;
  }
  .delete-button:hover {
    background-color: #991b1b;
  }
  .modal-content {
    background-color: #1f2937;
  }
  .modal-title {
    color: white;
  }
  .modal-close {
    color: #9ca3af;
  }
  .modal-close:hover {
    background-color: #374151;
  }
  .error-message {
    background-color: #7f1d1d;
    color: #fee2e2;
    border-left-color: #dc2626;
  }
  .form-label {
    color: #d1d5db;
  }
  .form-input {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  .add-bot-button {
    background-color: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }
  .add-bot-button:hover {
    background-color: #4b5563;
  }
  .bot-selected-item {
    background-color: #374151;
    color: #d1d5db;
  }
  .remove-bot-button {
    color: #9ca3af;
  }
  .remove-bot-button:hover {
    color: #d1d5db;
  }
  .target-type-item {
    border-color: #4b5563;
  }
  .target-type-item:hover {
    border-color: #3b82f6;
  }
  .target-type-selected-account {
    border-color: #3b82f6;
    background-color: #1e40af;
    color: #dbeafe;
  }
  .target-type-selected-tweet {
    border-color: #059669;
    background-color: #064e3b;
    color: #d1fae5;
  }
  .target-type-selected-comment {
    border-color: #dc2626;
    background-color: #7f1d1d;
    color: #fee2e2;
  }
  .form-section-title {
    color: white;
  }
  .delete-action-button {
    color: #dc2626;
  }
  .delete-action-button:hover {
    color: #b91c1c;
  }
  .checkbox-label {
    color: #d1d5db;
  }
  .primary-button {
    background-color: #3b82f6;
  }
  .primary-button:hover {
    background-color: #2563eb;
  }
  .secondary-button {
    background-color: #374151;
    color: #d1d5db;
  }
  .secondary-button:hover {
    background-color: #4b5563;
  }
}
</style>