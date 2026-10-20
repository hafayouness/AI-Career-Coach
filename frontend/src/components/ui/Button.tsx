import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "ai" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  full?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = "primary",
  loading = false,
  full = false,
  children,
  className = "",
  disabled,
  ...rest
}: Props) => (
  <button
    className={`btn btn--${variant} ${full ? "btn--full" : ""} ${className}`}
    disabled={loading || disabled}
    {...rest}
  >
    {loading ? <Spinner /> : children}
  </button>
);
