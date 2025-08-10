import { ref, computed, onUnmounted } from 'vue'
import type { AudioRecorderState, AudioPermissions } from '@/types'

export function useAudioRecorder() {
  // Estado
  const isRecording = ref(false)
  const isPaused = ref(false)
  const recordingTime = ref(0)
  const maxRecordingTime = ref(30) // 30 segundos máximo
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const audioChunks = ref<Blob[]>([])
  const stream = ref<MediaStream | null>(null)
  const recordingInterval = ref<number | null>(null)
  const audioContext = ref<AudioContext | null>(null)
  const analyser = ref<AnalyserNode | null>(null)
  const microphone = ref<MediaStreamAudioSourceNode | null>(null)

  // Permisos
  const permissions = ref<AudioPermissions>({
    granted: false,
    denied: false,
    prompt: true
  })

  // Getters
  const canRecord = computed(() => 
    permissions.value.granted && !isRecording.value && recordingTime.value < maxRecordingTime.value
  )

  const canStop = computed(() => isRecording.value)

  const recordingProgress = computed(() => 
    (recordingTime.value / maxRecordingTime.value) * 100
  )

  const remainingTime = computed(() => 
    maxRecordingTime.value - recordingTime.value
  )

  // Solicitar permisos de micrófono
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Detener el stream temporal
      tempStream.getTracks().forEach(track => track.stop())
      
      permissions.value = {
        granted: true,
        denied: false,
        prompt: false
      }
      
      return true
    } catch (error) {
      console.error('Error requesting microphone permission:', error)
      
      permissions.value = {
        granted: false,
        denied: true,
        prompt: false
      }
      
      return false
    }
  }

  // Inicializar grabación
  const startRecording = async (): Promise<boolean> => {
    try {
      if (!permissions.value.granted) {
        const hasPermission = await requestMicrophonePermission()
        if (!hasPermission) return false
      }

      // Obtener stream de audio
      stream.value = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })

      // Configurar AudioContext para análisis
      audioContext.value = new AudioContext()
      analyser.value = audioContext.value.createAnalyser()
      microphone.value = audioContext.value.createMediaStreamSource(stream.value)
      
      analyser.value.fftSize = 256
      microphone.value.connect(analyser.value)

      // Configurar MediaRecorder
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      }
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm'
      }
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/mp4'
      }

      mediaRecorder.value = new MediaRecorder(stream.value, options)
      audioChunks.value = []

      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data)
        }
      }

      // Iniciar grabación
      mediaRecorder.value.start(100) // Recopilar datos cada 100ms
      isRecording.value = true
      recordingTime.value = 0

      // Iniciar contador de tiempo
      recordingInterval.value = window.setInterval(() => {
        recordingTime.value += 0.1
        
        // Detener automáticamente al llegar al límite
        if (recordingTime.value >= maxRecordingTime.value) {
          stopRecording()
        }
      }, 100)

      return true
    } catch (error) {
      console.error('Error starting recording:', error)
      cleanup()
      return false
    }
  }

  // Detener grabación
  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.value || !isRecording.value) {
        resolve(null)
        return
      }

      mediaRecorder.value.onstop = async () => {
        const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
        
        // Validar que el audio no esté vacío o en silencio
        const isValid = await validateAudioContent(audioBlob)
        
        cleanup()
        
        if (isValid) {
          resolve(audioBlob)
        } else {
          resolve(null)
        }
      }

      mediaRecorder.value.stop()
      isRecording.value = false
    })
  }

  // Cancelar grabación
  const cancelRecording = () => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
      isRecording.value = false
    }
    cleanup()
  }

  // Validar contenido de audio (detectar silencio)
  const validateAudioContent = async (audioBlob: Blob): Promise<boolean> => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioContext = new AudioContext()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      
      // Analizar el canal de audio
      const channelData = audioBuffer.getChannelData(0)
      let sum = 0
      let maxAmplitude = 0
      
      for (let i = 0; i < channelData.length; i++) {
        const amplitude = Math.abs(channelData[i])
        sum += amplitude
        maxAmplitude = Math.max(maxAmplitude, amplitude)
      }
      
      const averageAmplitude = sum / channelData.length
      
      // Considerar válido si hay suficiente amplitud promedio y picos
      const isValid = averageAmplitude > 0.001 && maxAmplitude > 0.01
      
      await audioContext.close()
      
      return isValid
    } catch (error) {
      console.error('Error validating audio content:', error)
      return false
    }
  }

  // Obtener nivel de audio en tiempo real
  const getAudioLevel = (): number => {
    if (!analyser.value) return 0
    
    const dataArray = new Uint8Array(analyser.value.frequencyBinCount)
    analyser.value.getByteFrequencyData(dataArray)
    
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    
    return sum / dataArray.length / 255 // Normalizar a 0-1
  }

  // Limpiar recursos
  const cleanup = () => {
    if (recordingInterval.value) {
      clearInterval(recordingInterval.value)
      recordingInterval.value = null
    }
    
    if (stream.value) {
      stream.value.getTracks().forEach(track => track.stop())
      stream.value = null
    }
    
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
    
    analyser.value = null
    microphone.value = null
    mediaRecorder.value = null
    audioChunks.value = []
    recordingTime.value = 0
  }

  // Cleanup al desmontar
  onUnmounted(() => {
    cleanup()
  })

  return {
    // Estado
    isRecording,
    isPaused,
    recordingTime,
    maxRecordingTime,
    permissions,
    
    // Getters
    canRecord,
    canStop,
    recordingProgress,
    remainingTime,
    
    // Actions
    requestMicrophonePermission,
    startRecording,
    stopRecording,
    cancelRecording,
    getAudioLevel,
    cleanup
  }
}