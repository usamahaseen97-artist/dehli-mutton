export interface Product {
  id: string;
  name: string;
  nameUr: string;
  description: string;
  descriptionUr: string;
  price: number;
  unit: string;
  unitUr: string;
  category: string;
  image: string;
  tag?: string;
  tagUr?: string;
  wholesaleOnly?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameUr: string;
  icon: string;
  image: string;
}

export interface Deal {
  id: string;
  title: string;
  titleUr: string;
  description: string;
  descriptionUr: string;
  image: string;
  discount?: string;
  discountUr?: string;
}

export interface AppConfig {
  businessName: string;
  businessNameUr: string;
  tagline: string;
  taglineUr: string;
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  addressUr: string;
  minOrderMutton: number;
  currency: string;
  bankName: string;
  accountNumber: string;
  accountTitle: string;
  botInstruction?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}
