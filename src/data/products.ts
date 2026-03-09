export interface Product {
  id: string;
  name: string;
  title?: string;
  slug?: string;
  price: number;
  original_price?: number;
  images?: string[];
  image_urls?: string[];
  category?: string;
  brand?: string;
  free_shipping?: boolean;
  description?: string;
  stock?: number;
  is_on_sale?: boolean;
  created_at?: string;
  sizes?: string[];
}

export const categories = [
  { id: "Frenos", name: "Frenos" },
  { id: "Motor", name: "Motor" },
  { id: "Transmisión", name: "Transmisión" },
  { id: "Estética", name: "Estética" },
  { id: "Escapes", name: "Escapes" },
];

export const brands = ["Honda", "Yamaha", "Bajaj", "Kawasaki", "KTM", "Suzuki"];

export const products: Product[] = [];
