/** Brand icons for Connect link cards (Simple Icons–style paths). */
const ICONS = {
  youtube: {
    label: "YouTube",
    className: "text-[#FF0000]",
    path: (
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    ),
  },
  instagram: {
    label: "Instagram",
    className: "text-[#E4405F]",
    path: (
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    ),
  },
  venmo: {
    label: "Venmo",
    imageSrc: "/img/Venmo_Icon.png",
  },
  email: {
    label: "Email",
    className: "text-horizon",
    path: (
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 18V8.99l7.29 6.36a1 1 0 0 0 1.42 0L20 8.99V18H4z" />
    ),
  },
};

function resolveIconKey(icon, label) {
  const fromIcon = (icon || "").toLowerCase();
  if (ICONS[fromIcon]) return fromIcon;
  const fromLabel = (label || "").toLowerCase();
  if (fromLabel.includes("youtube")) return "youtube";
  if (fromLabel.includes("instagram")) return "instagram";
  if (fromLabel.includes("venmo")) return "venmo";
  if (fromLabel.includes("email") || fromLabel.includes("mail")) return "email";
  return null;
}

export default function SocialIcon({ icon, label, className = "h-9 w-9" }) {
  const key = resolveIconKey(icon, label);
  const def = key ? ICONS[key] : null;

  if (!def) {
    return (
      <svg className={`${className} text-ember`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6V3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-6h-2v6H5V5z" />
      </svg>
    );
  }

  if (def.imageSrc) {
    return (
      <img
        src={def.imageSrc}
        alt=""
        className={`${className} object-contain transition group-hover:scale-110`}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      className={`${className} ${def.className} transition group-hover:scale-110`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {def.path}
    </svg>
  );
}
