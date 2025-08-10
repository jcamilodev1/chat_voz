import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VoiceMessage, ChatState, BroadcastMessage, BroadcastVoiceMessageData } from '@/types'
import { useUserStore } from './user'

export const useChatStore = defineStore('chat', () => {
  // Estado
  const messages = ref<VoiceMessage[]>([])
  const isConnected = ref(false)
  const broadcastChannel = ref<BroadcastChannel | null>(null)

  // Getters
  const sortedMessages = computed(() => 
    [...messages.value].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  )

  const messageCount = computed(() => messages.value.length)

  // Actions
  const initializeBroadcastChannel = () => {
    try {
      broadcastChannel.value = new BroadcastChannel('chatvoz-chat')
      
      broadcastChannel.value.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        const { type, data } = event.data
        
        if (type === 'voice_message') {
          const voiceData = data as BroadcastVoiceMessageData
          
          // Convertir ArrayBuffer de vuelta a Blob y crear URL
          const audioBlob = new Blob([voiceData.audioArrayBuffer], { type: 'audio/wav' })
          const audioUrl = URL.createObjectURL(audioBlob)
          
          const message: VoiceMessage = {
            id: voiceData.id,
            nickname: voiceData.nickname,
            audioBlob,
            audioUrl,
            duration: voiceData.duration,
            timestamp: new Date(voiceData.timestamp),
            isOwn: voiceData.isOwn
          }
          
          addMessage(message)
        }
      }
      
      isConnected.value = true
      console.log('BroadcastChannel initialized successfully')
    } catch (error) {
      console.error('Error initializing BroadcastChannel:', error)
      isConnected.value = false
    }
  }

  const sendMessage = async (audioBlob: Blob, duration: number) => {
    const userStore = useUserStore()
    
    if (!userStore.isLoggedIn || !broadcastChannel.value) {
      throw new Error('User not logged in or broadcast channel not initialized')
    }

    const audioUrl = URL.createObjectURL(audioBlob)
    
    const message: VoiceMessage = {
      id: generateMessageId(),
      nickname: userStore.nickname,
      audioBlob,
      audioUrl,
      duration,
      timestamp: new Date(),
      isOwn: true
    }

    // Agregar mensaje localmente
    addMessage(message)

    // Convertir blob a ArrayBuffer para envío
    const audioArrayBuffer = await audioBlob.arrayBuffer()

    // Enviar a través del BroadcastChannel
    const broadcastData: BroadcastVoiceMessageData = {
      id: message.id,
      nickname: message.nickname,
      audioArrayBuffer,
      duration,
      timestamp: message.timestamp,
      isOwn: false // Para otros usuarios será false
    }

    const broadcastMessage: BroadcastMessage = {
      type: 'voice_message',
      data: broadcastData,
      timestamp: new Date()
    }

    broadcastChannel.value.postMessage(broadcastMessage)
  }

  const addMessage = (message: VoiceMessage) => {
    // Evitar duplicados
    if (!messages.value.find(m => m.id === message.id)) {
      messages.value.push(message)
    }
  }

  const clearMessages = () => {
    // Limpiar URLs de objetos para evitar memory leaks
    messages.value.forEach(message => {
      if (message.audioUrl) {
        URL.revokeObjectURL(message.audioUrl)
      }
    })
    
    messages.value = []
  }

  const disconnect = () => {
    if (broadcastChannel.value) {
      broadcastChannel.value.close()
      broadcastChannel.value = null
    }
    isConnected.value = false
  }

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Cleanup al destruir el store
  const cleanup = () => {
    clearMessages()
    disconnect()
  }

  return {
    // Estado
    messages,
    isConnected,
    
    // Getters
    sortedMessages,
    messageCount,
    
    // Actions
    initializeBroadcastChannel,
    sendMessage,
    addMessage,
    clearMessages,
    disconnect,
    cleanup
  }
})