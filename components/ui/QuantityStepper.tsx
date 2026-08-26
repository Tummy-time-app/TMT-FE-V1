import "./QuantityStepper.css";

/** The −/qty/+ control duplicated (with slightly different markup each time) in the item-detail modal and the cart drawer — one implementation now. */
export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  min = 1,
  size = "md",
}: {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  size?: "sm" | "md";
}) {
  return (
    <div className={`tmt-stepper tmt-stepper--${size}`}>
      <button
        type="button"
        className="tmt-stepper__btn"
        onClick={onDecrease}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="tmt-stepper__value">{value}</span>
      <button
        type="button"
        className="tmt-stepper__btn tmt-stepper__btn--plus"
        onClick={onIncrease}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
