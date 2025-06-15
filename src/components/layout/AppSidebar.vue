<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
const router = useRouter()

const navItems = [
  {
    name: '仪表盘',
    path: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    name: '账号管理',
    path: '/accounts',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    name: '推文管理',
    path: '/tweets',
    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
  },
  {
    name: '操作一体化',
    path: '/integrated-operations',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1h6a2 2 0 011 1v2M7 7h10'
  },
  {
    name: '评论文本生成',
    path: '/comment-generation',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    name: '推文内容生成',
    path: '/tweet-generation',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
  },
  {
    name: '内容评估',
    path: '/content-evaluation',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    name: '策略研究',
    path: '/automation',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
  },
  {
    name: '数据分析',
    path: '/analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    name: '设置',
    path: '/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
  }
]

const isActive = (path: string) => route.path === path

const activeItemClass = computed(() => 
  'flex items-center px-4 py-3 text-cuc-red-600 dark:text-cuc-red-500 bg-cuc-red-50 dark:bg-gray-800 border-r-4 border-cuc-red-600 dark:border-cuc-red-500 transition-colors duration-200'
)

const inactiveItemClass = computed(() => 
  'flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cuc-red-600 dark:hover:text-cuc-red-500 transition-colors duration-200'
)
</script>

<template>
  <aside 
    class="h-full transition-all duration-300 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
    :class="collapsed ? 'w-16' : 'w-64'"
  >
    <div class="h-full flex flex-col">
      <!-- University logo -->
      <div class="p-4 flex justify-center">
        <div v-if="!collapsed" class="flex items-center">
          <span class="text-cuc-red-600 dark:text-cuc-red-500 font-serif text-xl font-bold mr-1">CUC</span>
          <span class="text-gray-700 dark:text-gray-300 text-sm">推特助手</span>
        </div>
        <div v-else class="w-8 h-8 flex items-center justify-center rounded-full bg-cuc-red-600 text-white font-serif font-bold">
          C
        </div>
      </div>
      
      <nav class="flex-1 overflow-y-auto py-2">
        <ul class="space-y-1">
          <li v-for="item in navItems" :key="item.path">
            <router-link 
              :to="item.path" 
              :class="isActive(item.path) ? activeItemClass : inactiveItemClass"
              :title="collapsed ? item.name : ''"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5" 
                :class="collapsed ? 'mx-auto' : 'mr-3'" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
              </svg>
              <span v-if="!collapsed">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <div v-if="!collapsed" class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>版本 1.0.0</span>
          <span>© CUC 2025</span>
        </div>
        <div v-else class="flex justify-center text-xs text-gray-500">
          <span>1.0</span>
        </div>
      </div>
    </div>
  </aside>
</template>