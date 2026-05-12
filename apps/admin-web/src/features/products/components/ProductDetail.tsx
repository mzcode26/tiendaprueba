import type { Product, ProductVariant } from '../types/product.types';

interface ProductDetailProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onEditProduct: (product: Product) => void;
  onAddVariant: (product: Product) => void;
  onEditVariant: (
    product: Product,
    variant: ProductVariant,
  ) => void;
}

export function ProductDetail({
  open,
  product,
  onClose,
  onEditProduct,
  onAddVariant,
  onEditVariant,
}: ProductDetailProps) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b p-6">
          <div>
            <h2 className="text-2xl font-semibold">
              {product.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {product.slug}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-sm text-gray-500"
          >
            Cerrar
          </button>
        </div>

        {/* Content */}
        <div className="grid gap-6 p-6 md:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 md:col-span-2">
            {/* Description */}
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Descripción
              </h3>

              <div className="rounded-xl border p-4 text-sm">
                {product.description || 'Sin descripción'}
              </div>
            </section>

            {/* Variants */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Variantes
                </h3>

                <button
                  onClick={() => onAddVariant(product)}
                  className="rounded-lg border px-3 py-1 text-xs"
                >
                  Agregar variante
                </button>
              </div>

              {!product.variants?.length ? (
                <div className="rounded-xl border p-4 text-sm text-gray-500">
                  Este producto todavía no tiene variantes.
                </div>
              ) : (
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="rounded-xl border p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            SKU: {variant.sku}
                          </div>

                          {variant.barcode ? (
                            <div className="text-sm text-gray-500">
                              Barcode: {variant.barcode}
                            </div>
                          ) : null}

                          <div className="text-sm text-gray-500">
                            Estado:{' '}
                            {variant.isActive
                              ? 'Activo'
                              : 'Inactivo'}
                          </div>
                        </div>

                        <div className="space-y-1 text-right">
                          <div className="text-lg font-semibold">
                            ${variant.price}
                          </div>

                          {variant.compareAtPrice ? (
                            <div className="text-sm text-gray-400 line-through">
                              ${variant.compareAtPrice}
                            </div>
                          ) : null}

                          {variant.costPrice ? (
                            <div className="text-xs text-gray-500">
                              Costo: ${variant.costPrice}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Attributes */}
                      {variant.attributes?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {variant.attributes.map((attribute, index) => (
                            <div
                              key={`${attribute.attributeId}-${index}`}
                              className="rounded-full bg-gray-100 px-3 py-1 text-xs"
                            >
                              {attribute.attributeId}:{' '}
                              {attribute.attributeValueId}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() =>
                            onEditVariant(product, variant)
                          }
                          className="rounded-lg border px-3 py-1 text-xs"
                        >
                          Editar variante
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <section className="rounded-xl border p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Información
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500">
                    Categoría
                  </div>
                  <div>
                    {product.category?.name ?? '-'}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">
                    Marca
                  </div>
                  <div>
                    {product.brand?.name ?? '-'}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">
                    Estado
                  </div>
                  <div>
                    {product.isActive
                      ? 'Activo'
                      : 'Inactivo'}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Tags
              </h3>

              {!product.tags?.length ? (
                <div className="text-sm text-gray-500">
                  Sin tags
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <button
              onClick={() => onEditProduct(product)}
              className="w-full rounded-xl bg-black px-4 py-2 text-sm text-white"
            >
              Editar producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}