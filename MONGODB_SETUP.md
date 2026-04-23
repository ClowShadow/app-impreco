# Guía de Configuración MongoDB + Vercel

## 1. Configurar MongoDB en Vercel

### Paso 1: Crear base de datos MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Crea un cluster gratuito (M0)
5. Configura el acceso:
   - **Database Access**: Crea un usuario con contraseña
   - **Network Access**: Agrega `0.0.0.0/0` (acceso desde cualquier IP) o las IPs de Vercel

### Paso 2: Obtener URI de conexión

1. En MongoDB Atlas, ve a **Database** > **Connect**
2. Selecciona **Drivers** > **Node.js**
3. Copia la connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```
4. Reemplaza `<password>` con la contraseña del usuario

### Paso 3: Configurar en Vercel

1. Ve al dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega:
   - **Name**: `MONGODB_URI`
   - **Value**: Tu connection string completa

O instala la integración oficial:
1. Ve a **Integrations** en Vercel
2. Busca "MongoDB Atlas"
3. Conecta tu cuenta de MongoDB Atlas

---

## 2. Importar Datos a MongoDB

### Opción A: Usando MongoDB Compass (Recomendado)

1. Descarga [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Conecta con tu URI
3. Crea la base de datos `app_db`
4. Importa los archivos JSON de `/database/seed/`

### Opción B: Usando mongosh CLI

```bash
# Instalar MongoDB Shell (mongosh)
# https://www.mongodb.com/docs/mongodb-shell/

# Conectar y crear base de datos
mongosh "mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/app_db"

# Dentro de mongosh, ejecutar:
use app_db
db.createCollection('products')
```

### Opción C: Script de importación incluido

```bash
# Instalar dependencias
npm install

# Configurar variable de entorno
set MONGODB_URI=tu_connection_string_aqui

# Ejecutar importación
npm run db:seed
```

---

## 3. Estructura de la Base de Datos

### Colecciones

| Colección | Descripción |
|-----------|-------------|
| `products` | Catálogo de productos |

### Esquemas

Ver `/database/schemas/` para definiciones completas en TypeScript.

---

## 4. Desplegar en Vercel

### Desde GitHub (Recomendado)

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa el proyecto desde GitHub
4. Configura las variables de entorno `MONGODB_URI`
5. Deploy!

### Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## 5. Verificar Conexión

Después de deployar, visita:
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

---

## Troubleshooting

### Error de conexión a MongoDB

1. Verifica que la IP está permitida en MongoDB Atlas
2. Confirma que el formato de URI es correcto
3. Verifica que el usuario tiene permisos de lectura/escritura

### Build falla en Vercel

1. Verifica que `vercel.json` está en la raíz
2. Confirma que `package.json` tiene los scripts correctos
3. Revisa los logs de build en el dashboard de Vercel
