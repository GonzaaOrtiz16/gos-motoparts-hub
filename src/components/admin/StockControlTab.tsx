import React, { useState, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Plus, Minus, Download, Upload, Search, Package, FileSpreadsheet, Loader2, DollarSign, Users } from "lucide-react";
import { useRef } from 'react';

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const StockControlTab = () => {
  const queryClient = useQueryClient();
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [stockDelta, setStockDelta] = useState(0);
  const [saving, setSaving] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('title');
      if (error) throw error;
      return data;
    }
  });

  const today = new Date().toISOString().slice(0, 10);
  const { data: todayMovements = [] } = useQuery({
    queryKey: ['admin-today-movements', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('movement_type', 'venta')
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const dailySummary = useMemo(() => {
    const totalRevenue = todayMovements.reduce((sum, m) => {
      const product = products.find(p => p.id === m.product_id);
      return sum + Math.abs(m.quantity) * (product?.price ?? 0);
    }, 0);
    const bySeller: Record<string, number> = {};
    todayMovements.forEach(m => {
      const seller = m.seller_name || 'Sin identificar';
      const product = products.find(p => p.id === m.product_id);
      const amount = Math.abs(m.quantity) * (product?.price ?? 0);
      bySeller[seller] = (bySeller[seller] || 0) + amount;
    });
    return { totalRevenue, bySeller, totalSales: todayMovements.length };
  }, [todayMovements, products]);

  const handleManualSearch = () => {
    if (!manualSearch.trim()) return;
    const found = products.find(p =>
      (p.title || p.name || '').toLowerCase().includes(manualSearch.toLowerCase()) ||
      p.barcode === manualSearch ||
      p.id === manualSearch
    );
    if (found) {
      setScannedProduct(found);
      setStockDelta(0);
      setManualSearch('');
    } else {
      toast.error("Producto no encontrado");
    }
  };

  const handleUpdateStock = async () => {
    if (!scannedProduct || stockDelta === 0) return;
    setSaving(true);
    const newStock = Math.max(0, (scannedProduct.stock || 0) + stockDelta);
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', scannedProduct.id);
    setSaving(false);
    if (!error) {
      toast.success(`Stock actualizado: ${scannedProduct.stock} → ${newStock}`);
      setScannedProduct({ ...scannedProduct, stock: newStock });
      setStockDelta(0);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } else {
      toast.error("Error al actualizar stock");
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Título', 'Código de Barras', 'Stock', 'Precio', 'Categoría', 'Marca'];
    const rows = products.map(p => [
      p.id, `"${(p.title || p.name || '').replace(/"/g, '""')}"`, p.barcode || '', p.stock ?? 0, p.price, `"${p.category}"`, `"${p.brand}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_gos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) { toast.error("El CSV está vacío"); setImporting(false); return; }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idIdx = headers.findIndex(h => h === 'id');
    const stockIdx = headers.findIndex(h => h === 'stock');
    const barcodeIdx = headers.findIndex(h => h.includes('barr') || h.includes('barcode') || h.includes('código'));
    if (idIdx === -1 || stockIdx === -1) { toast.error("El CSV debe tener columnas 'ID' y 'Stock'"); setImporting(false); return; }
    let updated = 0, errors = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const id = cols[idIdx]; const stock = parseInt(cols[stockIdx]);
      if (!id || isNaN(stock)) continue;
      const updateData: any = { stock };
      const csvBarcode = barcodeIdx !== -1 ? cols[barcodeIdx] : '';
      if (csvBarcode) updateData.barcode = csvBarcode;
      else updateData.barcode = `GOS-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { error } = await supabase.from('products').update(updateData).eq('id', id);
      if (error) errors++; else updated++;
    }
    setImporting(false);
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    toast.success(`Importación: ${updated} actualizados, ${errors} errores`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">Control de Stock</h1>

      {/* Daily Sales */}
      <div className="bg-card rounded-[32px] border border-border p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <DollarSign size={24} className="text-success" />
          <h3 className="font-black uppercase tracking-tighter text-lg">Ventas del Día</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-success/10 rounded-2xl p-5 border border-success/20">
            <p className="text-[10px] font-black uppercase text-success mb-1">Total Recaudado</p>
            <p className="text-3xl font-black text-success">{formatPrice(dailySummary.totalRevenue)}</p>
          </div>
          <div className="bg-muted rounded-2xl p-5 border border-border">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Operaciones</p>
            <p className="text-3xl font-black text-foreground">{dailySummary.totalSales}</p>
          </div>
        </div>
        {Object.keys(dailySummary.bySeller).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3"><Users size={16} className="text-muted-foreground" /><p className="text-xs font-black uppercase text-muted-foreground">Desglose por Vendedor</p></div>
            <div className="space-y-2">
              {Object.entries(dailySummary.bySeller).sort(([,a],[,b]) => b - a).map(([seller, amount]) => (
                <div key={seller} className="flex items-center justify-between bg-muted rounded-xl px-4 py-3 border border-border">
                  <span className="text-xs font-bold text-muted-foreground truncate">{seller}</span>
                  <span className="text-sm font-black text-foreground">{formatPrice(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="bg-card rounded-[32px] border border-border p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="font-black uppercase tracking-tighter text-lg">Buscar Producto</h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="text" placeholder="Buscar por nombre, código o ID..." className="w-full bg-muted border border-border rounded-2xl pl-12 pr-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" value={manualSearch} onChange={e => setManualSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManualSearch()} />
          </div>
          <button onClick={handleManualSearch} className="bg-foreground text-background px-6 rounded-2xl font-black uppercase text-xs">Buscar</button>
        </div>
        {scannedProduct && (
          <div className="bg-muted rounded-[24px] border-2 border-primary/20 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <img src={scannedProduct.images?.[0] || scannedProduct.image_urls?.[0] || '/placeholder.svg'} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest">{scannedProduct.brand}</p>
                  <h4 className="font-black uppercase text-sm">{scannedProduct.title || scannedProduct.name}</h4>
                  {scannedProduct.barcode && <p className="text-[10px] text-muted-foreground font-bold mt-1">Código: {scannedProduct.barcode}</p>}
                </div>
              </div>
              <button onClick={() => { setScannedProduct(null); setStockDelta(0); }} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="flex items-center justify-center gap-6 py-4">
              <button onClick={() => setStockDelta(d => d - 1)} className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"><Minus size={24} /></button>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Stock actual</p>
                <p className="text-4xl font-black text-foreground">{(scannedProduct.stock || 0) + stockDelta}</p>
                {stockDelta !== 0 && <p className={`text-sm font-black ${stockDelta > 0 ? 'text-success' : 'text-destructive'}`}>{stockDelta > 0 ? '+' : ''}{stockDelta}</p>}
              </div>
              <button onClick={() => setStockDelta(d => d + 1)} className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center hover:bg-success/20 transition-colors"><Plus size={24} /></button>
            </div>
            <button onClick={handleUpdateStock} disabled={stockDelta === 0 || saving} className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-4 rounded-2xl font-black uppercase text-sm transition-all shadow-lg shadow-primary/20 disabled:shadow-none">
              {saving ? "Guardando..." : "Actualizar Stock"}
            </button>
          </div>
        )}
      </div>

      {/* Import/Export */}
      <div className="bg-card rounded-[32px] border border-border p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3"><FileSpreadsheet size={24} className="text-primary" /><h3 className="font-black uppercase tracking-tighter text-lg">Importar / Exportar</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={handleExportCSV} className="flex items-center justify-center gap-3 bg-foreground text-background py-5 rounded-2xl font-black uppercase text-sm hover:bg-foreground/90 transition-all shadow-lg"><Download size={20} /> Exportar CSV</button>
          <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="flex items-center justify-center gap-3 border-2 border-dashed border-primary text-primary py-5 rounded-2xl font-black uppercase text-sm hover:bg-primary/5 transition-all disabled:opacity-50">
            {importing ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            {importing ? 'Importando...' : 'Importar CSV'}
          </button>
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
        </div>
        <div>
          <h4 className="font-black uppercase text-xs tracking-widest text-muted-foreground mb-4 flex items-center gap-2"><Package size={14} /> Resumen de Stock</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-success/10 rounded-2xl p-4 text-center border border-success/20"><p className="text-2xl font-black text-success">{products.filter(p => (p.stock ?? 0) > 5).length}</p><p className="text-[9px] font-black uppercase text-success">Con stock</p></div>
            <div className="bg-warning/10 rounded-2xl p-4 text-center border border-warning/20"><p className="text-2xl font-black text-warning">{products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5).length}</p><p className="text-[9px] font-black uppercase text-warning">Stock bajo</p></div>
            <div className="bg-destructive/10 rounded-2xl p-4 text-center border border-destructive/20"><p className="text-2xl font-black text-destructive">{products.filter(p => (p.stock ?? 0) <= 0).length}</p><p className="text-[9px] font-black uppercase text-destructive">Sin stock</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockControlTab;
