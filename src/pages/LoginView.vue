<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <img src="@/assets/icons/microphone.svg" alt="ChatVoz" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">ChatVoz</h1>
        <p class="text-gray-600">Comunícate con mensajes de voz</p>
      </div>

      <!-- Formulario de Login -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="nickname" class="block text-sm font-medium text-gray-700 mb-2">
            Nickname
          </label>
          <input
            id="nickname"
            v-model="nickname"
            type="text"
            placeholder="Ingresa tu nickname (mínimo 3 caracteres)"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :class="{
              'border-red-300 focus:ring-red-500 focus:border-red-500': hasError,
              'border-green-300 focus:ring-green-500 focus:border-green-500': isValid && nickname.length > 0
            }"
            maxlength="20"
            autocomplete="username"
            required
          >
          
          <!-- Validación en tiempo real -->
          <div class="mt-2 text-sm">
            <div v-if="nickname.length > 0 && nickname.length < 3" class="text-red-600">
              El nickname debe tener al menos 3 caracteres
            </div>
            <div v-else-if="nickname.length > 20" class="text-red-600">
              El nickname no puede tener más de 20 caracteres
            </div>
            <div v-else-if="isValid" class="text-green-600">
              ✓ Nickname válido
            </div>
          </div>
        </div>

        <!-- Error general -->
        <div v-if="errorMessage" class="text-red-600 text-sm text-center">
          {{ errorMessage }}
        </div>

        <!-- Botón de login -->
        <button
          type="submit"
          :disabled="!isValid || isLoading"
          class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span v-if="isLoading" class="flex items-center justify-center">
            <img src="@/assets/icons/loading-spinner.svg" alt="Cargando" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
            Ingresando...
          </span>
          <span v-else>Ingresar al Chat</span>
        </button>
      </form>

      <!-- Información adicional -->
      <div class="mt-6 text-center text-sm text-gray-500">
        <p>Tu nickname se guardará localmente para futuras sesiones</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Estado local
const nickname = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const hasError = ref(false)

// Computed
const isValid = computed(() => {
  return userStore.validateNickname(nickname.value)
})

// Métodos
const handleLogin = async () => {
  if (!isValid.value) {
    hasError.value = true
    errorMessage.value = 'Por favor ingresa un nickname válido'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  hasError.value = false

  try {
    const success = userStore.login(nickname.value)
    
    if (success) {
      // Pequeña pausa para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirigir al chat
      router.push('/chat')
    } else {
      throw new Error('Error al iniciar sesión')
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = 'Error al iniciar sesión. Inténtalo de nuevo.'
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

// Verificar si ya hay un usuario logueado
onMounted(() => {
  const hasStoredUser = userStore.loadUserFromStorage()
  if (hasStoredUser) {
    router.push('/chat')
  }
})
</script>