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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 pb-4">
      <Link href={backHref} className="text-sm text-accent hover:underline">
        {backLabel}
      </Link>
      <h1 className="font-display text-xl md:text-2xl">{subject}</h1>
      <div className="glass-card thread-chat-shell overflow-hidden">
        <div className="thread-chat-inner">{children}</div>
      </div>
    </div>
  );
}
