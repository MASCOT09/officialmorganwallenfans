export function LetterPortrait() {
  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-card-border shadow-xl md:mx-0 md:max-w-none">
      <div className="animate-breathe">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/morgan-wallen-portrait.png"
          alt="Morgan Wallen"
          className="h-auto w-full object-cover object-top"
          loading="eager"
        />
      </div>
    </div>
  );
}
