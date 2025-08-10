<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- Header del Chat -->
    <ChatHeader 
      :nickname="userStore.nickname"
      :is-connected="chatStore.isConnected"
      @logout="handleLogout"
    />

    <!-- Lista de Mensajes -->
    <div class="flex-1 overflow-hidden">
      <MessageList 
        :messages="chatStore.sortedMessages"
        class="h-full"
      />
    </div>

    <!-- Área de Grabación -->
    <div class="bg-white border-t border-gray-200 p-4">
      <VoiceRecorder 
        @message-sent="handleMessageSent"
        @error="handleRecorderError"
      />
    </div>

    <!-- Modal de Error -->
    <ErrorModal 
      v-if="showErrorModal"
      :message="errorMessage"
      @close="closeErrorModal"
    />

    <!-- Modal de Permisos -->
    <PermissionModal 
      v-if="showPermissionModal"
      @close="closePermissionModal"
      @retry="requestPermissions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import ChatHeader from '@/components/ChatHeader.vue'
import MessageList from '@/components/MessageList.vue'
import VoiceRecorder from '@/components/VoiceRecorder.vue'
import ErrorModal from '@/components/ErrorModal.vue'
import PermissionModal from '@/components/PermissionModal.vue'

const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()

// Estado local
const showErrorModal = ref(false)
const showPermissionModal = ref(false)
const errorMessage = ref('')

// Métodos
const handleLogout = () => {
  // Limpiar chat
  chatStore.cleanup()
  
  // Logout del usuario
  userStore.logout()
  
  // Redirigir al login
  router.push('/')
}

const handleMessageSent = (message: any) => {
  console.log('Mensaje enviado:', message)
}

const handleRecorderError = (error: string) => {
  errorMessage.value = error
  showErrorModal.value = true
}

const closeErrorModal = () => {
  showErrorModal.value = false
  errorMessage.value = ''
}

const closePermissionModal = () => {
  showPermissionModal.value = false
}

const requestPermissions = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    closePermissionModal()
  } catch (error) {
    console.error('Error requesting permissions:', error)
    errorMessage.value = 'No se pudieron obtener los permisos de micrófono'
    showErrorModal.value = true
  }
}

const checkPermissions = async () => {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
    if (result.state === 'denied') {
      showPermissionModal.value = true
    }
  } catch (error) {
    // Fallback: intentar acceder directamente
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
    } catch (micError) {
      showPermissionModal.value = true
    }
  }
}

// Lifecycle
onMounted(async () => {
  // Verificar si el usuario está logueado
  if (!userStore.isLoggedIn) {
    const hasStoredUser = userStore.loadUserFromStorage()
    if (!hasStoredUser) {
      router.push('/')
      return
    }
  }

  // Inicializar chat
  chatStore.initializeBroadcastChannel()
  
  // Verificar permisos de micrófono
  await checkPermissions()
})

onUnmounted(() => {
  // Cleanup al salir
  chatStore.cleanup()
})
</script>