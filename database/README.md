# Base de Datos MongoDB

## Esquemas

### Product
```typescript
interface Product {
  _id?: ObjectId           // MongoDB ID (automático)
  id: number               // ID único de negocio
  name: string             // Nombre del producto
  image: string            // URL de la imagen
  description: string      // Descripción larga
  shortDescription: string // Descripción corta
  price: number            // Precio en centavos/entero
  createdAt?: Date         // Fecha de creación
  updatedAt?: Date         // Fecha de actualización
}
```

## Importar Datos

### Método 1: Script npm (Recomendado)
```bash
npm install
npm run db:seed
```

### Método 2: MongoDB Compass
1. Abre MongoDB Compass
2. Conecta con tu URI
3. Crea base de datos `app_db`
4. Crea colección `products`
5. Importa `database/seed/products.json`

### Método 3: MongoDB Atlas Web UI
1. Ve a MongoDB Atlas
2. Database > Browse Collections
3. Create Database: `app_db`
4. Create Collection: `products`
5. Import JSON desde `database/seed/products.json`

## Archivos

- `lib/db.ts` - Conexión a MongoDB con caching
- `schemas/product.ts` - Definición TypeScript y validación
- `seed/products.json` - Datos iniciales
- `scripts/seed.ts` - Script de importación
