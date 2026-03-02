export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_urls: string[]; // Usamos array para el carrusel
  category: string;
  brand?: string;
  created_at?: string;
}

// ESTA INTERFAZ ES OBLIGATORIA PARA EL CARRITO
export interface CartItem extends Product {
  quantity: number;
}
