export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_urls: string[]; 
  category: string;
  brand?: string;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
