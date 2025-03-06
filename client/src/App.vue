<template>
  <div class="min-h-screen bg-background">
    <nav class="border-b">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="text-xl font-bold">نظام إدارة الأعمال</div>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-4">لوحة التحكم</h1>
      <p class="text-gray-600 mb-8">مرحباً بك في نظام إدارة الأعمال</p>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div v-if="isLoading" class="text-center py-4">
          جاري التحميل...
        </div>
        <div v-else-if="error" class="text-red-500 text-center py-4">
          {{ error }}
        </div>
        <template v-else>
          <h2 class="text-xl font-bold mb-4">إعدادات المتجر</h2>
          <pre class="bg-gray-50 p-4 rounded-md overflow-auto">
            {{ settings }}
          </pre>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const settings = ref(null)
const isLoading = ref(true)
const error = ref(null)

async function fetchSettings() {
  try {
    const response = await fetch('/api/store-settings')
    if (!response.ok) {
      throw new Error('فشل في جلب إعدادات المتجر')
    }
    settings.value = await response.json()
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>
