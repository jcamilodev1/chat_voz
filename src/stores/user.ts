import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  // Estado
  const user = ref<User>({
    nickname: '',
    isLoggedIn: false
  })

  // Getters
  const isLoggedIn = computed(() => user.value.isLoggedIn)
  const nickname = computed(() => user.value.nickname)

  // Actions
  const login = (nickname: string) => {
    if (nickname.trim().length >= 3) {
      user.value.nickname = nickname.trim()
      user.value.isLoggedIn = true
      
      // Guardar en localStorage
      localStorage.setItem('chatvoz_user', JSON.stringify({
        nickname: user.value.nickname,
        timestamp: new Date().toISOString()
      }))
      
      return true
    }
    return false
  }

  const logout = () => {
    user.value.nickname = ''
    user.value.isLoggedIn = false
    
    // Limpiar localStorage
    localStorage.removeItem('chatvoz_user')
  }

  const loadUserFromStorage = () => {
    try {
      const stored = localStorage.getItem('chatvoz_user')
      if (stored) {
        const userData = JSON.parse(stored)
        if (userData.nickname && userData.nickname.length >= 3) {
          user.value.nickname = userData.nickname
          user.value.isLoggedIn = true
          return true
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
    }
    return false
  }

  const validateNickname = (nickname: string): boolean => {
    return nickname.trim().length >= 3 && nickname.trim().length <= 20
  }

  return {
    // Estado
    user,
    
    // Getters
    isLoggedIn,
    nickname,
    
    // Actions
    login,
    logout,
    loadUserFromStorage,
    validateNickname
  }
})