import type { SVGProps } from "react";

export function FormFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1.2em"
      height="1.2em"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        d="M128 200h80a8 8 0 0 0 8-8V88m-64-64v64h64"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        d="M144 24H48a8 8 0 0 0-8 8v160a8 8 0 0 0 8 8h80"
      />
      <path
        d="M124 120a12 12 0 1 1-12-12 12 12 0 0 1 12 12m-32 40h48"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </svg>
  );
}
