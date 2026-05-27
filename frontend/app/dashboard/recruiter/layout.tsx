import RecruiterShell from "@/components/RecruiterShell";

export default function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RecruiterShell>{children}</RecruiterShell>;
}
