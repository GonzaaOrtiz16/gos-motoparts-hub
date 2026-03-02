export interface Product {
  id: string;
  name: string;
  price: number;
  image_urls: string[];
  description?: string;
  category?: string;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
