export function Avatar({ name = "", size = "md", color = "blue" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const cls = `avatar ${size === "lg" ? "lg" : size === "xl" ? "xl" : ""} ${color}`;
  return <div className={cls}>{initials}</div>;
}

export function Badge({ children, type = "gray" }) {
  return <span className={`badge ${type}`}>{children}</span>;
}

export function Btn({ children, variant = "primary", size, onClick, type = "button", disabled, style }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${size === "sm" ? "btn-sm" : ""}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

export function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export const MAJORS = [
  "Software Engineering",
  "Mechanical Engineering",
  "Mechatronics Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Computer Science",
  "Chemical Engineering",
  "Biomedical Engineering",
];

export const avatarColor = (name = "") => {
  const colors = ["blue", "green", "amber"];
  return colors[name.charCodeAt(0) % colors.length];
};
