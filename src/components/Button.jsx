import "./Button.css";

/**
 * Button — shared action control.
 * variant: "primary" | "secondary" | "ghost" | "danger"
 * as: allows rendering as <a> via the `href` prop passthrough when needed.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon = null,
  full = false,
  as: Component = "button",
  className = "",
  ...rest
}) {
  return (
    <Component
      className={`btn btn--${variant} btn--${size} ${full ? "btn--full" : ""} ${className}`}
      {...rest}
    >
      {icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </Component>
  );
}
