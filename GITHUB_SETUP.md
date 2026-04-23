# Guía para Subir a GitHub

## Paso 1: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón **+** (arriba a la derecha) → **New repository**
3. Configura:
   - **Repository name**: `app-impreco` (o el nombre que prefieras)
   - **Description**: Marketing app with AI assistant - Vercel + MongoDB
   - **Visibility**: Public o Private (como prefieras)
   - **NO** marques "Add a README" (ya tenemos uno)
4. Haz clic en **Create repository**

## Paso 2: Conectar Repositorio Local

GitHub te mostrará comandos. Usa la opción **"…or push an existing repository from the command line"**:

```bash
cd "c:\Users\DFT\Downloads\app impreco"

git remote add origin https://github.com/ClowShadow/app-impreco.git
git branch -M main
git push -u origin main
```

**Nota**: Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

### Si te pide autenticación:

#### Opción A: GitHub CLI (Recomendado)
```bash
# Instalar GitHub CLI desde https://cli.github.com/
gh auth login
# Sigue las instrucciones, selecciona HTTPS y login con browser
```

#### Opción B: Token de acceso personal
1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Genera un token con permiso `repo`
3. Usa el token como contraseña cuando git lo pida

## Paso 3: Verificar en GitHub

1. Refresca la página de tu repositorio en GitHub
2. Deberías ver todos los archivos subidos
3. El código está listo para deployar en Vercel!

## Paso 4: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en **Add New Project**
3. Selecciona **Import Git Repository**
4. Busca y selecciona `app-impreco`
5. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
6. En **Environment Variables**, agrega:
   - `MONGODB_URI` = tu connection string de MongoDB
7. Haz clic en **Deploy**

## Comandos Útiles

```bash
# Ver estado de cambios
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main

# Ver historial
git log --oneline
```

## Estructura del Repositorio

```
app-impreco/
├── api/                    # API Routes para Vercel
├── database/               # MongoDB config y seed data
├── src/                    # Frontend React + TanStack
├── public/                 # Assets estáticos
├── vercel.json            # Configuración Vercel
├── vite.config.ts         # Configuración Vite
├── package.json           # Dependencias
└── README.md              # Documentación
```

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/app-impreco.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --rebase
git push origin main
```

### Error de autenticación
```bash
# Actualizar URL del remote con token
git remote set-url origin https://TOKEN@github.com/TU_USUARIO/app-impreco.git
```
