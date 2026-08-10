"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, PRODUCT_IMAGE_OPTIONS, type ProductFormValues } from "@/features/products/schemas";
import { cn } from "@/lib/utils/cn";

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  categories: string[];
  submitLabel: string;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (values: ProductFormValues) => void;
}

const DEFAULTS: ProductFormValues = {
  name: "",
  description: "",
  price: 0,
  image: PRODUCT_IMAGE_OPTIONS[0],
  category: "",
  available: true,
  popular: false,
  spicy: false,
  vegetarian: false,
};

export function ProductForm({ initialValues, categories, submitLabel, isSubmitting, submitError, onSubmit }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...DEFAULTS, ...initialValues },
  });

  const selectedImage = watch("image");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div>
        <label className="mb-2 block text-small font-semibold text-text">Photo</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {PRODUCT_IMAGE_OPTIONS.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setValue("image", src, { shouldValidate: true })}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border-2 transition-colors",
                selectedImage === src ? "border-primary" : "border-transparent hover:border-border-strong"
              )}
              aria-label="Choose photo"
              aria-pressed={selectedImage === src}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
        {errors.image && <p className="mt-1.5 text-caption font-semibold text-error">{errors.image.message}</p>}
      </div>

      <div>
        <label htmlFor="name" className="mb-1.5 block text-small font-semibold text-text">
          Name
        </label>
        <input
          id="name"
          type="text"
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          placeholder="Jollof Rice + Chicken"
          {...register("name")}
        />
        {errors.name && <p className="mt-1.5 text-caption font-semibold text-error">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-small font-semibold text-text">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          placeholder="Smoky party jollof with golden fried chicken, coleslaw & fried plantain"
          {...register("description")}
        />
        {errors.description && <p className="mt-1.5 text-caption font-semibold text-error">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="mb-1.5 block text-small font-semibold text-text">
            Price (₦)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && <p className="mt-1.5 text-caption font-semibold text-error">{errors.price.message}</p>}
        </div>

        <div>
          <label htmlFor="category" className="mb-1.5 block text-small font-semibold text-text">
            Category
          </label>
          <select
            id="category"
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
            {...register("category")}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1.5 text-caption font-semibold text-error">{errors.category.message}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-small font-medium text-text">
          <input type="checkbox" className="h-4 w-4 accent-[var(--crimson)]" {...register("available")} />
          Available
        </label>
        <label className="flex items-center gap-2 text-small font-medium text-text">
          <input type="checkbox" className="h-4 w-4 accent-[var(--crimson)]" {...register("popular")} />
          Popular
        </label>
        <label className="flex items-center gap-2 text-small font-medium text-text">
          <input type="checkbox" className="h-4 w-4 accent-[var(--crimson)]" {...register("spicy")} />
          Spicy
        </label>
        <label className="flex items-center gap-2 text-small font-medium text-text">
          <input type="checkbox" className="h-4 w-4 accent-[var(--crimson)]" {...register("vegetarian")} />
          Vegetarian
        </label>
      </div>

      {submitError && <p className="text-small font-semibold text-error">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary px-6 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
