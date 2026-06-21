type ErrorBlockProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export default function ErrorBlock({
  title = "Une erreur est survenue",
  message,
  onRetry,
}: ErrorBlockProps) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffdad6] text-[#93000a]">
        !
      </div>
      <div>
        <h3 className="text-xl font-bold text-[var(--primary)]">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-[var(--on-surface-variant)]">
          {message}
        </p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="btn-secondary rounded-full px-5 py-2 text-sm font-semibold"
        >
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
