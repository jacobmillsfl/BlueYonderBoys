import SocialIcon from "./SocialIcon";

export default function LinkCard({ link }) {
  const external = !link.url.startsWith("mailto:");

  return (
    <a
      href={link.url}
      className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-leather/60 bg-midnight/50 px-2 py-3 text-center transition hover:-translate-y-0.5 hover:border-ember/50 hover:shadow-glow sm:px-3 sm:py-4"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <SocialIcon icon={link.icon} label={link.label} className="h-8 w-8 sm:h-9 sm:w-9" />
      <span className="text-xs font-medium leading-tight text-stone-100 sm:text-sm">{link.label}</span>
    </a>
  );
}
