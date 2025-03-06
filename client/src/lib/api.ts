import type { StoreSettings, SocialMediaAccount } from "@/types";

// Fetch store settings from the API
export async function getStoreSettings(): Promise<StoreSettings> {
  const response = await fetch('/api/store-settings');
  if (!response.ok) {
    throw new Error('Failed to fetch store settings');
  }
  return response.json();
}

// Fetch social media accounts from the API
export async function getSocialAccounts(): Promise<SocialMediaAccount[]> {
  const response = await fetch('/api/social-accounts');
  if (!response.ok) {
    throw new Error('Failed to fetch social accounts');
  }
  return response.json();
}

// Add a new social media account
export async function addSocialAccount(account: { 
  platform: string;
  username: string;
  password: string;
}): Promise<SocialMediaAccount> {
  const response = await fetch('/api/social-accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(account),
  });
  if (!response.ok) {
    throw new Error('Failed to add social account');
  }
  return response.json();
}

// Update store settings
export async function setStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const response = await fetch('/api/store-settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error('Failed to update store settings');
  }
  return response.json();
}
