import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, Sparkles, Check, AlertCircle, Loader2, ImageIcon, Pencil, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface ParsedRow {
  code: string;
  description: string;
  stock: number;
  currency: string;
  rawPrice: number;
  costARS: number;
  salePrice: number;
}

interface EnrichedRow extends ParsedRow {
  ai_name: string;
  ai_moto_fit: string[];
  ai_category: string;
  ai_search_keyword: string;
  imageUrl: string;
  editing?: boolean;
}

const UNSPLASH_FALLBACK = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop';

const CATEGORY_IMAGES: Record<string, string> = {
  'Frenos': 'https://images.unsplash.com/photo-1600705722908-bab1e61c5f00?w=200&h=200&fit=crop',
  'Motor': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&h=200&fit=crop',
  'Transmisión': 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=200&h=200&fit=crop',
  'Estética': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=200&h=200&fit=crop',
  'Escapes': 'https://images.unsplash.com/photo-1558980664-10e7170b5df9?w=200&h=200&fit=crop',
  'Eléctrico': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop',
  'Suspensión': 'https://images.unsplash.com/photo-1558980664-10e7170b5df9?w=200&h=200&fit=crop',
  'Filtros': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=200&h=200&fit=crop',
  'Lubricantes': 'https://images.unsplash.com/photo-1635784063803-1ff6d4e1e07f?w=200&h=200&fit=crop',
  'Neumáticos': 'https://images.unsplash.com/photo-1600705722908-bab1e61c5f00?w=200&h=200&fit=crop',
  'Accesorios': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop',
};

export default function ImportadorTab() {
  const [dollarRate, setDollarRate] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [enrichedRows, setEnrichedRows] = useState<EnrichedRow[]>([]);
  const [step, setStep] = useState<'upload' | 'enriching' | 'preview' | 'saving' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = useCallback((file: File) => {
    if (!dollarRate || parseFloat(dollarRate) <= 0) {
      toast({ title: 'Error', description: 'Ingresá el valor del dólar antes de subir el archivo.', variant: 'destructive' });
      return;
    }

    const rate = parseFloat(dollarRate);
    setFileName(file.name);

    Papa.parse(file, {
      encoding: 'latin1',
      complete: (results) => {
        const rows = results.data as string[][];
        
        // Find header row containing expected columns
        let headerIdx = -1;
        for (let i = 0; i < Math.min(rows.length, 30); i++) {
          const row = rows[i].map(c => (c || '').toString().trim().toLowerCase());
          if (row.some(c => c.includes('cód') || c.includes('cod')) &&
              row.some(c => c.includes('descripci') || c.includes('descripcion')) &&
              row.some(c => c.includes('precio'))) {
            headerIdx = i;
            break;
          }
        }

        if (headerIdx === -1) {
          toast({ title: 'Error de formato', description: 'No se encontraron los encabezados esperados (Cód., Descripción, Stock, Mon., Precio).', variant: 'destructive' });
          return;
        }

        const headers = rows[headerIdx].map(h => (h || '').toString().trim().toLowerCase());
        const codeIdx = headers.findIndex(h => h.includes('cód') || h.includes('cod'));
        const descIdx = headers.findIndex(h => h.includes('descripci'));
        const stockIdx = headers.findIndex(h => h.includes('stock'));
        const currIdx = headers.findIndex(h => h.includes('mon'));
        const priceIdx = headers.findIndex(h => h.includes('precio'));

        const parsed: ParsedRow[] = [];
        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 3) continue;

          const desc = (row[descIdx] || '').toString().trim();
          if (!desc) continue;

          const rawPrice = parseFloat((row[priceIdx] || '0').toString().replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
          if (rawPrice <= 0) continue;

          const currency = (row[currIdx] || '').toString().trim().toLowerCase();
          const isDollar = currency.includes('dól') || currency.includes('dol') || currency.includes('usd') || currency.includes('dollar');
          const costARS = isDollar ? rawPrice * rate : rawPrice;
          const salePrice = Math.round(costARS * 1.5);

          parsed.push({
            code: (row[codeIdx] || '').toString().trim(),
            description: desc,
            stock: parseInt((row[stockIdx] || '0').toString()) || 0,
            currency: isDollar ? 'USD' : 'ARS',
            rawPrice,
            costARS: Math.round(costARS),
            salePrice,
          });
        }

        if (parsed.length === 0) {
          toast({ title: 'Sin datos', description: 'No se encontraron filas válidas con precio > 0.', variant: 'destructive' });
          return;
        }

        setParsedRows(parsed);
        toast({ title: `${parsed.length} productos parseados`, description: 'Iniciando enriquecimiento con IA...' });
        enrichWithAI(parsed);
      },
      error: () => {
        toast({ title: 'Error', description: 'No se pudo leer el archivo CSV.', variant: 'destructive' });
      },
    });
  }, [dollarRate]);

  const enrichWithAI = async (rows: ParsedRow[]) => {
    setStep('enriching');
    setProgress(0);

    const batchSize = 10;
    const allEnriched: EnrichedRow[] = [];

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const items = batch.map(r => ({ code: r.code, description: r.description }));

      try {
        const { data, error } = await supabase.functions.invoke('enrich-product', {
          body: { items },
        });

        if (error) throw error;

        const results = data?.results || [];
        for (let j = 0; j < batch.length; j++) {
          const ai = results[j] || {};
          const category = ai.ai_category || 'Accesorios';
          allEnriched.push({
            ...batch[j],
            ai_name: ai.ai_name || batch[j].description.substring(0, 60),
            ai_moto_fit: ai.ai_moto_fit || ['Universal'],
            ai_category: category,
            ai_search_keyword: ai.ai_search_keyword || 'motorcycle part',
            imageUrl: CATEGORY_IMAGES[category] || UNSPLASH_FALLBACK,
          });
        }
      } catch (err) {
        console.error('AI enrichment error:', err);
        // Fallback for failed batch
        for (const row of batch) {
          allEnriched.push({
            ...row,
            ai_name: row.description.substring(0, 60),
            ai_moto_fit: ['Universal'],
            ai_category: 'Accesorios',
            ai_search_keyword: 'motorcycle part',
            imageUrl: UNSPLASH_FALLBACK,
          });
        }
      }

      setProgress(Math.round(((i + batchSize) / rows.length) * 100));
    }

    setEnrichedRows(allEnriched);
    setStep('preview');
    toast({ title: '¡Enriquecimiento completo!', description: `${allEnriched.length} productos listos para revisar.` });
  };

  const updatePrice = (idx: number, newPrice: string) => {
    const val = parseInt(newPrice) || 0;
    setEnrichedRows(prev => prev.map((r, i) => i === idx ? { ...r, salePrice: val } : r));
  };

  const updateName = (idx: number, newName: string) => {
    setEnrichedRows(prev => prev.map((r, i) => i === idx ? { ...r, ai_name: newName } : r));
  };

  const removeRow = (idx: number) => {
    setEnrichedRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBulkSave = async () => {
    if (enrichedRows.length === 0) return;
    setStep('saving');
    setProgress(0);

    const batchSize = 50;
    let saved = 0;

    try {
      for (let i = 0; i < enrichedRows.length; i += batchSize) {
        const batch = enrichedRows.slice(i, i + batchSize);
        const records = batch.map(r => ({
          name: r.ai_name,
          title: r.ai_name,
          description: r.description,
          price: r.salePrice,
          original_price: r.costARS,
          stock: r.stock,
          category: r.ai_category,
          moto_fit: r.ai_moto_fit,
          barcode: r.code || null,
          image_urls: [r.imageUrl],
          images: [r.imageUrl],
          is_on_sale: false,
          free_shipping: false,
        }));

        const { error } = await supabase.from('products').insert(records);
        if (error) throw error;

        saved += batch.length;
        setProgress(Math.round((saved / enrichedRows.length) * 100));
      }

      setStep('done');
      toast({ title: '¡Catálogo subido!', description: `${saved} productos guardados exitosamente.` });
    } catch (err: any) {
      console.error('Bulk save error:', err);
      toast({ title: 'Error al guardar', description: err.message, variant: 'destructive' });
      setStep('preview');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      parseCSV(file);
    } else {
      toast({ title: 'Formato inválido', description: 'Solo se aceptan archivos .csv', variant: 'destructive' });
    }
  }, [parseCSV]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseCSV(file);
  }, [parseCSV]);

  const resetImporter = () => {
    setParsedRows([]);
    setEnrichedRows([]);
    setStep('upload');
    setProgress(0);
    setFileName('');
  };

  return (
    <div className="space-y-6">
      {/* Dollar Rate Input */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-primary" />
            Importador Inteligente de Lista de Precios
          </CardTitle>
          <CardDescription>
            Subí el CSV del proveedor. El sistema convierte moneda, aplica ganancia y enriquece cada producto con IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="dollar-rate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Valor Dólar Oficial Hoy ($)
              </Label>
              <Input
                id="dollar-rate"
                type="number"
                placeholder="Ej: 1050"
                value={dollarRate}
                onChange={(e) => setDollarRate(e.target.value)}
                className="mt-1.5 text-lg font-bold"
                min={1}
                step="0.01"
              />
            </div>
            {step !== 'upload' && (
              <Button variant="outline" size="sm" onClick={resetImporter}>
                Nueva importación
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      {step === 'upload' && (
        <Card
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed transition-all cursor-pointer ${dragOver ? 'border-primary bg-accent/50 scale-[1.01]' : 'border-border hover:border-primary/50'}`}
          onClick={() => fileRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className={`p-4 rounded-full transition-colors ${dragOver ? 'bg-primary/20' : 'bg-muted'}`}>
              <Upload size={32} className={dragOver ? 'text-primary' : 'text-muted-foreground'} />
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">Arrastrá tu archivo CSV acá</p>
              <p className="text-sm text-muted-foreground mt-1">o hacé clic para seleccionar</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
          </CardContent>
        </Card>
      )}

      {/* Enriching Progress */}
      {step === 'enriching' && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-6">
            <div className="relative">
              <Sparkles size={40} className="text-primary animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-foreground">Gemini está analizando tus productos...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Asignando nombres, categorías, compatibilidades y fotos
              </p>
            </div>
            <div className="w-full max-w-md">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center mt-2">{progress}% completado</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {step === 'preview' && enrichedRows.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Vista Previa — {enrichedRows.length} productos
                </CardTitle>
                <CardDescription>
                  Revisá y editá antes de subir. Archivo: <span className="font-mono text-foreground">{fileName}</span>
                </CardDescription>
              </div>
              <Button onClick={handleBulkSave} className="gap-2">
                <Check size={16} /> Confirmar y Subir Catálogo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Foto</TableHead>
                    <TableHead>Nombre (IA)</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Compatible</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Venta (+50%)</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={row.imageUrl}
                            alt={row.ai_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = UNSPLASH_FALLBACK; }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.ai_name}
                          onChange={(e) => updateName(idx, e.target.value)}
                          className="border-0 bg-transparent p-0 h-auto text-sm font-medium focus-visible:ring-1"
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {row.code && `Cód: ${row.code} · `}{row.description.substring(0, 50)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{row.ai_category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-0.5">
                          {row.ai_moto_fit.slice(0, 2).map((m, i) => (
                            <Badge key={i} variant="outline" className="text-[9px]">{m}</Badge>
                          ))}
                          {row.ai_moto_fit.length > 2 && (
                            <Badge variant="outline" className="text-[9px]">+{row.ai_moto_fit.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        ${row.costARS.toLocaleString('es-AR')}
                        {row.currency === 'USD' && (
                          <span className="block text-[10px]">U$D {row.rawPrice}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          value={row.salePrice}
                          onChange={(e) => updatePrice(idx, e.target.value)}
                          className="w-24 ml-auto text-right font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-1"
                        />
                      </TableCell>
                      <TableCell className="text-right text-sm">{row.stock}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => removeRow(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saving Progress */}
      {step === 'saving' && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-6">
            <Loader2 size={40} className="text-primary animate-spin" />
            <div className="text-center">
              <p className="font-bold text-lg text-foreground">Guardando catálogo...</p>
              <p className="text-sm text-muted-foreground mt-1">Insertando productos en la base de datos</p>
            </div>
            <div className="w-full max-w-md">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center mt-2">{progress}%</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Done */}
      {step === 'done' && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-success/10">
              <Check size={32} className="text-success" />
            </div>
            <p className="font-bold text-lg text-foreground">¡Catálogo importado con éxito!</p>
            <p className="text-sm text-muted-foreground">
              {enrichedRows.length} productos guardados en la base de datos.
            </p>
            <Button onClick={resetImporter} variant="outline" className="mt-2">
              Importar otra lista
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
