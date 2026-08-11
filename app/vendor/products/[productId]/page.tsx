"use client";

import { useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { useAuth } from "@/features/auth/hooks";
import { useGetVendorDetailQuery } from "@/features/vendors/vendorsApi";
import { useGetVendorProductsQuery, useUpdateProductMutation } from "@/features/products/productsApi";
import { ProductForm } from "@/components/vendor/ProductForm";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useToast } from "@/components/feedback/ToastProvider";
import { normalizeApiError } from "@/lib/utils/apiError";
import type { ProductFormValues } from "@/features/products/schemas";

export default function EditProductPage() {
  const params = useParams<{ productId: string }>();
  const productId = Number(params.productId);
  const router = useRouter();
  const { user } = useAuth();
  const vendorId = user?.vendorId ?? "";

  const { data: vendorDetail } = useGetVendorDetailQuery(vendorId, { skip: !vendorId });
  const { data: products, isLoading, error, refetch } = useGetVendorProductsQuery(vendorId, { skip: !vendorId });
  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();
  const [submitError, setSubmitError] = useState("");
  const toast = useToast();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="h-6 w-32 animate-pulse rounded bg-black/5" />
        <div className="mt-4 h-96 animate-pulse rounded-lg bg-black/5" />
      </div>
    );
  }

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const product = products?.find((p) => p.id === productId);
  if (!product) notFound();

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitError("");
    try {
      await updateProduct({ vendorId, id: productId, patch: values }).unwrap();
      toast.success("Product updated.");
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
      <h1 className="mt-4 font-display text-h1 font-bold text-text">Edit product</h1>

      <div className="mt-6">
        <ProductForm
          initialValues={{
            ...product,
            popular: !!product.popular,
            spicy: !!product.spicy,
            vegetarian: !!product.vegetarian,
          }}
          categories={vendorDetail?.restaurant.categories ?? []}
          submitLabel="Save changes"
          isSubmitting={isSaving}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
