<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      @click="$emit('close')"
    ></div>
    
    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <!-- Error icon -->
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <img src="@/assets/icons/error.svg" alt="Error" class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900">Error</h3>
          </div>
          
          <!-- Close button -->
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <img src="@/assets/icons/cancel.svg" alt="Cerrar" class="w-6 h-6" />
          </button>
        </div>
        
        <!-- Content -->
        <div class="mb-6">
          <p class="text-gray-700">{{ message }}</p>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end">
          <button
            @click="$emit('close')"
            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  message: string
}

defineProps<Props>()

// Emits
defineEmits<{
  close: []
}>()
</script>