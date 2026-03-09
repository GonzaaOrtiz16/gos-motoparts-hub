import React, { useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut, X, Upload, Copy, Loader2, Check, Settings, Package, LayoutGrid, Image } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// ===================== ADMIN PRINCIPAL =====================
const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'repuestos' | 'categorias' | 'ajustes'>('repuestos');
  const navigate = useNavigate();

  const tabs = [
    { id: 'repuestos' as const, label: 'Repuestos', icon: Package },
    { id: 'categorias' as const, label: 'Categorías', icon: LayoutGrid },
    { id: 'ajustes' as const, label: 'Ajustes', icon: Settings },
  ];

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-muted/50 font-sans text-foreground">
      <header className="border-b px-4 md:px-8 py-4 flex justify-between items-center bg-card sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 md:gap-6 overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-black uppercase text-primary italic">GOS</span>
            <span className="text-xl font-black uppercase text-foreground italic">Admin</span>
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-2xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-bold transition-all flex-shrink-0">
          <LogOut size={16} /> Salir
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {activeTab === 'repuestos' && <RepuestosTab />}
        {activeTab === 'categorias' && <CategoriasTab />}
        {activeTab === 'ajustes' && <AjustesTab />}
      </main>
    </div>
  );
};

// ===================== LOGIN FORM =====================
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-card p-8 rounded-3xl shadow-xl border border-border">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-black text-foreground"><span className="text-primary">GOS</span> Admin</h1>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-muted text-foreground font-bold text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground" />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-muted text-foreground font-bold text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground" />
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black uppercase text-lg hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

// ===================== HOOK: Categorías dinámicas =====================
const useCategorias = (tipo?: string) => {
  return useQuery({
    queryKey: ['categorias', tipo],
    queryFn: async () => {
      let query = supabase.from('categorias').select('*').order('nombre');
      if (tipo) query = query.eq('tipo', tipo);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
};

// ===================== CATEGORÍAS TAB =====================
const CategoriasTab = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', tipo: 'repuestos', image: '' });

  const { data: categorias } = useCategorias();

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({ nombre: cat.nombre, tipo: cat.tipo || 'repuestos', image: cat.image || '' });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar esta categoría?")) {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (!error) { toast.success("Categoría eliminada"); queryClient.invalidateQueries({ queryKey: ['categorias'] }); }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `categorias/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('repuestos').upload(fileName, file);
    if (error) { toast.error("Error al subir"); setUploading(false); return; }
    const { data } = supabase.storage.from('repuestos').getPublicUrl(fileName);
    if (data?.publicUrl) setFormData(prev => ({ ...prev, image: data.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return toast.error("Ingresá un nombre");
    setLoading(true);
    const slug = formData.nombre.toLowerCase().trim().replace(/[\s_-]+/g, '-').replace(/[^\w-]/g, '');
    const catData = { nombre: formData.nombre, slug, tipo: formData.tipo, image: formData.image };

    let error;
    if (editingId) {
      const { error: e } = await supabase.from('categorias').update(catData).eq('id', editingId);
      error = e;
    } else {
      const { error: e } = await supabase.from('categorias').insert([catData]);
      error = e;
    }
    setLoading(false);
    if (!error) {
      toast.success(editingId ? "¡Categoría actualizada!" : "¡Categoría creada!");
      setIsAdding(false); setEditingId(null);
      setFormData({ nombre: '', tipo: 'repuestos', image: '' });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    } else { toast.error("Error: " + error.message); }
  };

  const repuestosCats = categorias?.filter(c => c.tipo === 'repuestos') || [];

  return (
    <>
      <div className="flex justify-between items-end mb-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Categorías</h1>
        <button onClick={() => { setEditingId(null); setFormData({ nombre: '', tipo: 'repuestos', image: '' }); setIsAdding(true); }} className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-primary/90 transition-all font-black uppercase shadow-lg shadow-primary/20">
          <Plus size={20} /> Nueva
        </button>
      </div>

      <div className="mb-10">
        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">Repuestos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {repuestosCats.map(cat => (
            <div key={cat.id} className="bg-card rounded-3xl border overflow-hidden shadow-sm group relative">
              <div className="aspect-[3/2] bg-muted overflow-hidden">
                {cat.image && cat.image.length > 0 ? (
                  <img src={cat.image} className="w-full h-full object-cover" alt={cat.nombre} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Image size={40} /></div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <span className="font-black uppercase text-sm tracking-tight">{cat.nombre}</span>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(cat)} className="p-1.5 text-muted-foreground hover:text-primary"><Pencil size={14}/></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          ))}
          {repuestosCats.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed rounded-3xl text-muted-foreground font-bold text-sm uppercase">Sin categorías</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-foreground/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-10 py-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic">{editingId ? 'Editar' : 'Nueva'} Categoría</h2>
              <button onClick={() => setIsAdding(false)} className="bg-muted p-2 rounded-full"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <input className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Nombre de la categoría" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />

              {/* Image */}
              <div>
                <label className="text-[10px] text-muted-foreground font-black uppercase ml-2 mb-2 block">Imagen de categoría</label>
                {formData.image && formData.image.length > 0 ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border">
                    <img src={formData.image} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5"><X size={12}/></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                    {uploading ? <Loader2 className="animate-spin" size={24} /> : <><Upload size={24} /><span className="text-[10px] font-black uppercase mt-2">Subir foto</span></>}
                  </button>
                )}
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                {loading ? "Guardando..." : editingId ? "Guardar Cambios" : "Crear Categoría"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ===================== REPUESTOS TAB =====================
const RepuestosTab = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '', price: '', category: '', description: '', brand: '', stock: '10',
    original_price: '', free_shipping: false, is_on_sale: false, sizes: ''
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

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      title: product.title || product.name, price: product.price.toString(), category: product.category || '',
      description: product.description || '', brand: product.brand || '', stock: product.stock?.toString() || '10',
      original_price: product.original_price?.toString() || '', free_shipping: product.free_shipping || false,
      is_on_sale: !!product.is_on_sale, sizes: (product.sizes || []).join(', ')
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
      is_on_sale: !!product.is_on_sale, sizes: (product.sizes || []).join(', ')
    });
    setTempImages(product.images || product.image_urls || []);
    setIsAdding(true);
    toast.info("Copiado. Editá lo que necesites.");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Eliminar este repuesto definitivamente?")) {
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
      } catch { toast.error("Error al subir imagen"); }
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
    const productData = {
      title: formData.title, name: formData.title, price: parseFloat(formData.price),
      original_price: formData.is_on_sale && formData.original_price ? parseFloat(formData.original_price) : null,
      category: formData.category, brand: formData.brand, description: formData.description,
      stock: parseInt(formData.stock), free_shipping: formData.free_shipping,
      is_on_sale: formData.is_on_sale, slug, images: tempImages, image_urls: tempImages,
      sizes: formData.sizes.trim() ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
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
    setFormData({ title: '', price: '', category: '', description: '', brand: '', stock: '10', original_price: '', free_shipping: false, is_on_sale: false, sizes: '' });
  };

  return (
    <>
      <div className="flex justify-between items-end mb-10">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Repuestos</h1>
        <button onClick={() => { resetForm(); setIsAdding(true); }} className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-primary/90 transition-all font-black uppercase shadow-lg shadow-primary/20">
          <Plus size={20} /> Nuevo
        </button>
      </div>

      <div className="bg-card border rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-muted text-[10px] uppercase tracking-widest text-muted-foreground font-black">
            <tr><th className="px-8 py-6">Producto</th><th className="px-8 py-6">Estado</th><th className="px-8 py-6 text-right">Precio</th><th className="px-8 py-6 text-center">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {products?.map((p) => (
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
                    {p.is_on_sale && <span className="bg-primary/10 text-primary text-[9px] px-2 py-1 rounded-md font-black italic uppercase">Oferta</span>}
                    {p.free_shipping && <span className="bg-success/10 text-success text-[9px] px-2 py-1 rounded-md font-black uppercase">Envío Gratis</span>}
                  </div>
                </td>
                <td className="px-8 py-4 text-right font-black text-lg">${p.price.toLocaleString('es-AR')}</td>
                <td className="px-8 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => handleEdit(p)} className="p-2 text-muted-foreground hover:text-primary"><Pencil size={18}/></button>
                    <button onClick={() => handleDuplicate(p)} className="p-2 text-muted-foreground hover:text-primary"><Copy size={18}/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-foreground/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-10 py-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase italic">{editingId ? 'Editar Repuesto' : 'Nuevo Repuesto'}</h2>
              <button onClick={() => setIsAdding(false)} className="bg-muted p-2 rounded-full"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto">
              <input className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Nombre del producto" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input className="bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Marca" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                <select className="bg-muted rounded-2xl px-6 py-4 outline-none font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                  <option value="">Categoría...</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <textarea className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold min-h-[80px]" placeholder="Descripción" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <div>
                <label className="text-[10px] text-muted-foreground font-black uppercase ml-2 mb-1 block">Talles (opcional, separar con comas)</label>
                <input className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Ej: S, M, L, XL o 38, 40, 42" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
              </div>

              <div className="bg-foreground rounded-[32px] p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground font-black uppercase ml-2">Precio Actual</label>
                    <input className="w-full bg-background/10 rounded-xl px-5 py-3 text-primary font-black text-xl outline-none" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground font-black uppercase ml-2">Stock</label>
                    <input className="w-full bg-background/10 rounded-xl px-5 py-3 text-background font-black text-xl outline-none" type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setFormData({...formData, is_on_sale: !formData.is_on_sale})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${formData.is_on_sale ? 'bg-primary text-primary-foreground' : 'bg-background/5 text-muted-foreground'}`}>
                    {formData.is_on_sale && <Check size={12} className="inline mr-1" />} Oferta
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, free_shipping: !formData.free_shipping})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${formData.free_shipping ? 'bg-success text-success-foreground' : 'bg-background/5 text-muted-foreground'}`}>
                    {formData.free_shipping && <Check size={12} className="inline mr-1" />} Envío Gratis
                  </button>
                </div>
                {formData.is_on_sale && (
                  <input className="w-full bg-background rounded-xl px-5 py-3 font-black text-foreground outline-none" placeholder="Precio Original (el tachado, más alto)" type="number" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} />
                )}
              </div>

              <div className="grid grid-cols-4 gap-4">
                {tempImages.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border">
                    <img src={url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setTempImages(prev => prev.filter(u => u !== url))} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"><X size={10}/></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary">
                  {uploadingImages ? <Loader2 className="animate-spin"/> : <Upload/>}
                </button>
              </div>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                {loading ? "Guardando..." : editingId ? "Guardar Cambios" : "Publicar Ahora"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ===================== AJUSTES TAB =====================
const AjustesTab = () => {
  const queryClient = useQueryClient();
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<string>('image');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: settings } = useQuery({
    queryKey: ['admin-site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (error) throw error;
      if (data) { setMediaUrl(data.home_media_url || ''); setMediaType(data.home_media_type || 'image'); }
      return data;
    }
  });

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `banner/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('repuestos').upload(fileName, file);
    if (error) { toast.error("Error al subir"); return; }
    const { data } = supabase.storage.from('repuestos').getPublicUrl(fileName);
    if (data?.publicUrl) {
      setMediaUrl(data.publicUrl);
      const isVideo = file.type.startsWith('video');
      setMediaType(isVideo ? 'video' : 'image');
    }
  };

  const handleSave = async () => {
    if (!settings?.id) return;
    setSaving(true);
    const { error } = await supabase.from('site_settings').update({
      home_media_url: mediaUrl,
      home_media_type: mediaType,
      updated_at: new Date().toISOString()
    }).eq('id', settings.id);
    setSaving(false);
    if (!error) {
      toast.success("¡Banner actualizado!");
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    } else { toast.error("Error: " + error.message); }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-10">Ajustes del Sitio</h1>

      <div className="bg-card rounded-[32px] border p-10 space-y-8">
        <div>
          <h3 className="font-black uppercase tracking-tighter text-lg mb-4">Banner Multimedia (Home)</h3>
          <p className="text-muted-foreground text-sm mb-6 font-medium">Subí una imagen o video, o pegá un link directo (MP4 o imagen).</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <button type="button" onClick={() => setMediaType('image')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${mediaType === 'image' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              Imagen
            </button>
            <button type="button" onClick={() => setMediaType('video')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${mediaType === 'video' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              Video
            </button>
          </div>

          <input
            className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold text-sm"
            placeholder="URL del medio (imagen o video MP4)"
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
          />

          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed rounded-2xl py-6 text-muted-foreground hover:text-primary hover:border-primary font-black uppercase text-xs tracking-widest transition-all">
            <Upload size={20} className="inline mr-2" /> Subir archivo
          </button>
          <input type="file" accept="image/*,video/mp4" className="hidden" ref={fileInputRef} onChange={handleUploadBanner} />
        </div>

        {mediaUrl && (
          <div className="rounded-2xl overflow-hidden border bg-muted aspect-video">
            {mediaType === 'video' ? (
              <video src={mediaUrl} controls className="w-full h-full object-cover" />
            ) : (
              <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" />
            )}
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
          {saving ? "Guardando..." : "Guardar Banner"}
        </button>
      </div>
    </div>
  );
};

export default Admin;
