/** Shared by cart/checkout/order-detail — grocery items (shops/markets) can be priced "each" or "per kg". */
export type QtyUnitType = "each" | "weight";

interface QuantityLike {
  qty: number;
  unitType?: QtyUnitType;
  weightUnit?: "g" | "kg";
}

/** "x3" for each-priced items (the restaurant-menu default), "2.5kg" for weight-priced produce/meat/fish. */
export function formatCartQty({ qty, unitType, weightUnit }: QuantityLike): string {
  if (unitType === "weight") {
    return `${qty}${weightUnit ?? "kg"}`;
  }
  return `x${qty}`;
}

/** Stepper increment — weight-sold items step by 0.5kg, everything else steps by a whole unit. */
export function qtyStep(unitType?: QtyUnitType): number {
  return unitType === "weight" ? 0.5 : 1;
}
