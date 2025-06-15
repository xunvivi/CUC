<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../stores/user'
import { useRouter } from 'vue-router'

defineProps<{
  darkMode: boolean
}>()

const emit = defineEmits(['toggle-dark-mode', 'toggle-sidebar'])
const userStore = useUserStore()
const router = useRouter()
const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
    <div class="h-16 px-4 flex items-center justify-between">
      <!-- Left section: Logo and menu toggle -->
      <div class="flex items-center gap-4">
        <button 
          @click="emit('toggle-sidebar')" 
          class="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="切换侧边栏"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div class="flex items-center">
          <span class="text-cuc-red-600 dark:text-cuc-red-500 font-serif text-xl font-bold mr-1">CUC</span>
          <span class="text-gray-700 dark:text-gray-300 text-xl font-medium">推特助手</span>
        </div>
      </div>
      
      <!-- Right section: Dark mode toggle, notifications, user profile -->
      <div class="flex items-center gap-3">
        <button 
          @click="emit('toggle-dark-mode')" 
          class="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="切换暗色模式"
        >
          <svg v-if="darkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
        
        <button class="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative" aria-label="通知">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute top-1 right-1 h-2 w-2 bg-cuc-red-500 rounded-full"></span>
        </button>
        
        <div class="relative">
          <button 
            @click="toggleUserMenu" 
            class="flex items-center gap-2 cursor-pointer"
            aria-label="用户菜单"
          >
            <img 
              v-if="userStore.user?.avatar" 
              :src="userStore.user.avatar" 
              alt="用户头像" 
              class="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
            />
            <div v-else class="h-8 w-8 bg-cuc-red-100 text-cuc-red-600 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium">{{ userStore.user?.username?.charAt(0).toUpperCase() || 'U' }}</span>
            </div>
            <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ userStore.user?.username || '用户' }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div 
            v-if="showUserMenu" 
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700 animate-fade-in"
          >
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">个人资料</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">设置</a>
            <button 
              @click="logout" 
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>