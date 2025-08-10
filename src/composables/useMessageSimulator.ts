import { ref, onMounted, onUnmounted } from 'vue'
import { toast } from 'sonner'
import type { BroadcastMessage, BroadcastVoiceMessageData } from '@/types'

// Lista de usuarios simulados
const MOCK_USERS = [
  'Ana García',
  'Carlos López',
  'María Rodríguez',
  'Juan Pérez',
  'Laura Martín'
]

// Mensajes de texto para convertir a audio (simulado)
const MOCK_MESSAGES = [
  'Hola, ¿cómo están todos?',
  '¡Qué tal el día de hoy!',
  'Espero que estén bien',
  'Nos vemos pronto',
  '¡Excelente trabajo en equipo!',
  'Gracias por la información',
  '¿Alguien puede ayudarme?',
  'Perfecto, entendido',
  'Me parece una buena idea',
  'Hablamos después'
]

export function useMessageSimulator() {
  const isSimulating = ref(false)
  const simulationInterval = ref<number | null>(null)
  const broadcastChannel = ref<BroadcastChannel | null>(null)

  // Generar audio sintético usando Web Audio API
  const generateMockAudio = async (text: string, duration: number): Promise<ArrayBuffer> => {
    try {
      // Crear AudioContext
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const sampleRate = audioContext.sampleRate
      const channels = 1
      const samples = Math.floor(sampleRate * duration)
      
      // Crear AudioBuffer
      const audioBuffer = audioContext.createBuffer(channels, samples, sampleRate)
      const channelData = audioBuffer.getChannelData(0)
      
      // Generar audio sintético que simula voz
      for (let i = 0; i < samples; i++) {
        const time = i / sampleRate
        const frequency = 200 + Math.sin(time * 2) * 100 // Frecuencia variable
        const amplitude = 0.1 * Math.sin(time * 10) // Amplitud modulada
        
        // Combinar ondas para simular voz
        const wave1 = Math.sin(2 * Math.PI * frequency * time)
        const wave2 = Math.sin(2 * Math.PI * (frequency * 1.5) * time) * 0.3
        const envelope = Math.exp(-time * 0.5) // Envolvente de decaimiento
        
        channelData[i] = (wave1 + wave2) * amplitude * envelope
      }
      
      // Convertir a WAV usando una función helper
      const wavArrayBuffer = audioBufferToWav(audioBuffer)
      audioContext.close()
      
      return wavArrayBuffer
    } catch (error) {
      console.error('Error generating mock audio:', error)
      // Fallback: crear un audio silencioso válido
      return createSilentAudio(duration)
    }
  }
  
  // Función helper para convertir AudioBuffer a WAV
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length
    const sampleRate = buffer.sampleRate
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)
    const channelData = buffer.getChannelData(0)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * 2, true)
    
    // Audio data
    let offset = 44
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample * 0x7FFF, true)
      offset += 2
    }
    
    return arrayBuffer
  }
  
  // Crear audio silencioso como fallback
  const createSilentAudio = (duration: number): ArrayBuffer => {
    const sampleRate = 44100
    const samples = Math.floor(sampleRate * duration)
    const arrayBuffer = new ArrayBuffer(44 + samples * 2)
    const view = new DataView(arrayBuffer)
    
    // WAV header para audio silencioso
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + samples * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, samples * 2, true)
    
    // Datos de audio silencioso (todos ceros)
    // No necesitamos escribir nada más ya que ArrayBuffer se inicializa con ceros
    
    return arrayBuffer
  }

  // Generar un mensaje simulado
  const generateMockMessage = async (): Promise<BroadcastVoiceMessageData> => {
    const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)]
    const randomText = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)]
    const duration = 2 + Math.random() * 8 // Entre 2 y 10 segundos
    
    const audioArrayBuffer = await generateMockAudio(randomText, duration)
    
    return {
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nickname: randomUser,
      audioArrayBuffer,
      duration,
      timestamp: new Date(),
      isOwn: false
    }
  }

  // Enviar mensaje simulado
  const sendMockMessage = async () => {
    if (!broadcastChannel.value) return
    
    try {
      const mockMessage = await generateMockMessage()
      
      const broadcastMessage: BroadcastMessage = {
        type: 'voice_message',
        data: mockMessage,
        timestamp: new Date()
      }
      
      broadcastChannel.value.postMessage(broadcastMessage)
      
      // Mostrar notificación
      toast.success(`💬 Nuevo mensaje de ${mockMessage.nickname}`, {
        description: `Duración: ${Math.round(mockMessage.duration)}s`,
        duration: 3000
      })
      
      console.log('📨 Mensaje simulado enviado:', mockMessage.nickname)
    } catch (error) {
      console.error('Error enviando mensaje simulado:', error)
      toast.error('Error al simular mensaje')
    }
  }

  // Iniciar simulación
  const startSimulation = () => {
    if (isSimulating.value) return
    
    isSimulating.value = true
    
    // Enviar mensajes en intervalos aleatorios (entre 5 y 15 segundos)
    const scheduleNextMessage = () => {
      if (!isSimulating.value) return
      
      const delay = 5000 + Math.random() * 10000 // 5-15 segundos
      
      simulationInterval.value = window.setTimeout(() => {
        sendMockMessage()
        scheduleNextMessage()
      }, delay)
    }
    
    // Enviar primer mensaje después de 3 segundos
    simulationInterval.value = window.setTimeout(() => {
      sendMockMessage()
      scheduleNextMessage()
    }, 3000)
    
    console.log('🎭 Simulación de mensajes iniciada')
    toast.info('🎭 Simulación de mensajes activada', {
      description: 'Recibirás mensajes simulados cada 5-15 segundos'
    })
  }

  // Detener simulación
  const stopSimulation = () => {
    isSimulating.value = false
    
    if (simulationInterval.value) {
      clearTimeout(simulationInterval.value)
      simulationInterval.value = null
    }
    
    console.log('🛑 Simulación de mensajes detenida')
    toast.info('🛑 Simulación de mensajes desactivada')
  }

  // Alternar simulación
  const toggleSimulation = () => {
    if (isSimulating.value) {
      stopSimulation()
    } else {
      startSimulation()
    }
  }

  // Inicializar BroadcastChannel
  const initializeBroadcastChannel = () => {
    try {
      broadcastChannel.value = new BroadcastChannel('chatvoz-chat')
      console.log('📡 BroadcastChannel inicializado para simulación')
    } catch (error) {
      console.error('Error inicializando BroadcastChannel:', error)
    }
  }

  // Cleanup
  const cleanup = () => {
    stopSimulation()
    if (broadcastChannel.value) {
      broadcastChannel.value.close()
      broadcastChannel.value = null
    }
  }

  // Lifecycle
  onMounted(() => {
    initializeBroadcastChannel()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    isSimulating,
    startSimulation,
    stopSimulation,
    toggleSimulation,
    sendMockMessage,
    cleanup
  }
}