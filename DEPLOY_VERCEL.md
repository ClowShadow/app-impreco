# Guía de Deploy en Vercel

## Resumen Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea archivo `.env.local`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/app_db?retryWrites=true&w=majority
```

### 3. Importar datos a MongoDB
```bash
npm run db:seed
```

### 4. Deploy en Vercel

#### Opción A: Vercel CLI
```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Login (solo primera vez)
vercel login

# Deploy (crea preview)
vercel

# Deploy a producción
vercel --prod
```

#### Opción B: GitHub + Vercel Dashboard (Recomendado)
1. Sube código a GitHub
2. Importa proyecto en [vercel.com](https://vercel.com)
3. Configura `MONGODB_URI` en Environment Variables
4. Deploy automático en cada push

---

## Estructura del Proyecto para Vercel

```
├── api/                      # API Routes (Vercel Functions)
│   ├── health.ts            # Health check endpoint
│   └── products.ts          # Products CRUD API
├── database/
│   ├── lib/
│   │   └── db.ts            # MongoDB connection
│   ├── schemas/
│   │   └── product.ts       # TypeScript schemas
│   ├── seed/
│   │   └── products.json    # Seed data
│   └── scripts/
│       └── seed.ts          # Import script
├── src/                      # Frontend (TanStack Start)
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
└── vite.config.ts           # Build config
```

---

## Endpoints API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Verifica conexión a MongoDB |
| `/api/products` | GET | Lista todos los productos |
| `/api/products?id=1` | GET | Obtiene producto por ID |
| `/api/products` | POST | Crea nuevo producto |

---

## Variables de Entorno Requeridas

| Variable | Descripción | Dónde obtener |
|----------|-------------|---------------|
| `MONGODB_URI` | Connection string de MongoDB | MongoDB Atlas |
| `DB_NAME` | Nombre de la base de datos | Opcional (default: app_db) |

---

## Migración desde Netlify

### Cambios realizados:
- ✅ Eliminado `@netlify/vite-plugin-tanstack-start`
- ✅ Agregado `@vercel/node` para API routes
- ✅ Agregado `mongodb` driver
- ✅ Creado `vercel.json` configuration
- ✅ Creada carpeta `api/` para serverless functions
- ✅ Actualizado `vite.config.ts`

### Próximos pasos:
1. Eliminar `netlify.toml` (opcional, ya no se usa)
2. Crear base de datos MongoDB Atlas
3. Configurar `MONGODB_URI` en Vercel
4. Importar datos con `npm run db:seed`
5. Deploy!

---

## Troubleshooting

### Build falla
```bash
# Limpiar cache
rm -rf node_modules dist .vercel
npm install
vercel --prod
```

### Error de conexión MongoDB
1. Verifica IP whitelist en MongoDB Atlas
2. Confirma formato de URI: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
3. Verifica que el usuario tiene permisos readWrite

### API 404
- Verifica que `api/` está en la raíz del proyecto
- Confirma que `vercel.json` tiene las rutas correctas
