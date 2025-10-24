import { useState, useEffect } from 'react';
import ProductsService from '../services/product_sevices';
import './Products.css';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [format, setFormat] = useState('application/json');
  const [limit, setLimit] = useState(12);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('name:asc');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [rawData, setRawData] = useState('');


  useEffect(() => {
    cargarProductos();
  }, [format, limit, page]);

  const cargarProductos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ProductsService.getProducts({
        accept: format,
        page,
        limit
      });
      console.log('[debug] products response:', response);
      // Normalizar respuesta JSON
      if (format === 'application/json') {
        let items = [];
        let total = 0;

        if (Array.isArray(response)) {
          items = response;
          total = response.length;
        } else if (response && Array.isArray(response.data)) {
          items = response.data;
          total = response.total || response.count || response.data.length;
        } else if (response && Array.isArray(response.items)) {
          items = response.items;
          total = response.total || response.count || response.items.length;
        } else if (response && response.data && Array.isArray(response.data.data)) {
          // algunos backends anidan: { data: { data: [...] } }
          items = response.data.data;
          total = response.data.total || items.length;
        } else {
          // respuesta inesperada: intentar extraer cualquier array
          const possibleArray = Object.values(response || {}).find(v => Array.isArray(v));
          items = possibleArray || [];
          total = items.length;
        }

        setProducts(items);
        let computedTotal = Number(total) || items.length;
        // Si el backend no devuelve un total real (igual al page size), intentar obtener el total real
        if ((!response || (!response.total && !response.count)) && computedTotal <= items.length) {
          try {
            console.log('[pagination] intentando obtener total completo (fallback)');
            const fullResp = await ProductsService.getProducts({ accept: format, page: 1, limit: 1000000 });
            console.log('[debug] fullResp from fallback:', fullResp);
            if (Array.isArray(fullResp)) {
              computedTotal = fullResp.length;
            } else if (fullResp && Array.isArray(fullResp.data)) {
              computedTotal = fullResp.total || fullResp.count || fullResp.data.length;
            } else if (fullResp && Array.isArray(fullResp.items)) {
              computedTotal = fullResp.total || fullResp.count || fullResp.items.length;
            } else {
              const possibleArray = Object.values(fullResp || {}).find(v => Array.isArray(v));
              computedTotal = possibleArray ? possibleArray.length : computedTotal;
            }
          } catch (e) {
            console.warn('[pagination] fallback failed to fetch full list', e);
          }
        }

        setTotalItems(computedTotal);
        setTotalPages(Math.max(1, Math.ceil(computedTotal / limit)));
      } else {
        // Manejo de respuesta XML -> parsear y extraer nodos <product>
       // Manejo de respuesta XML -> parsear y extraer nodos <product> o similares
// Manejo de respuesta XML -> parsear y extraer nodos <data>
// Manejo de respuesta XML -> parsear y extraer todos los <data>, aunque no haya root
try {
  let xmlString = response.trim();

  // Si el XML no tiene un solo elemento raíz, lo envolvemos en uno temporal
  if (!xmlString.startsWith('<root>')) {
    xmlString = `<root>${xmlString}</root>`;
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // Buscar los nodos <data>
  const productNodes = xmlDoc.getElementsByTagName('data');
  console.log('[XML] Nodos <data> encontrados:', productNodes.length);

  const productsArray = Array.from(productNodes).map((node) => ({
    id: node.getElementsByTagName('id')[0]?.textContent?.trim() || '',
    name: node.getElementsByTagName('name')[0]?.textContent?.trim() || '',
    sku: node.getElementsByTagName('sku')[0]?.textContent?.trim() || '',
    price: parseFloat(node.getElementsByTagName('price')[0]?.textContent) || 0,
    stock: node.getElementsByTagName('stock')[0]?.textContent?.trim() || '',
    category: node.getElementsByTagName('category')[0]?.textContent?.trim() || '',
    created_at: node.getElementsByTagName('created_at')[0]?.textContent?.trim() || '',
    updated_at: node.getElementsByTagName('updated_at')[0]?.textContent?.trim() || '',
    _rawXml: node.outerHTML,
  }));

  // Extraer info de paginación si existe
  const paginationNode = xmlDoc.getElementsByTagName('pagination')[0];
  let totalItemsXml = productsArray.length;
  let totalPagesXml = 1;
  if (paginationNode) {
    totalItemsXml =
      parseInt(paginationNode.getElementsByTagName('total')[0]?.textContent) ||
      productsArray.length;
    totalPagesXml =
      parseInt(paginationNode.getElementsByTagName('totalPages')[0]?.textContent) ||
      1;
  }

  setProducts(productsArray);
  setTotalItems(totalItemsXml);
  setTotalPages(Math.max(1, totalPagesXml));
} catch (xmlError) {
  console.error('Error parsing XML:', xmlError);
  setProducts([]);
  setTotalItems(0);
  setTotalPages(1);
}



      }
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los productos.');
      setLoading(false);
    }
  };

  const goToPage = (newPage) => {
    const p = Number(newPage);
    console.log('[pagination] goToPage called', { newPage: p, page, totalPages });
    if (p < 1 || p > totalPages) {
      console.log('[pagination] page out of range, ignoring');
      return;
    }
    setPage(p);
  };

const handleCardClick = async (product) => {
  try {
    const detail = await ProductsService.getProductById(product.id, format);

    if (format === 'application/json') {
      const productData = detail.data?.data || detail.data || {};
      setSelectedProduct(productData);
      setRawData(JSON.stringify(detail, null, 2));
    } else {
      // === MODO XML ===
      try {
        let xmlString = detail.trim();
        if (!xmlString.startsWith('<root>')) {
          xmlString = `<root>${xmlString}</root>`;
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        // Buscar el nodo <data> del producto
        const node = xmlDoc.getElementsByTagName('data')[0];
        if (!node) {
          console.warn('[XML Detail] No se encontró nodo <data>');
          setSelectedProduct(null);
          setRawData(detail);
          return;
        }

        const productData = {
          id: node.getElementsByTagName('id')[0]?.textContent?.trim() || '',
          name: node.getElementsByTagName('name')[0]?.textContent?.trim() || '',
          sku: node.getElementsByTagName('sku')[0]?.textContent?.trim() || '',
          price: parseFloat(node.getElementsByTagName('price')[0]?.textContent) || 0,
          stock: node.getElementsByTagName('stock')[0]?.textContent?.trim() || '',
          category: node.getElementsByTagName('category')[0]?.textContent?.trim() || '',
          description: node.getElementsByTagName('description')[0]?.textContent?.trim() || '',
          created_at: node.getElementsByTagName('created_at')[0]?.textContent?.trim() || '',
          updated_at: node.getElementsByTagName('updated_at')[0]?.textContent?.trim() || ''
        };

        setSelectedProduct(productData);
        setRawData(detail); // guardar XML crudo para el toggle "RAW"
      } catch (xmlError) {
        console.error('Error parsing XML detail:', xmlError);
        setSelectedProduct(null);
        setRawData(detail);
      }
    }
  } catch (err) {
    console.error('Error al cargar detalle:', err);
    setError('Error al cargar el detalle del producto');
  }
};


  const sortProducts = (list) => {
    return [...list].sort((a, b) => {
      if (sort === 'name:asc') return (a.name || '').localeCompare(b.name || '');
      if (sort === 'name:desc') return (b.name || '').localeCompare(a.name || '');
      if (sort === 'price:asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sort === 'price:desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
      return 0;
    });
  };

  const sortedList = sortProducts(products);
  // Paginar en cliente: items que se mostrarán en la página actual
  const displayedProducts = sortProducts(products);
  const handleCloseModal = () => {
    setSelectedProduct(null);
    setShowRaw(false);
  };

  if (loading) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-container">
      <div className="format-selector">
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="application/json">JSON</option>
          <option value="application/xml">XML</option>
        </select>

        <select
          value={limit}
          onChange={(e) => {
            setLimit(parseInt(e.target.value));
            setPage(1);
          }}
        >
          <option value={6}>6 por página</option>
          <option value={12}>12 por página</option>
          <option value={24}>24 por página</option>
          <option value={48}>48 por página</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name:asc">Nombre (A-Z)</option>
          <option value="name:desc">Nombre (Z-A)</option>
          <option value="price:asc">Precio (menor a mayor)</option>
          <option value="price:desc">Precio (mayor a menor)</option>
        </select>
      </div>

      <div className="products-grid">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => handleCardClick(product)}
            >
              <h3>{product.name}</h3>
              <p>SKU: {product.sku}</p>
              <p className="price">${product.price}</p>
            </div>
          ))
        ) : (
          <div className="empty">
            No hay productos para mostrar en esta página.
            <div className="empty-sub">
              Prueba cambiar página, tamaño o formato.
            </div>
          </div>
        )}
      </div>

      {/* Paginación (siempre visible; botones deshabilitados si no aplican) */}
      <div className="pagination">
        <button onClick={() => { console.log('[pagination] click prev', { page, totalPages }); goToPage(page - 1); }} disabled={page <= 1 || totalPages <= 1}>
          Anterior
        </button>

        <span className="page-info">
          Página {page} de {totalPages} • {totalItems} items
        </span>

        <button onClick={() => { console.log('[pagination] click next', { page, totalPages }); goToPage(page + 1); }} disabled={page >= totalPages || totalPages <= 1}>
          Siguiente
        </button>
      </div>

      {selectedProduct && (
        <div className="modal">
          <div className="modal-content">
            <div className="actions">
              <button onClick={() => setShowRaw(!showRaw)}>
                {showRaw ? 'Vista amigable' : 'Ver RAW'}
              </button>
              <button onClick={handleCloseModal}>Cerrar</button>
            </div>

            {!showRaw ? (
              <div className="product-detail">
                <div>
                  <h2>{selectedProduct.name}</h2>
                  <p><b>SKU:</b> {selectedProduct.sku}</p>
                  {selectedProduct.description && (
                    <p><b>Descripción:</b> {selectedProduct.description}</p>
                  )}
                  <p><b>Categoría:</b> {selectedProduct.category}</p>
                  <p><b>Precio:</b> ${selectedProduct.price}</p>
                  {selectedProduct.stock && (
                    <p><b>Stock:</b> {selectedProduct.stock}</p>
                  )}
                  {selectedProduct.created_at && (
                    <p><b>Creado:</b> {selectedProduct.created_at}</p>
                  )}
                  {selectedProduct.updated_at && (
                    <p><b>Actualizado:</b> {selectedProduct.updated_at}</p>
                  )}
                </div>
              </div>
            ) : (
              <pre>{rawData}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
