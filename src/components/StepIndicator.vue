<template>
    <div class="flex items-center justify-between mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div v-for="(step, index) in steps" :key="step.id" class="flex items-center">
        <div class="flex items-center">
          <div :class="[
            'w-12 h-12 rounded-full flex items-center justify-center',
            currentStep >= step.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
          ]">
            <svg v-if="step.title === '内容生成'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 6V12L16 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else-if="step.title === '评论生成'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else-if="step.title === '内容评估'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 8 12 3 7 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="3" x2="12" y2="15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="ml-3">
            <p :class="[
              'font-medium',
              currentStep >= step.id ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'
            ]">
              {{ step.title }}
            </p>
          </div>
        </div>
        <ChevronRight v-if="index < steps.length - 1" class="w-5 h-5 text-gray-300 dark:text-gray-600" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue'
  import ChevronRight from './icons/ChevronRight.vue'
  
  defineProps({
    currentStep: Number,
    steps: Array
  })
  </script>