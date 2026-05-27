"use client";

import Link from "next/link";

type MessageCandidateButtonProps = {
  candidateUserId: number;
  variant?: "primary" | "secondary" | "block";
  className?: string;
};

export default function MessageCandidateButton({
  candidateUserId,
  variant = "primary",
  className = "",
}: MessageCandidateButtonProps) {
  const href = `/dashboard/recruiter/chat?candidateUserId=${candidateUserId}`;

  if (variant === "block") {
    return (
      <Link
        href={href}
        className={`flex w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 ${className}`}
      >
        Envoyer un message
      </Link>
    );
  }

  const tone =
    variant === "primary"
      ? "btn-primary rounded-full px-5 py-2.5 text-sm"
      : "btn-secondary rounded-full px-5 py-2.5 text-sm";

  return (
    <Link href={href} className={`${tone} ${className}`}>
      Envoyer un message
    </Link>
  );
}
