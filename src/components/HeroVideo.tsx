"use client";

import { Suspense, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const HeroScene3D = dynamic(() => import("./HeroScene3D"), { ssr: false });

interface HeroVideoProps {
  videoUrl: string;
}

export function HeroVideo({ videoUrl }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {
      // Autoplay may be blocked; video still shows first frame via poster
    });
  }, []);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-card-border">
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover"
        muted
        autoPlay
        playsInline
        loop
        poster="/images/hero-poster.svg"
      />
      <div className="absolute inset-0 z-10 pointer-events-none opacity-55">
        <Suspense fallback={null}>
          <HeroScene3D />
        </Suspense>
      </div>
    </div>
  );
}
