<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const login = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = '请输入邮箱和密码'
    return
  }
  
  try {
    loading.value = true
    errorMessage.value = ''
    
    const success = await userStore.login(email.value, password.value)
    if (success) {
      router.push('/dashboard')
    } else {
      errorMessage.value = '账号或密码错误，请重试'
    }
  } catch (error) {
    errorMessage.value = '发生错误，请稍后重试'
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-cuc-red-600 via-cuc-red-700 to-red-900 p-4">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4 shadow-lg">
          <span class="font-serif text-2xl font-bold text-cuc-red-600">CUC</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-1 font-serif">中传推特助手</h1>
        <p class="text-cuc-red-100">推特账号自动化管理平台</p>
      </div>
      
      <!-- Login Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
        <div class="p-8">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">登录您的账号</h2>
          
          <form @submit.prevent="login" class="space-y-6">
            <!-- Error message -->
            <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-600">{{ errorMessage }}</p>
                </div>
              </div>
            </div>
            
            <!-- Email field -->
            <div>
              <label for="email" class="label">邮箱</label>
              <input 
                id="email" 
                v-model="email" 
                type="email" 
                autocomplete="email" 
                required 
                class="input"
                placeholder="user@cuc.edu.cn"
              />
            </div>
            
            <!-- Password field -->
            <div>
              <div class="flex items-center justify-between">
                <label for="password" class="label">密码</label>
                <a href="#" class="text-sm text-cuc-red-600 hover:text-cuc-red-700 dark:text-cuc-red-500">
                  忘记密码？
                </a>
              </div>
              <input 
                id="password" 
                v-model="password" 
                type="password" 
                autocomplete="current-password" 
                required 
                class="input"
                placeholder="••••••••"
              />
            </div>
            
            <!-- Remember me -->
            <div class="flex items-center">
              <input 
                id="remember_me" 
                v-model="remember" 
                type="checkbox" 
                class="h-4 w-4 text-cuc-red-600 focus:ring-cuc-red-500 border-gray-300 rounded"
              />
              <label for="remember_me" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                记住我
              </label>
            </div>
            
            <!-- Login button -->
            <div>
              <button 
                type="submit" 
                class="w-full btn-primary flex items-center justify-center"
                :disabled="loading"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? '登录中...' : '登录' }}
              </button>
            </div>
          </form>
        </div>
        
        <div class="px-8 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
          <p class="text-xs text-center text-gray-500 dark:text-gray-400">
            登录即表示您同意<a href="#" class="text-cuc-red-600 hover:text-cuc-red-800 dark:text-cuc-red-500">服务条款</a>和<a href="#" class="text-cuc-red-600 hover:text-cuc-red-800 dark:text-cuc-red-500">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>