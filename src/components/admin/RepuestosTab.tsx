import React, { useState, useRef, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Upload, Copy, Loader2, Search, Tag, Truck, Check } from "lucide-react";
import { useCategorias } from './useCategorias';

const RepuestosTab = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', price: '', category: '', description: '', brand: '', stock: '10',
    original_price: '', free_shipping: false, is_on_sale: false, sizes: '', barcode: '',
    cc: '', moto_fit: ''
  });
  const [tempImages, setTempImages] = useState<string[]>([]);

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: categorias = [] } = useCategorias('repuestos');

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p =>
      (p.title || p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      title: product.title || product.name, price: product.price.toString(), category: product.category || '',
      description: product.description || '', brand: product.brand || '', stock: product.stock?.toString() || '10',
      original_price: product.original_price?.toString() || '', free_shipping: product.free_shipping || false,
      is_on_sale: !!product.is_on_sale, sizes: (product.sizes || []).join(', '), barcode: product.barcode || '',
      cc: (product.cc || []).join(', '), moto_fit: (product.moto_fit || []).join(', ')
    });
    setTempImages(product.images || product.image_urls || []);
    setIsAdding(true);
  };

  const handleDuplicate = (product: any) => {
    setEditingId(null);
    setFormData({
      title: `${product.title || product.name} (Copia)`, price: product.price.toString(), category: product.category || '',
      description: product.description || '', brand: product.brand || '', stock: product.stock?.toString() || '10',
      original_price: product.original_price?.toString() || '', free_shipping: product.free_shipping || false,
      is_on_sale: !!product.is_on_sale, sizes: (product.sizes || []).join(', '), barcode: '',
      cc: (product.cc || []).join(', '), moto_fit: (product.moto_fit || []).join(', ')
    });
    setTempImages(product.images || product.image_urls || []);
    setIsAdding(true);
    toast.info("Copiado. Editá lo que necesites.");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar definitivamente?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) { toast.success("Eliminado"); queryClient.invalidateQueries({ queryKey: ['admin-products'] }); }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('repuestos').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('repuestos').getPublicUrl(fileName);
        if (data?.publicUrl) newUrls.push(data.publicUrl);
      } catch { toast.error("Error al subir"); }
    }
    setTempImages(prev => [...prev, ...newUrls]);
    setUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempImages.length === 0) return toast.error("Subí al menos una foto");
    setLoading(true);
    const slug = formData.title.toLowerCase().trim().replace(/[\s_-]+/g, '-').replace(/[^\w-]/g, '');
    const productData: any = {
      title: formData.title, name: formData.title, price: parseFloat(formData.price),
      original_price: formData.is_on_sale && formData.original_price ? parseFloat(formData.original_price) : null,
      category: formData.category, brand: formData.brand, description: formData.description,
      stock: parseInt(formData.stock), free_shipping: formData.free_shipping,
      is_on_sale: formData.is_on_sale, slug, images: tempImages, image_urls: tempImages,
      sizes: formData.sizes.trim() ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      barcode: formData.barcode.trim() || null,
      cc: formData.cc.trim() ? formData.cc.split(',').map(s => s.trim()).filter(Boolean) : [],
      moto_fit: formData.moto_fit.trim() ? formData.moto_fit.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    let error;
    if (editingId) {
      const { error: e } = await supabase.from('products').update(productData).eq('id', editingId);
      error = e;
    } else {
      const { error: e } = await supabase.from('products').insert([productData]);
      error = e;
    }
    setLoading(false);
    if (!error) {
      toast.success(editingId ? "¡Actualizado!" : "¡Publicado!");
      setIsAdding(false); setEditingId(null); resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } else { toast.error("Error: " + error.message); }
  };

  const resetForm = () => {
    setEditingId(null); setTempImages([]);
    setFormData({ title: '', price: '', category: '', description: '', brand: '', stock: '10', original_price: '', free_shipping: false, is_on_sale: false, sizes: '', barcode: '', cc: '', moto_fit: '' });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">Repuestos</h1>
          <div className="mt-4 relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, marca o código..."
              className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <button onClick={() => { resetForm(); setIsAdding(true); }} className="w-full md:w-auto bg-primary text-primary-foreground p-4 md:px-8 md:py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all font-black uppercase shadow-lg shadow-primary/20">
          <Plus size={20} /> Nuevo Repuesto
        </button>
      </div>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredProducts?.map((p) => (
          <div key={p.id} className="bg-card rounded-3xl border border-border shadow-sm p-4 flex gap-4 relative overflow-hidden">
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {p.is_on_sale && <div className="bg-primary text-primary-foreground p-1 rounded-lg shadow-lg"><Tag size={12} fill="currentColor" /></div>}
              {p.free_shipping && <div className="bg-success text-success-foreground p-1 rounded-lg shadow-lg"><Truck size={12} fill="currentColor" /></div>}
            </div>
            <img src={(p.images as string[])?.[0] || (p.image_urls as string[])?.[0] || '/placeholder.svg'} className="w-24 h-24 rounded-2xl object-cover shrink-0 bg-muted" />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">{p.brand || 'Genérico'}</p>
                <h3 className="font-black uppercase text-[11px] leading-tight truncate">{p.title || p.name}</h3>
                <p className="text-[10px] text-muted-foreground font-bold">Stock: {p.stock ?? 0}</p>
                <p className="font-black text-sm text-foreground mt-1">${p.price.toLocaleString('es-AR')}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(p)} className="flex-1 bg-foreground text-background py-2 rounded-xl text-[9px] font-black uppercase">Editar</button>
                <button onClick={() => handleDuplicate(p)} className="p-2 bg-muted rounded-xl text-muted-foreground"><Copy size={14}/></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 bg-destructive/10 rounded-xl text-destructive"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-muted text-[10px] uppercase tracking-widest text-muted-foreground font-black">
            <tr>
              <th className="px-8 py-6">Producto</th>
              <th className="px-8 py-6">Estado</th>
              <th className="px-8 py-6">Stock</th>
              <th className="px-8 py-6 text-right">Precio</th>
              <th className="px-8 py-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {filteredProducts?.map((p) => (
              <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-8 py-4 flex items-center gap-4">
                  <img src={(p.images as string[])?.[0] || (p.image_urls as string[])?.[0] || '/placeholder.svg'} className="w-12 h-12 rounded-xl object-cover bg-muted" />
                  <div>
                    <div className="font-black text-sm uppercase">{p.title || p.name}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">{p.brand} · {p.category}</div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className="flex gap-2">
                    {p.is_on_sale && <span className="flex items-center gap-1 bg-primary/10 text-primary text-[8px] px-2 py-1 rounded-full font-black uppercase"><Tag size={10} fill="currentColor" /> Oferta</span>}
                    {p.free_shipping && <span className="flex items-center gap-1 bg-success/10 text-success text-[8px] px-2 py-1 rounded-full font-black uppercase"><Truck size={10} fill="currentColor" /> Envío</span>}
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className={`font-black text-sm ${(p.stock ?? 0) <= 0 ? 'text-destructive' : (p.stock ?? 0) <= 5 ? 'text-warning' : 'text-success'}`}>
                    {p.stock ?? 0}
                  </span>
                </td>
                <td className="px-8 py-4 text-right font-black text-lg text-primary">${p.price.toLocaleString('es-AR')}</td>
                <td className="px-8 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleEdit(p)} className="p-2 text-muted-foreground hover:text-primary"><Pencil size={18}/></button>
                    <button onClick={() => handleDuplicate(p)} className="p-2 text-muted-foreground hover:text-foreground"><Copy size={18}/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-foreground/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 md:px-10 md:py-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-black uppercase italic">{editingId ? 'Editar Repuesto' : 'Nuevo Repuesto'}</h2>
              <button onClick={() => setIsAdding(false)} className="bg-muted p-2 rounded-full"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 overflow-y-auto">
              <input className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Nombre del producto" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Marca" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                <select className="bg-muted rounded-2xl px-6 py-4 outline-none font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                  <option value="">Categoría...</option>
                  {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                </select>
              </div>
              <input className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Código de barras / QR (opcional)" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
              <textarea className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold min-h-[80px]" placeholder="Descripción" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

              {/* Compatibility fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-muted-foreground font-black uppercase ml-2 block mb-1">Cilindrada (cc)</label>
                  <input className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Ej: 110, 150, 250" value={formData.cc} onChange={e => setFormData({...formData, cc: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground font-black uppercase ml-2 block mb-1">Compatibilidad (motos)</label>
                  <input className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Ej: Honda Wave, Yamaha YBR" value={formData.moto_fit} onChange={e => setFormData({...formData, moto_fit: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground font-black uppercase ml-2 block mb-1">Talles (separados por coma)</label>
                <input className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Ej: S, M, L, XL" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
              </div>

              {/* Pricing section */}
              <div className="bg-foreground rounded-[32px] p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-black uppercase ml-2 block mb-1">Precio Actual</label>
                    <input className="w-full bg-background/10 rounded-xl px-5 py-3 text-primary font-black text-xl outline-none" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-black uppercase ml-2 block mb-1">Stock</label>
                    <input className="w-full bg-background/10 rounded-xl px-5 py-3 text-background font-black text-xl outline-none" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                  </div>
                </div>
                <div className="pt-4 border-t border-background/10 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setFormData({...formData, is_on_sale: !formData.is_on_sale})}
                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_on_sale ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-background rounded-full transition-all ${formData.is_on_sale ? 'left-7' : 'left-1'}`} />
                      </button>
                      <span className="text-background text-[10px] font-black uppercase">Activar Oferta</span>
                    </div>
                    {formData.is_on_sale && (
                      <input className="w-full md:w-auto bg-background/5 border border-background/10 rounded-xl px-4 py-2 text-muted-foreground font-bold text-sm outline-none focus:border-primary/50" placeholder="Precio anterior" type="number" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setFormData({...formData, free_shipping: !formData.free_shipping})}
                      className={`w-12 h-6 rounded-full relative transition-colors ${formData.free_shipping ? 'bg-success' : 'bg-muted-foreground/30'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-background rounded-full transition-all ${formData.free_shipping ? 'left-7' : 'left-1'}`} />
                    </button>
                    <span className="text-background text-[10px] font-black uppercase">Envío Gratis</span>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {tempImages.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setTempImages(prev => prev.filter(u => u !== url))} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"><X size={10}/></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                  {uploadingImages ? <Loader2 className="animate-spin"/> : <Upload/>}
                </button>
              </div>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 sticky bottom-0 transition-all">
                {loading ? "Guardando..." : editingId ? "Guardar Cambios" : "Publicar Ahora"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RepuestosTab;
