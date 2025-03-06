export interface StoreSettings {
  id?: number;
  storeName?: string;
  storeLogo?: string;
  defaultCurrency?: string;
  usdToIqdRate?: number;
  theme?: {
    primary: string;
    variant: 'professional' | 'tint' | 'vibrant';
    appearance: 'light' | 'dark' | 'system';
    radius: number;
  };
}

export interface SocialMediaAccount {
  id: number;
  platform: 'facebook' | 'instagram' | 'snapchat';
  username: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface DatabaseConnection {
  id: number;
  name: string;
  type: string;
  host?: string;
  port?: number;
  database?: string;
  isActive: boolean;
  createdAt: string;
}
