import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
}

export const Input = ({
  label,
  icon,
  hint,
  error,
  id,
  type = "text",
  className = "",
  ...rest
}: Props) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword && show ? "text" : type;

  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="input-wrap">
        {icon && <span className="input-wrap__icon">{icon}</span>}
        <input
          id={id}
          type={actualType}
          className={`input ${isPassword ? "input--with-toggle" : ""} ${
            error ? "input--error" : ""
          } ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="input-wrap__toggle"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Masquer" : "Afficher"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error ? (
        <span className="field__hint" style={{ color: "var(--danger)" }}>
          {error}
        </span>
      ) : hint ? (
        <span className="field__hint">{hint}</span>
      ) : null}
    </div>
  );
};
