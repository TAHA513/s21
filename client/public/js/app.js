// Fetch store settings from the API
async function getStoreSettings() {
  try {
    const response = await fetch('/api/store-settings');
    if (!response.ok) {
      throw new Error('فشل في جلب إعدادات المتجر');
    }
    const settings = await response.json();

    // Display settings in the DOM
    const settingsElement = document.getElementById('settings');
    if (Object.keys(settings).length === 0) {
      settingsElement.innerHTML = `<div class="text-gray-500">لا توجد إعدادات متوفرة حالياً</div>`;
    } else {
      settingsElement.innerHTML = `<pre dir="ltr">${JSON.stringify(settings, null, 2)}</pre>`;
    }
  } catch (error) {
    console.error('Error fetching store settings:', error);
    const settingsElement = document.getElementById('settings');
    settingsElement.innerHTML = `<div class="text-red-500">حدث خطأ: ${error.message}</div>`;
  }
}

// Load settings when the page loads
document.addEventListener('DOMContentLoaded', getStoreSettings);