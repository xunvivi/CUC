<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'
import { useUserStore } from './stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const darkMode = ref(localStorage.getItem('darkMode') === 'true')
const sidebarCollapsed = ref(window.innerWidth < 768)

const shouldShowLayout = computed(() => {
  return route.name !== 'Login'
})

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  localStorage.setItem('darkMode', darkMode.value.toString())
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

watch(darkMode, (newValue) => {
  if (newValue) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

onMounted(() => {
  if (darkMode.value) {
    document.documentElement.classList.add('dark')
  }
  
  // Check authentication on app mount
  const token = localStorage.getItem('auth_token')
  if (token) {
    userStore.setAuthToken(token)
    if (!userStore.user) {
      userStore.fetchUserInfo()
    }
  } else if (route.meta.requiresAuth) {
    router.push('/login')
  }
  
  // Handle route navigation based on auth
  router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  })
  
  // Handle responsive sidebar
  const handleResize = () => {
    if (window.innerWidth < 768) {
      sidebarCollapsed.value = true
    }
  }
  window.addEventListener('resize', handleResize)
})
</script>

<template>
  <div class="app-container h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <template v-if="shouldShowLayout">
      <AppHeader 
        :darkMode="darkMode" 
        @toggle-dark-mode="toggleDarkMode" 
        @toggle-sidebar="toggleSidebar" 
      />
      <div class="flex flex-1 overflow-hidden">
        <AppSidebar :collapsed="sidebarCollapsed" />
        <main class="flex-1 overflow-auto p-6">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>