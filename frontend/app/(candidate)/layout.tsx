import CandidateShell from "@/components/CandidateShell";

export default function CandidateRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CandidateShell>{children}</CandidateShell>;
}
