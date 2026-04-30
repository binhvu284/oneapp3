import lovableLogo from "@/assets/lovable-logo.png";

export function LovableIcon({ className }: { className?: string }) {
  return (
    <img
      src={lovableLogo}
      alt="Lovable AI"
      className={className}
    />
  );
}
