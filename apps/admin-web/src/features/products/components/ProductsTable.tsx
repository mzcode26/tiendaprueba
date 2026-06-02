import type { Product, ProductVariant } from '../types/product.types';

interface ProductsTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddVariant: (product: Product) => void;
  onEditVariant: (product: Product, variant: ProductVariant) => void;
  onViewDetail: (product: Product) => void;
}

export function ProductsTable({
  products,
  onEditProduct,
  onDeleteProduct,
  onAddVariant,
  onEditVariant,
  onViewDetail,
}: ProductsTableProps) {
  if (!products.length) {
    return (
      <div className="p-6 text-sm text-gray-500">
        No hay productos cargados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left">
        <thead className="border-b bg-gray-50 text-gray-800 text-xs md:text-sm">
        <tr>
          <th className="px-2 sm:px-4 py-2 sm:py-3">Nombre</th>
          <th className="px-2 sm:px-4 py-2 sm:py-3">Categoría</th>
          <th className="px-2 sm:px-4 py-2 sm:py-3">Marca</th>
          <th className="px-2 sm:px-4 py-2 sm:py-3">Estado</th>
          <th className="px-2 sm:px-4 py-2 sm:py-3">Variantes</th>
          <th className="px-2 sm:px-4 py-2 sm:py-3">Acciones</th>
        </tr>
      </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b text-xs md:text-sm text-gray-700 hover:bg-gray-50">
            <td className="px-2 sm:px-4 py-2 sm:py-3">
              <div className="font-medium">{product.name}</div>
              <div className="text-xs hidden md:block">{product.slug}</div>
            </td>

            <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-800">
              {product.category?.name ?? '-'}
            </td>

            <td className="px-2 sm:px-4 py-2 sm:py-3">
              {product.brand?.name ?? '-'}
            </td>

            <td className="px-2 sm:px-4 py-2 sm:py-3">
              {product.isActive ? 'Activo' : 'Inactivo'}
            </td>

            <td className="px-2 sm:px-4 py-2 sm:py-3">
              {product.variants?.length ?? 0}
            </td>

            <td className="px-2 sm:px-4 py-2 sm:py-3">
              <div className="flex flex-col sm:flex-row flex-wrap gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => onViewDetail(product)}
                  className="rounded px-2 py-1 sm:px-3 sm:py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 whitespace-nowrap"
                >
                  Ver
                </button>

                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="rounded px-2 py-1 sm:px-3 sm:py-1.5 text-xs bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => onAddVariant(product)}
                  className="rounded px-2 py-1 sm:px-3 sm:py-1.5 text-xs bg-green-50 text-green-600 hover:bg-green-100 hidden sm:block whitespace-nowrap"
                >
                  Var
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteProduct(product.id)}
                  className="rounded px-2 py-1 sm:px-3 sm:py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 whitespace-nowrap"
                >
                  Borr
                </button>
              </div>

              {product.variants?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => onEditVariant(product, variant)}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs"
                    >
                      {variant.sku}
                    </button>
                  ))}
                </div>
              ) : null}
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}