import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { variantSchema, type VariantFormData } from '../schemas/product.schema';
import type { ProductVariant } from '../types/product.types';

interface Props {
  variant?: ProductVariant;
  onSubmit: (data: VariantFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VariantForm({ variant, onSubmit, onCancel, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: variant
      ? {
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          isActive: variant.isActive,
        }
      : { isActive: true },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 p-4 border rounded-lg bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">SKU *</label>
          <input
            {...register('sku')}
            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Precio *</label>
          <input
            {...register('price')}
            type="number"
            step="0.01"
            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Talle</label>
          <input
            {...register('size')}
            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
          <input
            {...register('color')}
            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Precio comparativo</label>
          <input
            {...register('compareAtPrice')}
            type="number"
            step="0.01"
            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input {...register('isActive')} type="checkbox" className="rounded border-gray-300" />
            Activa
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar variante'}
        </button>
      </div>
    </form>
  );
}