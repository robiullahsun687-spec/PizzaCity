export interface MenuItem {
  _id: string; // Will support both MongoDB string and fake IDs
  name: string;
  category: string; // 'pizza' | 'sides' | 'drinks' | 'dessert'
  price: number;
  description: string;
  image: string;
  available: boolean;
  discountPrice?: number;
  discountPercentage?: number;
  featured?: boolean;
}

export interface PromoCode {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
}

export interface CartEntry {
  item: MenuItem;
  quantity: number;
  size: "Small" | "Medium" | "Large";
  unitPrice: number; // dynamically optimized unit price across size & bulk count
}

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  customer: Customer;
  outlet: string; // 'Nizwa' | 'Samail' | 'Sur' | 'Quriyat' | 'Fanja'
  status: 'pending' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  total: number;
  timestamp: string;
}

export interface Branch {
  _id?: string;
  id?: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  map?: string;
  geo?: string;
  hours?: string;
  delivery?: boolean;
  isActive?: boolean;
  image?: string;
}

export const OUTLETS = {
  Nizwa: { phone: '96928714', name: 'Nizwa', location: 'Nizwa, Oman', coords: 'Nizwa' },
  Samail: { phone: '96928716', name: 'Samail', location: 'Samail, Oman', coords: 'Samail' },
  Sur: { phone: '96928717', name: 'Sur', location: 'Sur, Oman', coords: 'Sur' },
  Quriyat: { phone: '96928719', name: 'Quriyat', location: 'Quriyat, Oman', coords: 'Quriyat' },
  Fanja: { phone: '96749772', name: 'Fanja', location: 'Fanja, Oman', coords: 'Fanja' },
} as const;

export type OutletName = keyof typeof OUTLETS;

export interface HeroBanner {
  _id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  stylePattern?: "attached" | "classic" | "modern" | "fullImage";
  type?: "hero" | "offer" | "all";
}

