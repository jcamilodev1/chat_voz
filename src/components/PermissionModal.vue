<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <!-- Header -->
        <div class="text-center mb-6">
          <!-- Microphone icon -->
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="@/assets/icons/microphone.svg" alt="Micrófono" class="w-8 h-8 text-blue-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Permisos de Micrófono</h3>
          <p class="text-gray-600">ChatVoz necesita acceso a tu micrófono para grabar mensajes de voz</p>
        </div>
        
        <!-- Content -->
        <div class="space-y-4 mb-6">
          <div class="bg-blue-50 rounded-lg p-4">
            <h4 class="font-medium text-blue-900 mb-2">¿Por qué necesitamos este permiso?</h4>
            <ul class="text-sm text-blue-800 space-y-1">
              <li>• Grabar mensajes de voz de hasta 30 segundos</li>
              <li>• Detectar niveles de audio para evitar mensajes vacíos</li>
              <li>• Proporcionar retroalimentación visual durante la grabación</li>
            </ul>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">Tu privacidad está protegida</h4>
            <ul class="text-sm text-gray-700 space-y-1">
              <li>• Los mensajes solo se almacenan localmente</li>
              <li>• No se envían datos a servidores externos</li>
              <li>• Puedes revocar el permiso en cualquier momento</li>
            </ul>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex space-x-3">
          <button
            @click="$emit('close')"
            class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="$emit('retry')"
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Permitir Acceso
          </button>
        </div>
        
        <!-- Help text -->
        <div class="mt-4 text-center">
          <p class="text-xs text-gray-500">
            Si el navegador no muestra la solicitud de permisos, verifica la configuración de tu navegador
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Emits
defineEmits<{
  close: []
  retry: []
}>()
</script>