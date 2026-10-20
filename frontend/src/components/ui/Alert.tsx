import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface Props {
  variant?: "success" | "error" | "info";
  children: React.ReactNode;
}

export const Alert = ({ variant = "info", children }: Props) => {
  const Icon =
    variant === "success"
      ? CheckCircle2
      : variant === "error"
        ? AlertCircle
        : Info;
  return (
    <div className={`alert alert--${variant}`}>
      <span className="alert__icon">
        <Icon size={18} />
      </span>
      <span>{children}</span>
    </div>
  );
};
