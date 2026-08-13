"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useGetCategoriesQuery } from "@/features/categories/categoriesApi";
import { useCreateProductMutation } from "@/features/products/productsApi";
import { ProductForm } from "@/components/vendor/ProductForm";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import type { ProductFormValues } from "@/features/products/schemas";

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";
  const { data: categories } = useGetCategoriesQuery(vendorId, { skip: !vendorId });
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [submitError, setSubmitError] = useState("");
  const toast = useToast();

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitError("");
    try {
      await createProduct({ vendorId, payload: values }).unwrap();
      toast.success(`${values.name} added to your menu.`);
      router.push("/vendor/products");
    } catch (err) {
      setSubmitError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/vendor/products"
        className="inline-flex items-center gap-1.5 text-small font-semibold text-text-muted transition-colors hover:text-primary"
      >
        <ArrowLeft size={15} aria-hidden /> Products
      </Link>
      <h1 className="mt-4 font-display text-h1 font-bold text-text">Add product</h1>

      <div className="mt-6">
        <ProductForm
          categories={categories?.map((c) => c.name) ?? []}
          submitLabel="Add product"
          isSubmitting={isLoading}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
