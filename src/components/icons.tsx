import type { SVGProps } from 'react';

export function ShopStockLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7.5 7.5h9v9h-9z" fill="currentColor" opacity="0.4" />
      <path d="M21 15V9a2 2 0 0 0-2-2h-6" />
      <path d="M3 9v6a2 2 0 0 0 2 2h6" />
    </svg>
  );
}
