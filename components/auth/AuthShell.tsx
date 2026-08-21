import Image from "next/image";

/**
 * Ported from the `frontend` branch's app/(auth)/{login,register,verify}/
 * page.tsx — the full-bleed maroon-to-gold gradient behind a centered white
 * card, logo at the top (see app/auth.css). Structure/markup/CSS classes
 * kept faithful to the source; two deliberate departures:
 *
 * 1. The logo lives here once (all three source pages repeated the same
 *    <Image>) rather than in every child.
 * 2. `/tummytime-logo.png` (this repo's actual asset) is used in place of
 *    the source's `/images/logo/tummytime-logo.png`, which doesn't exist
 *    here — see components/nav/Navigation.tsx, which already uses the same
 *    real path.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-root">
      <div className="auth-bg" aria-hidden />
      <div className="auth-card">
        <Image
          src="/tummytime-logo.png"
          alt="TummyTime"
          width={180}
          height={50}
          priority
          className="auth-logo-img"
        />
        {children}
      </div>
    </div>
  );
}
