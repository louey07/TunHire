type NavBadgeDotProps = {
  visible: boolean;
};

export default function NavBadgeDot({ visible }: NavBadgeDotProps) {
  if (!visible) return null;
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full bg-red-500"
      aria-hidden
    />
  );
}
