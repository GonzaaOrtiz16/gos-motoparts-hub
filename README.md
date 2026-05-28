# GO's Motoparts Hub

E-commerce de repuestos y accesorios para motos, con panel de administración completo, asistente de IA y analíticas de comportamiento de usuarios.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui + Framer Motion |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| Estado | TanStack React Query |
| Routing | React Router DOM v6 |
| Formularios | React Hook Form + Zod |

---

## Funcionalidades

### Tienda
- Hero con video de fondo y efecto parallax
- Búsqueda inteligente desde la pantalla principal
- Catálogo de productos filtrable por categoría
- Página de detalle con código QR por producto
- Carrito de compras con drawer lateral
- Checkout integrado
- Botón flotante de WhatsApp

### IA
- Asistente conversacional en tiempo real (streaming via Supabase Edge Function)
- Importador de productos con enriquecimiento por IA (nombre, compatibilidad, categoría, keywords) a partir de archivos CSV / Excel

### Panel de administración (`/admin`)
- Gestión de productos, categorías y motos
- Control de stock
- Importador masivo de repuestos con IA
- Insights de heatmap (clics y profundidad de scroll)
- Panel de ajustes

### Analytics
- Heatmap tracker: registra clics y scroll depth en batches hacia Supabase

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd gos-motoparts-hub

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Completar VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## Scripts

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Vista previa del build
npm run lint       # Linter
npm run test       # Tests (Vitest)
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key pública de Supabase |

---

## Estructura de rutas

```
/               → Home
/productos      → Catálogo
/producto/:slug → Detalle de producto
/checkout       → Checkout
/auth           → Login / Registro
/admin          → Panel de administración (rol: admin)
/vendedores     → Panel de vendedores (rol: staff)
```

---

## Roles y permisos

El acceso a `/admin` y `/vendedores` está protegido por `ProtectedRoute`. El rol se verifica contra Supabase Auth.

| Ruta | Rol requerido |
|---|---|
| `/admin` | `admin` |
| `/vendedores` | `staff` |
