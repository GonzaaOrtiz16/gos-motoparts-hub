import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import { Trash2, Plus, X, LogIn, LogOut, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin: React.FC = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data as Product[]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      toast({ title: "Error", description: "Nombre y precio son obligatorios", variant: "destructive" });
      return;
    }
    setUploading(true);

    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("repuestos").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("repuestos").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from("products").insert({
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim() || null,
        category: category.trim() || null,
        image_urls: imageUrls,
      });

      if (error) throw error;

      toast({ title: "¡Producto creado!" });
      setName(""); setPrice(""); setDescription(""); setCategory(""); setFiles([]); setPreviews([]);
      fetchProducts();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    // Delete storage files
    for (const url of product.image_urls) {
      const parts = url.split("/repuestos/");
      if (parts[1]) {
        await supabase.storage.from("repuestos").remove([parts[1]]);
      }
    }
    await supabase.from("products").delete().eq("id", product.id);
    toast({ title: "Producto eliminado" });
    fetchProducts();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-card p-6 rounded-3xl shadow-card">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full gradient-racing flex items-center justify-center mb-3">
              <LogIn className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl text-foreground">Admin GOS Motos</h1>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-racing shadow-racing text-primary-foreground font-display text-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl text-foreground">Panel Admin</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground hover:text-primary font-body text-sm">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>

        {/* Add Product Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-6 space-y-4 shadow-card">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Nuevo Producto
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              placeholder="Nombre del producto *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Precio *"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            />
          </div>
          <input
            placeholder="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground font-body text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground resize-none"
          />

          {/* File Upload */}
          <div>
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border border-dashed border-border cursor-pointer hover:border-primary transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="font-body text-sm text-muted-foreground">Seleccionar fotos (JPG, PNG, WebP)</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFiles}
                className="hidden"
              />
            </label>
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="" className="w-full aspect-square object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 rounded-xl gradient-racing shadow-racing text-primary-foreground font-display text-lg hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {uploading ? "Subiendo..." : "Guardar Producto"}
          </button>
        </form>

        {/* Product List */}
        <div className="space-y-3">
          <h2 className="font-display text-xl text-foreground">Productos ({products.length})</h2>
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 bg-card rounded-xl p-3 shadow-card">
              <img
                src={p.image_urls[0] || "/placeholder.svg"}
                alt={p.name}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-body font-semibold text-sm text-foreground truncate">{p.name}</h4>
                <p className="font-display text-primary">${p.price.toLocaleString("es-AR")}</p>
              </div>
              <button
                onClick={() => handleDelete(p)}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
