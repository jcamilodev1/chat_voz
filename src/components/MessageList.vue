<template>
  <div class="h-full flex flex-col">
    <!-- Lista de mensajes -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <!-- Mensaje de bienvenida -->
      <div v-if="messages.length === 0" class="text-center py-8">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <img src="@/assets/icons/microphone.svg" alt="Micrófono" class="w-6 h-6 text-blue-600" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">¡Bienvenido a ChatVoz!</h3>
        <p class="text-gray-500">Envía tu primer mensaje de voz para comenzar la conversación</p>
      </div>

      <!-- Mensajes -->
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="{
          'justify-end': message.isOwn,
          'justify-start': !message.isOwn
        }"
      >
        <VoiceMessage 
          :message="message"
          :is-own="message.isOwn"
          class="max-w-xs sm:max-w-sm"
        />
      </div>
    </div>

    <!-- Indicador de scroll -->
    <div 
      v-if="showScrollIndicator"
      class="absolute bottom-20 right-4 z-10"
    >
      <button
        @click="() => scrollToBottom()"
        class="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Ir al final"
      >
        <img src="@/assets/icons/arrow-down.svg" alt="Ir al final" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import type { VoiceMessage as VoiceMessageType } from '@/types'
import VoiceMessage from './VoiceMessage.vue'

// Props
interface Props {
  messages: VoiceMessageType[]
}

const props = defineProps<Props>()

// Referencias
const messagesContainer = ref<HTMLElement | null>(null)
const showScrollIndicator = ref(false)
const isUserScrolling = ref(false)
const scrollTimeout = ref<number | null>(null)

// Métodos
const scrollToBottom = (smooth = true) => {
  if (!messagesContainer.value) return
  
  const container = messagesContainer.value
  const scrollOptions: ScrollToOptions = {
    top: container.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  }
  
  container.scrollTo(scrollOptions)
}

const checkScrollPosition = () => {
  if (!messagesContainer.value) return
  
  const container = messagesContainer.value
  const { scrollTop, scrollHeight, clientHeight } = container
  const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
  
  showScrollIndicator.value = !isNearBottom && props.messages.length > 0
}

const handleScroll = () => {
  isUserScrolling.value = true
  
  // Limpiar timeout anterior
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
  
  // Marcar que el usuario dejó de hacer scroll después de 150ms
  scrollTimeout.value = window.setTimeout(() => {
    isUserScrolling.value = false
  }, 150)
  
  checkScrollPosition()
}

// Watchers
watch(
  () => props.messages.length,
  async () => {
    // Esperar a que el DOM se actualice
    await nextTick()
    
    // Solo hacer scroll automático si el usuario no está scrolleando
    if (!isUserScrolling.value) {
      scrollToBottom()
    }
    
    // Actualizar indicador de scroll
    checkScrollPosition()
  }
)

// Lifecycle
onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll)
    
    // Scroll inicial
    nextTick(() => {
      scrollToBottom(false)
    })
  }
})

onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
  }
  
  if (scrollTimeout.value) {
    clearTimeout(scrollTimeout.value)
  }
})
</script>

<style scoped>
/* Personalizar scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>