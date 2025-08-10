import { ref, computed, onUnmounted } from 'vue'
import type { AudioPlayerState, PlaybackRate } from '@/types'

export function useAudioPlayer() {
  // Estado
  const audio = ref<HTMLAudioElement | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const playbackRate = ref<PlaybackRate>(1)
  const volume = ref(1)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Intervalos para actualización
  const updateInterval = ref<number | null>(null)

  // Getters
  const progress = computed(() => 
    duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  )

  const formattedCurrentTime = computed(() => formatTime(currentTime.value))
  const formattedDuration = computed(() => formatTime(duration.value))
  const remainingTime = computed(() => duration.value - currentTime.value)
  const formattedRemainingTime = computed(() => formatTime(remainingTime.value))

  const canPlay = computed(() => 
    audio.value && !isLoading.value && !error.value
  )

  // Cargar audio
  const loadAudio = async (audioUrl: string): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null
      
      // Validar URL
      if (!audioUrl || audioUrl.trim() === '') {
        throw new Error('URL de audio vacía o inválida')
      }
      
      console.log('🎵 Cargando audio desde:', audioUrl.substring(0, 50) + '...')
      
      // Limpiar audio anterior
      if (audio.value) {
        cleanup()
      }

      audio.value = new Audio(audioUrl)
      audio.value.preload = 'metadata'
      audio.value.playbackRate = playbackRate.value
      audio.value.volume = volume.value

      // Event listeners
      audio.value.addEventListener('loadedmetadata', () => {
        duration.value = audio.value?.duration || 0
        isLoading.value = false
        console.log('✅ Audio metadata cargada, duración:', duration.value)
      })

      audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value?.currentTime || 0
      })

      audio.value.addEventListener('ended', () => {
        isPlaying.value = false
        currentTime.value = 0
        stopUpdateInterval()
        console.log('🏁 Reproducción de audio terminada')
      })

      audio.value.addEventListener('error', (e) => {
        const audioError = audio.value?.error
        let errorMessage = 'Error desconocido al cargar el audio'
        
        if (audioError) {
          switch (audioError.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Carga de audio abortada'
              break
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Error de red al cargar audio'
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Error al decodificar audio'
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Formato de audio no soportado'
              break
          }
        }
        
        console.error('❌ Error de audio:', errorMessage, audioError)
        error.value = errorMessage
        isLoading.value = false
        isPlaying.value = false
      })

      audio.value.addEventListener('canplay', () => {
        isLoading.value = false
        console.log('▶️ Audio listo para reproducir')
      })

      // Cargar metadata con timeout
      await new Promise((resolve, reject) => {
        if (!audio.value) {
          reject(new Error('Elemento de audio no disponible'))
          return
        }

        let timeoutId: number
        
        const handleLoad = () => {
          clearTimeout(timeoutId)
          audio.value?.removeEventListener('loadedmetadata', handleLoad)
          audio.value?.removeEventListener('error', handleError)
          audio.value?.removeEventListener('canplaythrough', handleLoad)
          resolve(true)
        }

        const handleError = (e: Event) => {
          clearTimeout(timeoutId)
          audio.value?.removeEventListener('loadedmetadata', handleLoad)
          audio.value?.removeEventListener('error', handleError)
          audio.value?.removeEventListener('canplaythrough', handleLoad)
          reject(new Error('Error al cargar el audio'))
        }

        // Timeout de 10 segundos
        timeoutId = window.setTimeout(() => {
          audio.value?.removeEventListener('loadedmetadata', handleLoad)
          audio.value?.removeEventListener('error', handleError)
          audio.value?.removeEventListener('canplaythrough', handleLoad)
          reject(new Error('Timeout al cargar el audio'))
        }, 10000)

        audio.value.addEventListener('loadedmetadata', handleLoad)
        audio.value.addEventListener('canplaythrough', handleLoad)
        audio.value.addEventListener('error', handleError)
        
        audio.value.load()
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ Error cargando audio:', errorMessage)
      error.value = errorMessage
      isLoading.value = false
      return false
    }
  }

  // Reproducir audio
  const play = async (): Promise<boolean> => {
    try {
      if (!audio.value || isLoading.value) return false

      await audio.value.play()
      isPlaying.value = true
      startUpdateInterval()
      return true
    } catch (err) {
      console.error('Error playing audio:', err)
      error.value = 'Error al reproducir el audio'
      isPlaying.value = false
      return false
    }
  }

  // Pausar audio
  const pause = () => {
    if (audio.value && isPlaying.value) {
      audio.value.pause()
      isPlaying.value = false
      stopUpdateInterval()
    }
  }

  // Toggle play/pause
  const togglePlay = async (): Promise<boolean> => {
    if (isPlaying.value) {
      pause()
      return false
    } else {
      return await play()
    }
  }

  // Detener audio
  const stop = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
      currentTime.value = 0
      isPlaying.value = false
      stopUpdateInterval()
    }
  }

  // Buscar posición específica
  const seek = (time: number) => {
    if (audio.value && duration.value > 0) {
      const clampedTime = Math.max(0, Math.min(time, duration.value))
      audio.value.currentTime = clampedTime
      currentTime.value = clampedTime
    }
  }

  // Buscar por porcentaje
  const seekByPercentage = (percentage: number) => {
    const clampedPercentage = Math.max(0, Math.min(percentage, 100))
    const time = (clampedPercentage / 100) * duration.value
    seek(time)
  }

  // Cambiar velocidad de reproducción
  const setPlaybackRate = (rate: PlaybackRate) => {
    playbackRate.value = rate
    if (audio.value) {
      audio.value.playbackRate = rate
    }
  }

  // Cambiar volumen
  const setVolume = (vol: number) => {
    const clampedVolume = Math.max(0, Math.min(vol, 1))
    volume.value = clampedVolume
    if (audio.value) {
      audio.value.volume = clampedVolume
    }
  }

  // Avanzar/retroceder
  const skipForward = (seconds: number = 10) => {
    seek(currentTime.value + seconds)
  }

  const skipBackward = (seconds: number = 10) => {
    seek(currentTime.value - seconds)
  }

  // Iniciar intervalo de actualización
  const startUpdateInterval = () => {
    if (updateInterval.value) return
    
    updateInterval.value = window.setInterval(() => {
      if (audio.value && isPlaying.value) {
        currentTime.value = audio.value.currentTime
      }
    }, 100)
  }

  // Detener intervalo de actualización
  const stopUpdateInterval = () => {
    if (updateInterval.value) {
      clearInterval(updateInterval.value)
      updateInterval.value = null
    }
  }

  // Formatear tiempo en MM:SS
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '0:00'
    
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Obtener información del audio
  const getAudioInfo = () => {
    return {
      duration: duration.value,
      currentTime: currentTime.value,
      playbackRate: playbackRate.value,
      volume: volume.value,
      isPlaying: isPlaying.value,
      progress: progress.value
    }
  }

  // Limpiar recursos
  const cleanup = () => {
    stopUpdateInterval()
    
    if (audio.value) {
      audio.value.pause()
      audio.value.src = ''
      audio.value.load()
      audio.value = null
    }
    
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
    error.value = null
    isLoading.value = false
  }

  // Cleanup al desmontar
  onUnmounted(() => {
    cleanup()
  })

  return {
    // Estado
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isLoading,
    error,
    
    // Getters
    progress,
    formattedCurrentTime,
    formattedDuration,
    formattedRemainingTime,
    remainingTime,
    canPlay,
    
    // Actions
    loadAudio,
    play,
    pause,
    togglePlay,
    stop,
    seek,
    seekByPercentage,
    setPlaybackRate,
    setVolume,
    skipForward,
    skipBackward,
    getAudioInfo,
    cleanup
  }
}