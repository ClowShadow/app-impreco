# Crear Base de Datos MongoDB Atlas (Paso a Paso)

## 1. Crear Cuenta MongoDB Atlas

1. Ve a [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Haz clic en **Try Free**
3. Regístrate con:
   - Google account, o
   - Email y contraseña
4. Completa el cuestionario (o salta con "Skip")

## 2. Crear Cluster Gratuito

1. Selecciona **Shared** (gratuito)
2. Proveedor: **AWS** (recomendado para Vercel)
3. Región: Elige la más cercana a ti (ej: `us-east-1`)
4. Nombre del cluster: `Cluster0` (default)
5. Haz clic en **Create Deployment**

⏳ **Espera 1-3 minutos** mientras se crea el cluster.

## 3. Configurar Acceso de Red (IP Whitelist)

1. En el panel izquierdo, ve a **Network Access**
2. Haz clic en **Add IP Address**
3. Selecciona **Allow Access from Anywhere** (0.0.0.0/0)
   - Esto permite conexiones desde Vercel
4. Haz clic en **Confirm**

## 4. Crear Usuario de Base de Datos

1. Ve a **Database Access** (panel izquierdo)
2. Haz clic en **Add New Database User**
3. Método de autenticación: **Password**
4. Username: `app_user` (o el que prefieras)
5. Password: 
   - Opción A: **Autogenerate** (guárdalo en un lugar seguro!)
   - Opción B: **Custom** (crea tu propia contraseña segura)
6. Database User Privileges: **Read and write to any database**
7. Haz clic en **Add User**

## 5. Obtener Connection String

1. Ve a **Database** → **Clusters**
2. Haz clic en **Connect** en tu cluster
3. Selecciona **Drivers**
4. En **Driver**, selecciona **Node.js**
5. En **Version**, selecciona la última (6.0 o superior)
6. Copia la connection string. Se verá así:
   ```
   mongodb+srv://app_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
7. Reemplaza `<password>` con la contraseña del usuario que creaste

## 6. Crear Base de Datos y Colección

### Opción A: MongoDB Compass (Recomendado)

1. Descarga [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Abre Compass
3. Pega tu connection string
4. Haz clic en **Connect**
5. En la barra superior, haz clic en **Create Database**
6. Database Name: `app_db`
7. Collection Name: `products`
8. Haz clic en **Create Database**

### Opción B: MongoDB Shell (mongosh)

```bash
# Instalar mongosh: https://www.mongodb.com/docs/mongodb-shell/

# Conectar
mongosh "mongodb+srv://app_user:PASSWORD@cluster0.xxxxx.mongodb.net/app_db"

# Dentro de mongosh:
use app_db
db.createCollection('products')
exit
```

### Opción C: MongoDB Atlas Web UI

1. En Atlas, ve a **Database** → **Browse Collections**
2. Haz clic en **Add My Own Data**
3. Database name: `app_db`
4. Collection name: `products`
5. Haz clic en **Create**

## 7. Importar Datos de Prueba

### Método 1: Script npm (desde tu proyecto)
```bash
cd "c:\Users\DFT\Downloads\app impreco"
npm install

# Configurar variable de entorno temporal
$env:MONGODB_URI="mongodb+srv://app_user:PASSWORD@cluster0.xxxxx.mongodb.net/app_db?retryWrites=true&w=majority"

# Ejecutar seed
npm run db:seed
```

### Método 2: MongoDB Compass
1. Conecta a tu cluster con Compass
2. Selecciona la base de datos `app_db`
3. Selecciona la colección `products`
4. Haz clic en **Add Data** → **Import JSON or CSV file**
5. Selecciona: `c:\Users\DFT\Downloads\app impreco\database\seed\products.json`
6. Haz clic en **Import**

### Método 3: MongoDB Atlas Web UI
1. Ve a **Database** → **Browse Collections**
2. Selecciona la colección `products`
3. Haz clic en **Insert Document**
4. Cambia a **JSON** view
5. Pega el contenido de `database/seed/products.json`
6. Haz clic en **Insert**

## 8. Verificar Conexión

1. Ve a **Database** → **Browse Collections**
2. Deberías ver:
   - Database: `app_db`
   - Collection: `products`
   - Documents: 1 (el producto de ejemplo)

## 9. Configurar en Vercel

1. Ve a [vercel.com](https://vercel.com) → Tu proyecto
2. Ve a **Settings** → **Environment Variables**
3. Agrega:
   - **Name**: `MONGODB_URI`
   - **Value**: Tu connection string completa (con contraseña)
4. Haz clic en **Save**
5. Haz **Redeploy** del proyecto

## Variables de Entorno Final

```
MONGODB_URI=mongodb+srv://app_user:PASSWORD@cluster0.xxxxx.mongodb.net/app_db?retryWrites=true&w=majority
DB_NAME=app_db
```

## Probar la API

Después de deployar, prueba:
```
https://tu-app.vercel.app/api/health
```

Debe retornar:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## Troubleshooting

| Error | Solución |
|-------|----------|
| "Authentication failed" | Verifica que la contraseña esté correcta en el URI |
| "IP not whitelisted" | Agrega `0.0.0.0/0` en Network Access |
| "Cannot reach cluster" | Verifica que el cluster esté activo (no pausado) |
| "database does not exist" | Crea la base de datos manualmente primero |
