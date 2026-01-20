import type { SVGProps } from "react";

export function FormFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="bg-primary rounded-md p-1.5 flex items-center justify-center">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          fill="hsl(var(--primary-foreground))"
        />
      </svg>
    </div>
  );
}
