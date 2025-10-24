
# Catálogo de Productos — React + Fetch API

Este proyecto es una aplicación web desarrollada en React que muestra un catálogo de productos obtenido desde una API REST local.  
Permite visualizar los productos en formato JSON o XML, con paginación, ordenamiento, vista detallada (modal) y compatibilidad con diferentes formatos de respuesta del servidor.

---

## Características principales

- Consumo de API REST con soporte para encabezado `Accept: application/json` o `application/xml`.
- Visualización de productos en tarjetas con nombre, SKU y precio.
- Paginación dinámica (controlada por servidor).
- Ordenamiento por nombre o precio.
- Selector de formato (JSON/XML) para probar diferentes respuestas del backend.
- Vista detallada en modal, incluyendo:
  - Información completa del producto.
  - Botón para alternar entre vista amigable y RAW (cruda).
- Manejo de errores y estados de carga.

---

## Tecnologías utilizadas

- React 18+
- Fetch API nativa
- JavaScript ES6+
- CSS3 con diseño adaptable
- Vite (para desarrollo rápido)
- API backend local (`http://localhost:3000/products`)

---

## Estructura del proyecto

```

src/
├── components/
│    └── Products.jsx       # Componente principal del catálogo
├── services/
│    └── productsService.js # Lógica para consumir la API (fetch)
├── styles/
│    └── Products.css       # Estilos del catálogo
├── App.jsx                 # Punto de entrada principal
├── main.jsx                # Renderizado de la app

````

---

## Configuración y ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/tuusuario/catalogo-productos-react.git
cd catalogo-productos-react
````

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar la aplicación

```bash
npm run dev
```

Por defecto se abrirá en `http://localhost:5173`.

---

## API Backend

El proyecto consume datos desde:

```
http://localhost:3000/products
```

### Endpoints:

* `GET /products?page=1&limit=12`
  Devuelve una lista paginada de productos en JSON o XML según el encabezado `Accept`.

* `GET /products/:id`
  Devuelve el detalle de un producto.

### Ejemplo de respuesta JSON:

```json
{
  "data": [
    {
      "id": "f8ce68ed-f7cb-44b3-afc4-8a0b6b10a6ca",
      "name": "Monitor LED 24\"",
      "sku": "MON-24-LED-001",
      "price": 199.99,
      "category": "Electronics",
      "stock": 15
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 54,
    "totalPages": 5
  }
}
```

### Ejemplo de respuesta XML:

```xml
<data>
  <id>f8ce68ed-f7cb-44b3-afc4-8a0b6b10a6ca</id>
  <name>Monitor LED 24"</name>
  <sku>MON-24-LED-001</sku>
  <price>199.99</price>
  <stock>15</stock>
  <category>Electronics</category>
</data>
<data>
  ...
</data>
<pagination>
  <page>1</page>
  <limit>12</limit>
  <total>54</total>
  <totalPages>5</totalPages>
</pagination>
```

---

## Lógica de funcionamiento

1. **Carga inicial:**
   El componente `Products.jsx` llama a `ProductsService.getProducts()` con el formato seleccionado.

2. **Normalización de respuesta:**

   * Si la respuesta es JSON → se asigna directamente al estado.
   * Si la respuesta es XML → se convierte en DOM y se extraen nodos `<data>`.

3. **Paginación:**

   * Los botones “Anterior” y “Siguiente” cambian el valor de `page`.
   * La API devuelve solo los productos de la página solicitada.

4. **Modal de detalle:**

   * Al hacer clic en una tarjeta, se llama a `getProductById()`.
   * Si es JSON → se muestra el objeto.
   * Si es XML → se parsea el `<data>` y se extraen los campos.
   * Se puede alternar entre vista amigable y vista RAW.

---

## Interfaz

* Diseño minimalista con tarjetas limpias y colores suaves.
* Adaptable a pantallas medianas y grandes.
* Modal centrado con detalles del producto.
* Botones y menús desplegables intuitivos para formato, límite y orden.

---

## Autenticación API

El servicio usa una API key incluida en los headers:

```js
'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

Reemplaza la clave con tu propia API Key si usas otro backend.

---

## Posibles mejoras futuras

* Búsqueda de productos por nombre o SKU.
* Filtros por categoría.
* Soporte para crear, editar y eliminar productos.
* Internacionalización (i18n).
* Persistencia de formato y página seleccionados en `localStorage`.

---

## Autor

Desarrollado por: Estefani Valverde
Tecnologías: React + Fetch API + XML/JSON Parsing
Versión: 1.0.0
Licencia: MIT

---

Este proyecto es ideal para prácticas de consumo de APIs con diferentes formatos de respuesta y manejo de datos dinámicos en React.

```


