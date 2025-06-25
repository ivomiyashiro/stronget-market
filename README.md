# Stronget Market

Un monorepo que contiene un frontend de React y un backend de Node Express.

## Estructura del Proyecto

```
stronget-market/
├── packages/
│   ├── frontend/     # Aplicación React
│   └── backend/      # Servidor API Express
```

## Comenzar

### Requisitos Previos

-   Node.js (v22 o superior)
-   npm (v8 o superior)

### Instalación

```bash
npm install
```

### Desarrollo

Ejecutar tanto el frontend como el backend en modo desarrollo:

```bash
npm run dev
```

O ejecutarlos por separado:

```bash
npm run dev:frontend
npm run dev:backend
```

### Configuración de la Base de Datos

Poblar la base de datos con datos de ejemplo:

```bash
npm run seed
```

Esto poblará tu base de datos con:

-   20 usuarios (entrenadores y clientes)
-   30 servicios
-   50 contrataciones
-   40 reseñas
-   25 archivos

### Producción

Construir ambos paquetes:

```bash
npm run build
```

Iniciar en modo producción:

```bash
npm start
```
