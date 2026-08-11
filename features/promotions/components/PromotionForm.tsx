"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { promotionSchema, type PromotionFormValues } from "../schemas";

interface PromotionFormProps {
  onSubmit: (values: PromotionFormValues) => void;
  isSubmitting: boolean;
  submitError?: string;
}

/** Shared create-promotion form — used by both vendor (vendor-scoped) and admin (platform-wide) promo pages. */
export function PromotionForm({ onSubmit, isSubmitting, submitError }: PromotionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: { discountType: "percentage" },
  });

  const handleFormSubmit = handleSubmit((values) => {
    onSubmit(values);
    reset({ discountType: "percentage" });
  });

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="code" className="mb-1.5 block text-small font-semibold text-text">
            Code
          </label>
          <input
            id="code"
            type="text"
            placeholder="SAVE20"
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small uppercase text-text outline-none transition-colors focus:border-primary"
            {...register("code")}
          />
          {errors.code && <p className="mt-1.5 text-caption font-semibold text-error">{errors.code.message}</p>}
        </div>
        <div>
          <label htmlFor="expiresAt" className="mb-1.5 block text-small font-semibold text-text">
            Expires
          </label>
          <input
            id="expiresAt"
            type="date"
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
            {...register("expiresAt")}
          />
          {errors.expiresAt && <p className="mt-1.5 text-caption font-semibold text-error">{errors.expiresAt.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-small font-semibold text-text">
          Description
        </label>
        <input
          id="description"
          type="text"
          placeholder="20% off orders this weekend"
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          {...register("description")}
        />
        {errors.description && <p className="mt-1.5 text-caption font-semibold text-error">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="discountType" className="mb-1.5 block text-small font-semibold text-text">
            Discount type
          </label>
          <select
            id="discountType"
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
            {...register("discountType")}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </div>
        <div>
          <label htmlFor="discountValue" className="mb-1.5 block text-small font-semibold text-text">
            Value
          </label>
          <input
            id="discountValue"
            type="number"
            min={1}
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
            {...register("discountValue", { valueAsNumber: true })}
          />
          {errors.discountValue && <p className="mt-1.5 text-caption font-semibold text-error">{errors.discountValue.message}</p>}
        </div>
        <div>
          <label htmlFor="minOrderAmount" className="mb-1.5 block text-small font-semibold text-text">
            Min. order (₦)
          </label>
          <input
            id="minOrderAmount"
            type="number"
            min={0}
            placeholder="Optional"
            className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
            {...register("minOrderAmount", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
        </div>
      </div>

      <div className="sm:w-1/3">
        <label htmlFor="usageLimit" className="mb-1.5 block text-small font-semibold text-text">
          Usage limit
        </label>
        <input
          id="usageLimit"
          type="number"
          min={1}
          placeholder="Optional — unlimited if blank"
          className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-small text-text outline-none transition-colors focus:border-primary"
          {...register("usageLimit", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
        />
      </div>

      {submitError && <p className="text-small font-semibold text-error">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-primary px-6 py-2.5 text-small font-semibold text-white transition-transform duration-fast hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating…" : "Create promotion"}
      </button>
    </form>
  );
}
