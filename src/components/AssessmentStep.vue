<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <bar-chart-3-icon class="w-5 h-5 mr-2 text-purple-600" />
          内容评估
        </h3>
        <button @click="assessContent" :disabled="loading.assessment"
          class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50 mb-6">
          <refresh-cw-icon v-if="loading.assessment" class="w-4 h-4 mr-2 animate-spin" />
          <bar-chart-3-icon v-else class="w-4 h-4 mr-2" />
          <span>{{ loading.assessment ? '评估中...' : '开始评估' }}</span>
        </button>
        <div v-if="contentData.assessment" class="space-y-4">
          <div
            class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
            <h4 class="font-semibold text-gray-800 dark:text-white mb-3">评分结果</h4>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ contentData.assessment.culturalFitScore }}
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">文化契合</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {{ contentData.assessment.viralPotentialScore }}
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">传播潜力</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {{ contentData.assessment.overallScore }}
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">综合评分</div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="font-semibold text-gray-800 dark:text-white mb-3">预期互动</h4>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">点赞:</span>
                <span class="ml-1 font-medium text-gray-800 dark:text-white">
                  {{ contentData.assessment.predictedEngagement.likes }}
                </span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">分享:</span>
                <span class="ml-1 font-medium text-gray-800 dark:text-white">
                  {{ contentData.assessment.predictedEngagement.shares }}
                </span>
              </div>
              <div>
                <span class="text-gray-600 dark:text-gray-400">评论:</span>
                <span class="ml-1 font-medium text-gray-800 dark:text-white">
                  {{ contentData.assessment.predictedEngagement.comments }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">优化建议</h3>
        <div v-if="contentData.assessment" class="space-y-3 max-h-[400px] overflow-y-auto">
          <div v-for="(suggestion, index) in contentData.assessment.suggestions" :key="index"
            :class="[
              'border-l-4 p-3 rounded-r-lg',
              suggestion.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
              suggestion.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
              'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            ]">
            <div class="flex items-start">
              <alert-circle-icon
                :class="[
                  'w-4 h-4 mt-0.5 mr-2',
                  suggestion.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                  suggestion.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-blue-600 dark:text-blue-400'
                ]" />
              <div>
                <p class="font-medium text-gray-800 dark:text-white text-sm">{{ suggestion.issue }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-xs mt-1">{{ suggestion.reason }}</p>
              </div>
            </div>
          </div>
          <button @click="$emit('next-step')" class="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
            下一步：发布内容
          </button>
        </div>
        <div v-else class="text-gray-400 dark:text-gray-500 text-center py-8">
          点击开始评估按钮获取优化建议
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import BarChart3Icon from '../icons/BarChart3.vue'
  import AlertCircleIcon from '../icons/AlertCircle.vue'
  import RefreshCwIcon from '../icons/RefreshCw.vue'
  
  defineProps(['contentData', 'loading'])
  const emit = defineEmits(['next-step'])
  
  const assessContent = async () => {
    emit('assess-content')
  }
  </script>