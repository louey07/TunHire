import type { ReactNode } from "react";

export default function CandidateContent({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <main
      className={
        wide
          ? "min-h-screen px-4 py-6 lg:px-8 lg:py-8 xl:px-10"
          : "min-h-screen px-6 py-8 lg:px-10"
      }
    >
      <div
        className={`mx-auto w-full ${wide ? "max-w-none" : "max-w-6xl"}`}
      >
        {children}
      </div>
    </main>
  );
}
