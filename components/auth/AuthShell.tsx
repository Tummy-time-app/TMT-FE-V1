import Image from "next/image";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="bg-neutral-900 px-6 py-5 sm:px-10">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/tummytime-logo.png"
            alt="TummyTime"
            width={331}
            height={93}
            className="h-7 w-auto sm:h-8"
          />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        {children}
      </main>
    </div>
  );
}
