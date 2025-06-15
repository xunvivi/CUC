import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const authToken = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!authToken.value)

  function setAuthToken(token: string) {
    authToken.value = token
    localStorage.setItem('auth_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  function clearAuth() {
    user.value = null
    authToken.value = null
    localStorage.removeItem('auth_token')
    delete axios.defaults.headers.common['Authorization']
  }

  async function login(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      
      // In a real app, this would call your backend API
      // Simulating a login response for this example
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful login
      const mockUser = {
        id: '1',
        username: 'admin',
        email: email,
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
      }
      
      const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(2)
      
      user.value = mockUser
      setAuthToken(mockToken)
      
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to login'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      // In a real app, you might want to call a logout endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      clearAuth()
      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to logout'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUserInfo() {
    if (!authToken.value) return null
    
    try {
      loading.value = true
      error.value = null
      
      // In a real app, this would call your backend API
      // Simulating an API call for this example
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock user data
      user.value = {
        id: '1',
        username: 'admin',
        email: 'admin@cuc.edu.cn',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
      }
      
      return user.value
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user info'
      return null
    } finally {
      loading.value = false
    }
  }

  return { 
    user, 
    authToken, 
    loading, 
    error, 
    isAuthenticated,
    login, 
    logout, 
    setAuthToken,
    clearAuth,
    fetchUserInfo
  }
})