"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import {
  useGetWalletQuery,
  useGetWalletTransactionsQuery,
  useDepositWalletMutation,
  useGetCashbackSummaryQuery,
  useGetLoyaltyBalanceQuery,
  useGetFreeDeliveryProgressQuery,
} from "@/features/rewards/rewardsApi";
import { normalizeApiError } from "@/lib/utils/apiError";
import { computeLoyaltyPointsForDeposit, WALLET_QUICK_AMOUNTS } from "@/features/rewards/constants";
import { DiscountIcon, StarIcon, TruckIcon, CloseIcon, WalletIcon } from "@/components/icons";
import type { WalletTransactionType } from "@/features/rewards/types";

function formatNaira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

const TRANSACTION_LABELS: Record<WalletTransactionType, string> = {
  deposit: "Wallet top-up",
  order_payment: "Order payment",
  cashback_credit: "Cashback earned",
  refund: "Refund",
  loyalty_redemption: "Points redeemed",
};

function AddMoneyModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [amount, setAmount] = useState<number | null>(WALLET_QUICK_AMOUNTS[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deposit, { isLoading }] = useDepositWalletMutation();

  const resolvedAmount = customAmount ? Number(customAmount) : amount ?? 0;
  const pointsPreview = computeLoyaltyPointsForDeposit(resolvedAmount);

  const handleConfirm = async () => {
    if (!resolvedAmount || resolvedAmount <= 0) {
      setError("Enter an amount greater than ₦0.");
      return;
    }
    setError(null);
    try {
      await deposit({ userId, amount: resolvedAmount }).unwrap();
      onClose();
    } catch (err) {
      setError(normalizeApiError(err as never).message);
    }
  };

  return (
    <div className="rwd-modal-overlay" onClick={onClose}>
      <div className="rwd-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="rwd-modal__title">Add money to your Wallet</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <div className="rwd-amount-grid">
          {WALLET_QUICK_AMOUNTS.map((quick) => (
            <button
              key={quick}
              className={`rwd-amount-chip ${amount === quick && !customAmount ? "rwd-amount-chip--active" : ""}`}
              onClick={() => {
                setAmount(quick);
                setCustomAmount("");
              }}
            >
              {formatNaira(quick)}
            </button>
          ))}
        </div>

        <input
          className="rwd-input"
          type="number"
          min={1}
          placeholder="Or enter a custom amount"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setAmount(null);
          }}
        />

        {pointsPreview > 0 && (
          <p className="rwd-points-preview">You will earn +{pointsPreview} Loyalty Points</p>
        )}

        {error && <p className="rwd-modal__error">{error}</p>}

        <div className="rwd-modal__actions">
          <button className="rwd-btn rwd-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="rwd-btn rwd-btn--primary" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Adding…" : `Add ${resolvedAmount ? formatNaira(resolvedAmount) : "Money"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WalletView() {
  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isSessionLoading && !isAuthenticated) {
      router.replace("/login?redirect=/wallet");
    }
  }, [isSessionLoading, isAuthenticated, router]);

  const { data: wallet, isLoading: isLoadingWallet } = useGetWalletQuery(user?.id ?? "", { skip: !user });
  const { data: transactions = [], isLoading: isLoadingTransactions } = useGetWalletTransactionsQuery(user?.id ?? "", { skip: !user });
  const { data: cashback } = useGetCashbackSummaryQuery(user?.id ?? "", { skip: !user });
  const { data: loyalty } = useGetLoyaltyBalanceQuery(user?.id ?? "", { skip: !user });
  const { data: freeDelivery } = useGetFreeDeliveryProgressQuery(user?.id ?? "", { skip: !user });

  if (isSessionLoading || !isAuthenticated) {
    return (
      <main className="rwd-root">
        <p className="vp-empty">Loading…</p>
      </main>
    );
  }

  return (
    <main className="rwd-root">
      <header className="rwd-header">
        <h1 className="rwd-title">Wallet</h1>
        <p className="rwd-subtitle">Fund your wallet and pay for orders in one tap.</p>
      </header>

      <div className="rwd-balance-card">
        <p className="rwd-balance-card__label">Available Balance</p>
        <p className="rwd-balance-card__value">
          {isLoadingWallet ? "…" : formatNaira(Number(wallet?.balance ?? 0))}
        </p>
        <button className="rwd-balance-card__cta" onClick={() => setModalOpen(true)}>
          <WalletIcon width={14} height={14} />
          Add Money
        </button>
      </div>

      <div className="rwd-tiles">
        <Link href="/cashback" className="rwd-tile">
          <div className="rwd-tile__icon">
            <DiscountIcon width={16} height={16} />
          </div>
          <p className="rwd-tile__value">{formatNaira(cashback?.totalEarned ?? 0)}</p>
          <p className="rwd-tile__label">Cashback</p>
        </Link>
        <Link href="/loyalty-points" className="rwd-tile">
          <div className="rwd-tile__icon">
            <StarIcon width={16} height={16} />
          </div>
          <p className="rwd-tile__value">{loyalty?.balance ?? 0} pts</p>
          <p className="rwd-tile__label">Loyalty Points</p>
        </Link>
        <Link href="/free-deliveries" className="rwd-tile">
          <div className="rwd-tile__icon">
            <TruckIcon width={16} height={16} />
          </div>
          <p className="rwd-tile__value">{freeDelivery?.progress.creditsAvailable ?? 0} Available</p>
          <p className="rwd-tile__label">Free Deliveries</p>
        </Link>
      </div>

      <div className="rwd-section">
        <h2 className="rwd-section-title">Transactions</h2>
        {isLoadingTransactions ? (
          <p className="vp-empty">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="vp-empty">No transactions yet.</p>
        ) : (
          <div className="rwd-list">
            {transactions.map((t) => {
              const isCredit = Number(t.amount) >= 0;
              return (
                <div className="rwd-list-row" key={t.id}>
                  <div>
                    <p className="rwd-list-row__label">{t.reference || TRANSACTION_LABELS[t.type]}</p>
                    <p className="rwd-list-row__date">{formatDate(t.createdAt)}</p>
                  </div>
                  <p className={`rwd-list-row__amount rwd-list-row__amount--${isCredit ? "positive" : "negative"}`}>
                    {isCredit ? "+" : ""}
                    {formatNaira(Number(t.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && user && <AddMoneyModal userId={user.id} onClose={() => setModalOpen(false)} />}
    </main>
  );
}
