<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <sparkles-icon class="w-5 h-5 mr-2 text-blue-600" />
          内容设置
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">主题内容</label>
            <input type="text" v-model="formData.topic"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="请输入内容主题" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">发布平台</label>
            <select v-model="formData.platform"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">内容语调</label>
            <select v-model="formData.tone"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="professional">专业</option>
              <option value="casual">轻松</option>
              <option value="enthusiastic">热情</option>
              <option value="educational">教育性</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">关键词</label>
            <input type="text" v-model="formData.keywords"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="用逗号分隔多个关键词" />
          </div>
          <button @click="generatePostContent" :disabled="loading.post || !formData.topic"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50">
            <refresh-cw-icon v-if="loading.post" class="w-4 h-4 mr-2 animate-spin" />
            <sparkles-icon v-else class="w-4 h-4 mr-2" />
            <span>{{ loading.post ? '生成中...' : '生成内容' }}</span>
          </button>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">生成的内容</h3>
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[300px]">
          <pre v-if="contentData.postContent"
            class="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{{ contentData.postContent }}</pre>
          <div v-else class="text-gray-400 dark:text-gray-500 text-center flex items-center justify-center h-full">
            点击生成内容按钮开始创作
          </div>
        </div>
        <button v-if="contentData.postContent" @click="$emit('next-step')"
          class="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
          下一步：生成评论
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineEmits, defineProps, ref } from 'vue'
  import SparklesIcon from '../icons/Sparkles.vue'
  import RefreshCwIcon from '../icons/RefreshCw.vue'
  
  defineProps(['formData', 'contentData', 'loading'])
  const emit = defineEmits(['next-step'])
  
  const generatePostContent = async () => {
    emit('generate-post')
  }
  </script>