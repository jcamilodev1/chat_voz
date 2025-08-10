<template>
  <div 
    class="flex items-start space-x-3"
    :class="{
      'flex-row-reverse space-x-reverse': isOwn
    }"
  >
    <!-- Avatar -->
    <div 
      class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      :class="{
        'bg-blue-600': isOwn,
        'bg-gray-400': !isOwn
      }"
    >
      <span class="text-white text-xs font-medium">
        {{ avatarText }}
      </span>
    </div>

    <!-- Mensaje -->
    <div 
      class="rounded-2xl p-4 max-w-full"
      :class="{
        'bg-blue-600 text-white': isOwn,
        'bg-white border border-gray-200': !isOwn
      }"
    >
      <!-- Header del mensaje -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <!-- Nickname -->
          <span 
            class="text-sm font-medium"
            :class="{
              'text-blue-100': isOwn,
              'text-gray-900': !isOwn
            }"
          >
            {{ isOwn ? 'Tú' : message.nickname }}
          </span>
          
          <!-- Duración -->
          <span 
            class="text-xs"
            :class="{
              'text-blue-200': isOwn,
              'text-gray-500': !isOwn
            }"
          >
            {{ formattedDuration }}
          </span>
        </div>
        
        <!-- Timestamp -->
        <span 
          class="text-xs"
          :class="{
            'text-blue-200': isOwn,
            'text-gray-500': !isOwn
          }"
        >
          {{ formattedTime }}
        </span>
      </div>

      <!-- Reproductor de audio -->
      <div class="space-y-3">
        <!-- Controles principales -->
        <div class="flex items-center space-x-3">
          <!-- Botón play/pause -->
          <button
            @click="togglePlay"
            :disabled="isLoading"
            class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            :class="{
              'bg-white text-blue-600 hover:bg-blue-50': isOwn,
              'bg-blue-600 text-white hover:bg-blue-700': !isOwn,
              'opacity-50 cursor-not-allowed': isLoading
            }"
          >
            <!-- Loading spinner -->
            <img v-if="isLoading" src="@/assets/icons/loading-spinner.svg" alt="Cargando" class="animate-spin w-5 h-5" />
            
            <!-- Play icon -->
            <img v-else-if="!isPlaying" src="@/assets/icons/play.svg" alt="Reproducir" class="w-5 h-5" />
            
            <!-- Pause icon -->
            <img v-else src="@/assets/icons/pause.svg" alt="Pausar" class="w-5 h-5" />
          </button>

          <!-- Barra de progreso -->
          <div class="flex-1">
            <div 
              class="h-2 rounded-full cursor-pointer"
              :class="{
                'bg-blue-200': isOwn,
                'bg-gray-200': !isOwn
              }"
              @click="handleProgressClick"
            >
              <div 
                class="h-full rounded-full transition-all duration-200"
                :class="{
                  'bg-white': isOwn,
                  'bg-blue-600': !isOwn
                }"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
            
            <!-- Tiempo actual / total -->
            <div class="flex justify-between mt-1">
              <span 
                class="text-xs"
                :class="{
                  'text-blue-200': isOwn,
                  'text-gray-500': !isOwn
                }"
              >
                {{ formattedCurrentTime }}
              </span>
              <span 
                class="text-xs"
                :class="{
                  'text-blue-200': isOwn,
                  'text-gray-500': !isOwn
                }"
              >
                {{ formattedTotalDuration }}
              </span>
            </div>
          </div>
        </div>

        <!-- Controles de velocidad -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-1">
            <span 
              class="text-xs"
              :class="{
                'text-blue-200': isOwn,
                'text-gray-500': !isOwn
              }"
            >
              Velocidad:
            </span>
            <div class="flex space-x-1">
              <button
                v-for="rate in playbackRates"
                :key="rate"
                @click="setPlaybackRate(rate)"
                class="px-2 py-1 text-xs rounded transition-all duration-200"
                :class="{
                  'bg-white text-blue-600': isOwn && playbackRate === rate,
                  'bg-blue-200 text-blue-800': isOwn && playbackRate !== rate,
                  'bg-blue-600 text-white': !isOwn && playbackRate === rate,
                  'bg-gray-100 text-gray-600': !isOwn && playbackRate !== rate
                }"
              >
                {{ rate }}x
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="mt-2 text-xs text-red-300">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { VoiceMessage, PlaybackRate } from '@/types'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

// Props
interface Props {
  message: VoiceMessage
  isOwn: boolean
}

const props = defineProps<Props>()

// Composables
const {
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  isLoading,
  error,
  progress,
  formattedCurrentTime,
  formattedDuration: formattedTotalDuration,
  loadAudio,
  togglePlay,
  setPlaybackRate,
  seekByPercentage,
  cleanup
} = useAudioPlayer()

// Constantes
const playbackRates: PlaybackRate[] = [1, 1.5, 2]

// Computed
const avatarText = computed(() => {
  return props.message.nickname.slice(0, 2).toUpperCase()
})

const formattedTime = computed(() => {
  const date = new Date(props.message.timestamp)
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
})

const formattedDuration = computed(() => {
  const seconds = Math.floor(props.message.duration)
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

// Métodos
const handleProgressClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = (clickX / rect.width) * 100
  seekByPercentage(percentage)
}

// Lifecycle
onMounted(async () => {
  // Cargar el audio cuando se monta el componente
  try {
    if (props.message.audioUrl) {
      await loadAudio(props.message.audioUrl)
    } else {
      console.error('No audio URL available for message:', props.message.id)
    }
  } catch (error) {
    console.error('Error loading audio:', error)
  }
})

onUnmounted(() => {
  // Limpiar recursos al desmontar
  cleanup()
})
</script>