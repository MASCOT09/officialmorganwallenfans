import Link from "next/link";

interface AuthGateButtonProps {
  isLoggedIn: boolean;
  redirectPath: string;
  actionLabel: string;
  className?: string;
  children: React.ReactNode;
}

export function AuthGateButton({
  isLoggedIn,
  redirectPath,
  actionLabel,
  className = "btn-primary text-xs",
  children,
}: AuthGateButtonProps) {
  if (isLoggedIn) return <>{children}</>;

  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`;

  return (
    <Link href={loginHref} className={className}>
      {actionLabel}
    </Link>
  );
}
