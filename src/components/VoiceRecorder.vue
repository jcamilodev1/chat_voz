<template>
  <div class="space-y-4">
    <!-- Estado de permisos -->
    <div v-if="!permissions.granted && !permissions.denied" class="text-center">
      <button
        @click="requestPermission"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Permitir acceso al micrófono
      </button>
    </div>

    <!-- Permisos denegados -->
    <div v-else-if="permissions.denied" class="text-center text-red-600">
      <p class="text-sm mb-2">Se necesita acceso al micrófono para enviar mensajes de voz</p>
      <button
        @click="requestPermission"
        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
      >
        Intentar de nuevo
      </button>
    </div>

    <!-- Interfaz de grabación -->
    <div v-else class="space-y-4">
      <!-- Visualizador de audio -->
      <div class="flex items-center justify-center">
        <div class="flex items-center space-x-1">
          <div
            v-for="i in 20"
            :key="i"
            class="w-1 bg-blue-600 rounded-full transition-all duration-100"
            :style="{
              height: `${isRecording ? getBarHeight(i) : 4}px`,
              opacity: isRecording ? 1 : 0.3
            }"
          ></div>
        </div>
      </div>

      <!-- Controles principales -->
      <div class="flex items-center justify-center space-x-4">
        <!-- Botón de grabación -->
        <button
          @click="handleRecordToggle"
          :disabled="!canRecord && !canStop"
          class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 transform"
          :class="{
            'bg-red-600 hover:bg-red-700 scale-110': isRecording,
            'bg-green-600 hover:bg-green-700': !isRecording && canRecord,
            'bg-gray-400 cursor-not-allowed': !canRecord && !canStop
          }"
        >
          <!-- Microphone icon (when not recording) -->
          <img v-if="!isRecording" src="@/assets/icons/microphone.svg" alt="Grabar" class="w-8 h-8 text-white" />
          
          <!-- Stop icon (when recording) -->
          <img v-else src="@/assets/icons/stop.svg" alt="Detener" class="w-8 h-8 text-white" />
        </button>

        <!-- Botón de cancelar (solo durante grabación) -->
        <button
          v-if="isRecording"
          @click="handleCancel"
          class="w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 flex items-center justify-center transition-colors"
          title="Cancelar grabación"
        >
          <img src="@/assets/icons/cancel.svg" alt="Cancelar" class="w-6 h-6" />
        </button>
      </div>

      <!-- Información de grabación -->
      <div class="text-center space-y-2">
        <!-- Tiempo de grabación -->
        <div v-if="isRecording" class="space-y-1">
          <div class="text-2xl font-mono font-bold text-gray-900">
            {{ formattedRecordingTime }}
          </div>
          <div class="text-sm text-gray-500">
            Tiempo restante: {{ formattedRemainingTime }}
          </div>
          
          <!-- Barra de progreso -->
          <div class="w-full bg-gray-200 rounded-full h-2 mx-auto max-w-xs">
            <div 
              class="bg-red-600 h-2 rounded-full transition-all duration-200"
              :style="{ width: `${recordingProgress}%` }"
            ></div>
          </div>
        </div>

        <!-- Instrucciones -->
        <div v-else class="text-sm text-gray-500">
          <p>Mantén presionado para grabar (máximo 30 segundos)</p>
        </div>
      </div>

      <!-- Estado de envío -->
      <div v-if="isSending" class="text-center">
        <div class="flex items-center justify-center space-x-2">
          <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-gray-600">Enviando mensaje...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAudioRecorder } from '@/composables/useAudioRecorder'
import { useChatStore } from '@/stores/chat'

// Emits
const emit = defineEmits<{
  'message-sent': [message: any]
  'error': [error: string]
}>()

// Stores
const chatStore = useChatStore()

// Composables
const {
  isRecording,
  recordingTime,
  maxRecordingTime,
  permissions,
  canRecord,
  canStop,
  recordingProgress,
  remainingTime,
  requestMicrophonePermission,
  startRecording,
  stopRecording,
  cancelRecording,
  getAudioLevel
} = useAudioRecorder()

// Estado local
const isSending = ref(false)
const audioLevels = ref<number[]>(new Array(20).fill(0))
const animationFrame = ref<number | null>(null)

// Computed
const formattedRecordingTime = computed(() => {
  const seconds = Math.floor(recordingTime.value)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const formattedRemainingTime = computed(() => {
  const remaining = Math.floor(remainingTime.value)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

// Métodos
const requestPermission = async () => {
  const granted = await requestMicrophonePermission()
  if (!granted) {
    emit('error', 'No se pudo obtener acceso al micrófono')
  }
}

const handleRecordToggle = async () => {
  if (isRecording.value) {
    await handleStopRecording()
  } else {
    await handleStartRecording()
  }
}

const handleStartRecording = async () => {
  try {
    const success = await startRecording()
    if (!success) {
      emit('error', 'No se pudo iniciar la grabación')
      return
    }
    
    // Iniciar animación de barras
    startAudioVisualization()
  } catch (error) {
    console.error('Error starting recording:', error)
    emit('error', 'Error al iniciar la grabación')
  }
}

const handleStopRecording = async () => {
  try {
    isSending.value = true
    
    const audioBlob = await stopRecording()
    
    if (!audioBlob) {
      emit('error', 'La grabación está vacía o en silencio')
      return
    }

    // Calcular duración real del audio
    const realDuration = await calculateAudioDuration(audioBlob)

    // Enviar mensaje
    await chatStore.sendMessage(audioBlob, realDuration)
    
    emit('message-sent', {
      duration: realDuration,
      size: audioBlob.size
    })
    
  } catch (error) {
    console.error('Error stopping recording:', error)
    emit('error', 'Error al enviar el mensaje')
  } finally {
    isSending.value = false
    stopAudioVisualization()
  }
}

const handleCancel = () => {
  cancelRecording()
  stopAudioVisualization()
}

const startAudioVisualization = () => {
  const updateVisualization = () => {
    if (!isRecording.value) return
    
    const level = getAudioLevel()
    
    // Actualizar niveles con efecto de onda
    audioLevels.value = audioLevels.value.map((_, index) => {
      const distance = Math.abs(index - 10) / 10
      const amplitude = level * (1 - distance * 0.5)
      return Math.max(0.1, amplitude + Math.random() * 0.1)
    })
    
    animationFrame.value = requestAnimationFrame(updateVisualization)
  }
  
  updateVisualization()
}

const stopAudioVisualization = () => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = null
  }
  
  // Reset levels
  audioLevels.value = new Array(20).fill(0)
}

const getBarHeight = (index: number): number => {
  const level = audioLevels.value[index] || 0
  return Math.max(4, level * 40)
}

// Calcular duración real del audio desde el blob
const calculateAudioDuration = async (audioBlob: Blob): Promise<number> => {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const duration = audioBuffer.duration
    await audioContext.close()
    return duration
  } catch (error) {
    console.error('Error calculating audio duration:', error)
    // Fallback al tiempo de grabación si hay error
    return recordingTime.value
  }
}

// Lifecycle
onMounted(async () => {
  // Verificar permisos al montar
  if (!permissions.value.granted && !permissions.value.denied) {
    await requestPermission()
  }
})

onUnmounted(() => {
  stopAudioVisualization()
})
</script>