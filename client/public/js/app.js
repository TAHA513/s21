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
    settingsElement.innerHTML = `<pre>${JSON.stringify(settings, null, 2)}</pre>`;
  } catch (error) {
    const settingsElement = document.getElementById('settings');
    settingsElement.innerHTML = `<div class="text-red-500">حدث خطأ: ${error.message}</div>`;
  }
}

// Load settings when the page loads
document.addEventListener('DOMContentLoaded', getStoreSettings);
