import type { SVGProps } from "react";

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      {...props}
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m11 5-7 7 7 7M4 12h16" />
    </svg>
  );
}

export function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 8a2 2 0 0 1 2-2h1.2l.9-1.5A2 2 0 0 1 9.8 3.5h4.4a2 2 0 0 1 1.7 1L16.8 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function MapPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" {...props}>
      <path
        d="M19.6 10.23c0-.68-.06-1.32-.17-1.94H10v3.68h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.26Z"
        fill="#4285F4"
      />
      <path
        d="M10 20c2.7 0 4.96-.89 6.61-2.42l-3.23-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H1.07v2.59A10 10 0 0 0 10 20Z"
        fill="#34A853"
      />
      <path
        d="M4.41 11.93a5.98 5.98 0 0 1 0-3.86V5.48H1.07a10 10 0 0 0 0 9.04l3.34-2.59Z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.95.98 12.7 0 10 0A10 10 0 0 0 1.07 5.48l3.34 2.59C5.2 5.71 7.4 3.96 10 3.96Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M14.7 10.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.6 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.5 2.1 2.6 2 1-.1 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.3-.9-2.3-3.8Z" />
      <path d="M12.6 4.2c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2Z" />
    </svg>
  );
}

export function QrCodeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M2 2h6v6H2V2Zm1.5 1.5v3h3v-3h-3ZM2 12h6v6H2v-6Zm1.5 1.5v3h3v-3h-3ZM12 2h6v6h-6V2Zm1.5 1.5v3h3v-3h-3Z" />
      <path d="M12 12h2v2h-2zM16 12h2v2h-2zM12 16h2v2h-2zM16 16h2v2h-2zM14 14h2v2h-2z" />
    </svg>
  );
}

export function AndroidIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M6.3 3.9 5.1 2a.4.4 0 0 1 .7-.4l1.3 2a6.9 6.9 0 0 1 5.8 0l1.3-2a.4.4 0 0 1 .7.4l-1.2 1.9A6 6 0 0 1 16 9.2H4a6 6 0 0 1 2.3-5.3Zm.6 3.6a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2Zm6.2 0a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2Z" />
      <path d="M4 10.2h12v5.3c0 .6-.4 1-1 1h-.5v2a1 1 0 0 1-2 0v-2h-3v2a1 1 0 0 1-2 0v-2H7v2a1 1 0 0 1-2 0v-2h-.5c-.6 0-1-.4-1-1v-5.3ZM1.5 10c.6 0 1 .4 1 1v3.5a1 1 0 0 1-2 0V11c0-.6.4-1 1-1Zm17 0c.6 0 1 .4 1 1v3.5a1 1 0 0 1-2 0V11c0-.6.4-1 1-1Z" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      {...props}
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.9 10.6 21 3h-2.1l-6.2 6.6L7.8 3H2.6l7.4 10.4L2.6 21h2.1l6.6-7 5.3 7h5.2l-7.9-10.4Zm-2.3 2.5-.8-1.1L5 4.6h2.3l4.9 6.8.8 1.1 6.4 8.9h-2.3l-5.2-7.3Z" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 22v-8h2.7l.4-3.1H14V9c0-.9.2-1.5 1.5-1.5H17V4.7c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8.3V13h2.5v9H14Z" />
    </svg>
  );
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.9 8.6H3.6V20h3.3V8.6ZM5.3 3.5a1.9 1.9 0 1 0 0 3.9 1.9 1.9 0 0 0 0-3.9ZM20.4 20h-3.3v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V20H9.6V8.6h3.1v1.6h.1c.4-.8 1.5-1.7 3.2-1.7 3.4 0 4.4 2.3 4.4 5.2V20Z" />
    </svg>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function LogOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}>
      <rect width="32" height="32" rx="9" fill="#171412" />
      <path
        d="M10 14c0-2.8 2.7-5 6-5s6 2.2 6 5-2.7 5-6 5-6-2.2-6-5Z"
        fill="#FDBA3B"
      />
      <path
        d="M9 19.5c0-.6.5-1 1.1-1h11.8c.6 0 1.1.4 1.1 1 0 2-3.1 3.5-7 3.5s-7-1.5-7-3.5Z"
        fill="#fff"
      />
    </svg>
  );
}
