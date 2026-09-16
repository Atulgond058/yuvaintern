import "./Button.css";

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
