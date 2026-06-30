import Link from "next/link";

interface ThreadPageFrameProps {
  backHref: string;
  backLabel: string;
  subject: string;
  children: React.ReactNode;
}

export function ThreadPageFrame({
  backHref,
  backLabel,
  subject,
  children,
}: ThreadPageFrameProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 pb-6">
      <Link href={backHref} className="text-sm text-accent hover:underline">
        {backLabel}
      </Link>
      <h1 className="font-display text-xl md:text-2xl">{subject}</h1>
      <div className="glass-card flex h-[min(72vh,calc(100dvh-14rem))] min-h-[28rem] flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
