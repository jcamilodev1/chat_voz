<template>
  <header class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
    <!-- Información del usuario -->
    <div class="flex items-center space-x-3">
      <!-- Avatar -->
      <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <span class="text-white font-medium text-sm">
          {{ avatarText }}
        </span>
      </div>
      
      <!-- Nickname y estado -->
      <div>
        <h1 class="font-semibold text-gray-900">{{ nickname }}</h1>
        <div class="flex items-center space-x-2">
          <!-- Indicador de conexión -->
          <div class="flex items-center space-x-1">
            <div 
              class="w-2 h-2 rounded-full"
              :class="{
                'bg-green-500': isConnected,
                'bg-red-500': !isConnected
              }"
            ></div>
            <span class="text-xs text-gray-500">
              {{ connectionStatus }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles -->
    <div class="flex items-center space-x-2">
      <!-- Settings button -->
        <button class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <img src="@/assets/icons/settings.svg" alt="Configuración" class="w-5 h-5" />
        </button>
        
        <!-- Logout button -->
        <button 
          @click="handleLogout" 
          class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <img src="@/assets/icons/logout.svg" alt="Cerrar sesión" class="w-5 h-5" />
        </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  nickname: string
  isConnected: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  logout: []
}>()

// Computed
const avatarText = computed(() => {
  return props.nickname.slice(0, 2).toUpperCase()
})

const connectionStatus = computed(() => {
  return props.isConnected ? 'Conectado' : 'Desconectado'
})

// Métodos
const handleLogout = () => {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    emit('logout')
  }
}
</script>