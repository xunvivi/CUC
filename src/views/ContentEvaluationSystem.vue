<template>
  <div class="content-evaluation-system max-w-7xl mx-auto p-6 font-sans">
    <!-- 页面头部 -->
    <div class="header text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800">多语言跨文化内容评估系统</h1>
      <p class="text-lg text-gray-500">基于AI的海外社交媒体内容优化平台</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-grid grid grid-cols-3 gap-6 mb-8">
      <!-- 左侧：输入和配置区域 -->
      <div class="input-section col-span-2">
        <div class="card bg-white rounded-xl shadow-md border border-gray-200">
          <div class="card-header p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <h3 class="text-xl font-semibold text-gray-800">📝 内容输入与配置</h3>
          </div>
          <div class="card-body p-6">
            <!-- 内容输入 -->
            <div class="form-group mb-5 grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-2 font-medium text-gray-700">原始内容</label>
                <textarea 
                  v-model="formData.content"
                  placeholder="请输入要评估的社交媒体内容..."
                  class="w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500"
                  rows="6"
                ></textarea>
              </div>
              <div>
                <label class="block mb-2 font-medium text-gray-700">优化后内容</label>
                <textarea 
                  v-model="optimizedContent"
                  placeholder="优化后的内容将显示在这里..."
                  class="w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500"
                  rows="6"
                  readonly
                ></textarea>
              </div>
            </div>

            <!-- 配置选项 -->
            <div class="form-row grid grid-cols-2 gap-4 mb-5">
              <div class="form-group">
                <label class="block mb-2 font-medium text-gray-700">目标国家</label>
                <select v-model="formData.targetCountry" class="w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500">
                  <option value="">选择目标国家</option>
                  <option value="china">🇨🇳 中国</option>
                  <option value="usa">🇺🇸 美国</option>
                  <option value="india">🇮🇳 印度</option>
                </select>
              </div>
              <div class="form-group">
                <label class="block mb-2 font-medium text-gray-700">内容类型</label>
                <select v-model="formData.contentType" class="w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500">
                  <option value="">选择内容类型</option>
                  <option value="post">原创帖子</option>
                  <option value="comment">评论回复</option>
                  <option value="retweet">转发内容</option>
                </select>
              </div>
            </div>

            <div class="form-row grid grid-cols-2 gap-4 mb-5">
              <div class="form-group">
                <label class="block mb-2 font-medium text-gray-700">主题领域</label>
                <select v-model="formData.theme" class="w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500">
                  <option value="">选择主题领域</option>
                  <option value="tech">科技</option>
                  <option value="sports">体育</option>
                  <option value="business">商业</option>
                  <option value="entertainment">娱乐</option>
                  <option value="politics">政治</option>
                </select>
              </div>
              <div class="form-group">
                <label class="block mb-2 font-medium text-gray-700">语言</label>
                <select v-model="formData.language" class="w-full p-4 border-2 border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-blue-500">
                  <option value="">选择语言</option>
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="button-row flex gap-4 mt-6">
              <button 
                @click="evaluateContent" 
                :disabled="isEvaluating || !canEvaluate"
                class="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="isEvaluating">🔄 评估中...</span>
                <span v-else>🔍 开始评估</span>
              </button>
              <button 
                @click="optimizeContent('custom')" 
                :disabled="!evaluationResults"
                class="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                🚀 自研模型优化
              </button>
              <button 
                @click="optimizeContent('deepseek')" 
                :disabled="!evaluationResults"
                class="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                🚀 DeepSeek优化
              </button>
              <button 
                @click="publishContent" 
                :disabled="!optimizedContent"
                class="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                📤 发布内容
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：评估结果概览 -->
      <div class="results-section">
        <div class="card bg-white rounded-xl shadow-md border border-gray-200">
          <div class="card-header p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <h3 class="text-xl font-semibold text-gray-800">📊 评估概览</h3>
          </div>
          <div class="card-body p-6">
            <div v-if="!evaluationResults" class="empty-state text-center text-gray-500 py-10">
              <p>请先输入内容并进行评估</p>
            </div>
            <div v-else class="results-overview">
              <div class="overall-score text-center mb-8">
                <div class="score-value text-5xl font-bold text-blue-500">{{ evaluationResults.overallScore }}</div>
                <div class="score-label text-sm text-gray-500">综合评分</div>
              </div>
              <div class="metrics mb-8">
                <div class="metric-item mb-5" v-for="metric in metrics" :key="metric.key">
                  <div class="metric-label font-medium text-gray-700 mb-2">{{ metric.label }}</div>
                  <div class="metric-bar flex items-center gap-3">
                    <div class="progress-bar flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        :class="metric.color" 
                        class="h-full transition-all" 
                        :style="{ width: evaluationResults[metric.key] + '%' }"
                      ></div>
                    </div>
                    <span class="metric-value font-medium text-gray-700">{{ evaluationResults[metric.key] }}%</span>
                  </div>
                </div>
              </div>
              <div class="predictions grid grid-cols-3 gap-4">
                <div class="prediction-item text-center p-4 bg-gray-50 rounded-lg" v-for="pred in predictions" :key="pred.key">
                  <span class="prediction-icon block text-2xl mb-2">{{ pred.icon }}</span>
                  <span class="prediction-value font-medium text-gray-700">{{ formatNumber(evaluationResults[pred.key]) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细评估结果 -->
    <div v-if="evaluationResults" class="detailed-results grid gap-6">
      <!-- 优化建议 -->
      <div class="card bg-white rounded-xl shadow-md border border-gray-200">
        <div class="card-header p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 class="text-xl font-semibold text-gray-800">💡 优化建议</h3>
        </div>
        <div class="card-body p-6">
          <div class="suggestions grid gap-4">
            <div 
              v-for="(suggestion, index) in evaluationResults.suggestions" 
              :key="index"
              class="suggestion-item p-4 rounded-lg border-l-4"
              :class="suggestionClasses(suggestion.severity)"
            >
              <div class="suggestion-header flex justify-between items-center mb-2">
                <span class="suggestion-type font-medium text-gray-700">{{ getSuggestionTypeLabel(suggestion.type) }}</span>
                <span class="suggestion-severity text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">{{ getSeverityLabel(suggestion.severity) }}</span>
              </div>
              <div class="suggestion-text text-gray-700">{{ suggestion.text }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型对比 -->
      <div class="card bg-white rounded-xl shadow-md border border-gray-200">
        <div class="card-header p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 class="text-xl font-semibold text-gray-800">🔬 模型对比分析</h3>
        </div>
        <div class="card-body p-6">
          <div class="model-comparison min-h-[300px]">
            <div class="comparison-tabs flex gap-2 mb-5">
              <button 
                v-for="model in models" 
                :key="model"
                @click="activeModel = model; updateRadarChart()"
                :class="{ 'bg-blue-500 text-white border-blue-500': activeModel === model, 'bg-white text-gray-700 border-gray-200': activeModel !== model }"
                class="tab-button px-4 py-2 border rounded-lg cursor-pointer transition-all"
              >
                {{ model }}
              </button>
            </div>
            <div class="comparison-content">
              <div class="radar-chart h-[300px] w-full" ref="radarChart"></div>
              <div class="model-data mt-4 text-gray-700">
                <p><strong>当前模型:</strong> {{ activeModel }}</p>
                <p><strong>文化契合度:</strong> {{ modelData[activeModel][0] }}%</p>
                <p><strong>情感共鸣:</strong> {{ modelData[activeModel][1] }}%</p>
                <p><strong>传播潜力:</strong> {{ modelData[activeModel][2] }}%</p>
                <p><strong>互动可能:</strong> {{ modelData[activeModel][3] }}%</p>
                <p><strong>算法友好:</strong> {{ modelData[activeModel][4] }}%</p>
                <p><strong>风险控制:</strong> {{ modelData[activeModel][5] }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史对比 -->
      <div class="card bg-white rounded-xl shadow-md border border-gray-200">
        <div class="card-header p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <h3 class="text-xl font-semibold text-gray-800">📈 历史效果对比</h3>
        </div>
        <div class="card-body p-6">
          <div class="history-chart h-[300px] w-full" ref="historyChart"></div>
          <div class="history-data mt-4 text-gray-700">
            <table class="w-full text-left">
              <thead>
                <tr>
                  <th class="p-2">序号</th>
                  <th class="p-2">内容</th>
                  <th class="p-2">预测评分</th>
                  <th class="p-2">实际效果</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in historyData.items" :key="index">
                  <td class="p-2">{{ index + 1 }}</td>
                  <td class="p-2">{{ item.content }}</td>
                  <td class="p-2">{{ item.predicted }}</td>
                  <td class="p-2">{{ item.actual }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';

export default defineComponent({
  name: 'ContentEvaluationSystem',
  setup() {
    const formData = reactive({
      content: '',
      targetCountry: '',
      contentType: '',
      theme: '',
      language: ''
    });

    const optimizedContent = ref(''); // 新增：优化后内容
    const isEvaluating = ref(false);
    const evaluationResults = ref(null);
    const activeModel = ref('自研模型');
    const radarChart = ref(null);
    const historyChart = ref(null);
    const modelData = reactive({
      '自研模型': [78, 85, 72, 80, 75, 90],
      '大模型': [65, 70, 80, 60, 55, 75]
    });
    const historyData = reactive({
      items: [
        { content: '探索AI在教育领域的最新应用！#EdTech', predicted: 78, actual: 75 },
        { content: '5G技术如何改变我们的生活？#TechTrend', predicted: 85, actual: 88 },
        { content: '全球科技峰会亮点回顾 #Innovation', predicted: 72, actual: 70 },
        { content: '人工智能助力可持续发展 #AIForGood', predicted: 90, actual: 85 },
        { content: '虚拟现实的未来在哪里？#VR', predicted: 65, actual: 68 },
        { content: '区块链技术的新突破 #Blockchain', predicted: 82, actual: 85 }
      ]
    });
    const models = ['自研模型', '大模型'];
    const metrics = [
      { key: 'culturalScore', label: '文化契合度', color: 'bg-cyan-500' },
      { key: 'emotionalScore', label: '情感共鸣', color: 'bg-yellow-500' },
      { key: 'viralityScore', label: '传播潜力', color: 'bg-green-500' }
    ];
    const predictions = [
      { key: 'predictedLikes', icon: '👍' },
      { key: 'predictedRetweets', icon: '🔁' },
      { key: 'predictedComments', icon: '💬' }
    ];

    const canEvaluate = computed(() => 
      formData.content.trim() && formData.targetCountry && formData.contentType && formData.language
    );

    const evaluateContent = async () => {
      if (!canEvaluate.value) {
        alert('请完整填写必要字段');
        return;
      }

      isEvaluating.value = true;
      optimizedContent.value = ''; // 清空优化内容

      try {
        // 模拟 API 调用
        await new Promise(resolve => setTimeout(resolve, 2000));

        evaluationResults.value = {
          overallScore: 78,
          culturalScore: 75,
          emotionalScore: 85,
          viralityScore: 72,
          predictedLikes: 1250,
          predictedRetweets: 280,
          predictedComments: 150,
          predictedViews: 15000,
          suggestions: [
            { type: 'cultural', text: '建议将"awesome"替换为"fantastic"以更好适应印度文化', severity: 'medium' },
            { type: 'emotional', text: '可以添加更多积极情感词汇提升共鸣', severity: 'low' },
            { type: 'viral', text: '建议添加相关hashtag和emoji提升传播力', severity: 'high' }
          ]
        };

        // 确保 DOM 更新后再渲染图表
        await nextTick();
        renderCharts();
      } catch (error) {
        console.error('评估失败:', error);
        alert('评估失败，请稍后重试');
      } finally {
        isEvaluating.value = false; // 始终重置评估状态
      }
    };

    const optimizeContent = (model: string) => {
      const prompt = evaluationResults.value?.suggestions.map(s => s.text).join('; ');
      const optimizations = {
        'custom': `${formData.content} 🚀 #TechInnovation (优化提示: ${prompt})`,
        'deepseek': `${formData.content} 🌟 #FutureIsNow (DeepSeek优化: ${prompt})`
      };
      optimizedContent.value = optimizations[model] || formData.content; // 更新优化后内容
    };

    const publishContent = () => {
      if (!optimizedContent.value) {
        alert('请先优化内容！');
        return;
      }
      alert('内容已发布到社交媒体平台！');
    };

    const formatNumber = (num: number) => {
      return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();
    };

    const getSuggestionTypeLabel = (type: string) => {
      const labels: { [key: string]: string } = {
        cultural: '文化优化',
        emotional: '情感优化',
        viral: '传播优化'
      };
      return labels[type] || type;
    };

    const getSeverityLabel = (severity: string) => {
      const labels: { [key: string]: string } = {
        high: '高优先级',
        medium: '中优先级',
        low: '低优先级'
      };
      return labels[severity] || severity;
    };

    const suggestionClasses = (severity: string) => ({
      'bg-red-50 border-l-red-500': severity === 'high',
      'bg-yellow-50 border-l-yellow-500': severity === 'medium',
      'bg-cyan-50 border-l-cyan-500': severity === 'low'
    });

    const updateRadarChart = () => {
      if (radarChart.value) {
        const radarChartInstance = echarts.init(radarChart.value);
        const radarOption = {
          title: { text: '模型评估对比', textStyle: { color: '#2c3e50' } },
          tooltip: {},
          radar: {
            indicator: [
              { name: '文化契合度', max: 100 },
              { name: '情感共鸣', max: 100 },
              { name: '传播潜力', max: 100 },
              { name: '互动可能', max: 100 },
              { name: '算法友好', max: 100 },
              { name: '风险控制', max: 100 }
            ],
            radius: '65%',
            splitNumber: 5,
            axisName: { color: '#495057' },
            splitArea: { show: true, areaStyle: { color: ['#f8f9fa', '#e9ecef'] } },
            splitLine: { lineStyle: { color: '#dee2e6' } }
          },
          series: [{
            name: '评估对比',
            type: 'radar',
            data: [
              {
                value: modelData[activeModel.value],
                name: activeModel.value,
                areaStyle: { color: activeModel.value === '自研模型' ? 'rgba(0,123,255,0.3)' : 'rgba(108,117,125,0.3)' },
                lineStyle: { color: activeModel.value === '自研模型' ? '#007bff' : '#6c757d' }
              }
            ]
          }]
        };
        radarChartInstance.setOption(radarOption);
      }
    };

    const renderCharts = () => {
      updateRadarChart();
      if (historyChart.value) {
        const historyChartInstance = echarts.init(historyChart.value);
        const historyOption = {
          title: { text: '历史效果对比', textStyle: { color: '#2c3e50' } },
          tooltip: { trigger: 'axis' },
          legend: { data: ['评估分数', '实际效果'], bottom: 0 },
          xAxis: {
            type: 'category',
            data: historyData.items.map((_, index) => (index + 1).toString()), // 使用序号
            axisLabel: { color: '#495057' },
            axisLine: { lineStyle: { color: '#dee2e6' } }
          },
          yAxis: {
            type: 'value',
            axisLabel: { color: '#495057' },
            splitLine: { lineStyle: { color: '#e9ecef' } }
          },
          series: [
            {
              name: '评估分数',
              type: 'line',
              data: historyData.items.map(item => item.predicted),
              lineStyle: { color: '#007bff' },
              itemStyle: { color: '#007bff' }
            },
            {
              name: '实际效果',
              type: 'line',
              data: historyData.items.map(item => item.actual),
              lineStyle: { color: '#28a745' },
              itemStyle: { color: '#28a745' }
            }
          ]
        };
        historyChartInstance.setOption(historyOption);
      }
    };

    onMounted(() => {
      if (evaluationResults.value) {
        renderCharts();
      }
    });

    return {
      formData,
      optimizedContent,
      isEvaluating,
      evaluationResults,
      activeModel,
      radarChart,
      historyChart,
      canEvaluate,
      evaluateContent,
      optimizeContent,
      publishContent,
      formatNumber,
      getSuggestionTypeLabel,
      getSeverityLabel,
      suggestionClasses,
      metrics,
      predictions,
      models,
      modelData,
      historyData
    };
  }
});
</script>

<style scoped>
.content-evaluation-system {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}
</style>