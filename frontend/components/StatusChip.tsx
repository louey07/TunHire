import { getApplicationStatusUi } from "@/lib/status/applications";

export default function StatusChip({ status }: { status?: string }) {
  const config = getApplicationStatusUi(status);
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${config.tone}`}
    >
      {config.label}
    </span>
  );
}
