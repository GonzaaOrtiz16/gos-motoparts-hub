import { useState } from 'react';
import { LogOut, Package, Bike, LayoutGrid, Settings, ScanBarcode, ScanLine, FileUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import RepuestosTab from '@/components/admin/RepuestosTab';
import MotosTab from '@/components/admin/MotosTab';
import CategoriasTab from '@/components/admin/CategoriasTab';
import AjustesTab from '@/components/admin/AjustesTab';
import StockControlTab from '@/components/admin/StockControlTab';
import ImportadorTab from '@/components/admin/ImportadorTab';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'repuestos' | 'motos' | 'categorias' | 'stock' | 'importador' | 'ajustes'>('repuestos');
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { displayName } = useUserRole();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const tabs = [
    { id: 'repuestos' as const, label: 'Repuestos', icon: Package },
    { id: 'motos' as const, label: 'Motos', icon: Bike },
    { id: 'categorias' as const, label: 'Categorías', icon: LayoutGrid },
    { id: 'stock' as const, label: 'Stock', icon: ScanBarcode },
    { id: 'importador' as const, label: 'Importador', icon: FileUp },
    { id: 'ajustes' as const, label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/50 font-sans text-foreground">
      <header className="border-b border-border px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center bg-card sticky top-0 z-20 shadow-sm gap-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl font-black uppercase text-primary italic">GOS</span>
            <span className="text-xl font-black uppercase text-foreground italic">Admin</span>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => navigate('/vendedores')} className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-bold transition-all">
              <ScanLine size={14} /> POS
            </button>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-bold transition-all">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        <div className="flex gap-1 bg-muted p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex-1 md:flex-none justify-center ${activeTab === tab.id ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {displayName && <span className="text-xs text-muted-foreground font-bold">{displayName}</span>}
          <button onClick={() => navigate('/vendedores')} className="text-primary hover:text-primary/80 flex items-center gap-2 text-sm font-bold transition-all">
            <ScanLine size={16} /> POS
          </button>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-bold transition-all">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === 'repuestos' && <RepuestosTab />}
        {activeTab === 'motos' && <MotosTab />}
        {activeTab === 'categorias' && <CategoriasTab />}
        {activeTab === 'stock' && <StockControlTab />}
        {activeTab === 'ajustes' && <AjustesTab />}
      </main>
    </div>
  );
};

export default Admin;
