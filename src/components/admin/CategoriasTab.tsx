import React, { useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Upload, Loader2, Image } from "lucide-react";
import { useCategorias } from './useCategorias';

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
  const motosCats = categorias?.filter(c => c.tipo === 'motos') || [];

  const CatGrid = ({ cats, label }: { cats: any[]; label: string }) => (
    <div className="mb-10">
      <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4">{label}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cats.map(cat => (
          <div key={cat.id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm group relative">
            <div className="aspect-[3/2] bg-muted overflow-hidden">
              {cat.image ? <img src={cat.image} className="w-full h-full object-cover" alt={cat.nombre} /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Image size={40} /></div>}
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="font-black uppercase text-sm tracking-tight truncate mr-2">{cat.nombre}</span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handleEdit(cat)} className="p-1.5 text-muted-foreground hover:text-primary"><Pencil size={14}/></button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
        {cats.length === 0 && (
          <div className="col-span-full py-10 text-center border-2 border-dashed border-border rounded-3xl text-muted-foreground font-bold text-sm uppercase">Sin categorías</div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">Categorías</h1>
        <button onClick={() => { setEditingId(null); setFormData({ nombre: '', tipo: 'repuestos', image: '' }); setIsAdding(true); }} className="bg-primary text-primary-foreground p-4 md:px-8 md:py-4 rounded-2xl flex items-center gap-2 hover:bg-primary/90 transition-all font-black uppercase shadow-lg shadow-primary/20">
          <Plus size={20} /> <span className="hidden md:inline">Nueva</span>
        </button>
      </div>

      <CatGrid cats={repuestosCats} label="Repuestos" />
      <CatGrid cats={motosCats} label="Motos" />

      {isAdding && (
        <div className="fixed inset-0 bg-foreground/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 md:px-10 md:py-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-black uppercase italic">{editingId ? 'Editar' : 'Nueva'} Categoría</h2>
              <button onClick={() => setIsAdding(false)} className="bg-muted p-2 rounded-full"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
              <input className="w-full bg-muted rounded-2xl px-6 py-4 outline-none font-bold" placeholder="Nombre de la categoría" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              <div>
                <label className="text-[10px] text-muted-foreground font-black uppercase ml-2 mb-2 block">Tipo</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setFormData({...formData, tipo: 'repuestos'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${formData.tipo === 'repuestos' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>Repuestos</button>
                  <button type="button" onClick={() => setFormData({...formData, tipo: 'motos'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${formData.tipo === 'motos' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>Motos</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-black uppercase ml-2 mb-2 block">Imagen</label>
                {formData.image ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-border">
                    <img src={formData.image} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5"><X size={12}/></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
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

export default CategoriasTab;
