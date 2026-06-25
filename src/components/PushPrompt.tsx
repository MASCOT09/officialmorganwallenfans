"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

export function PushPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "granted") return;
    const dismissed = localStorage.getItem("push-dismissed");
    if (!dismissed) setVisible(true);
  }, []);

  async function enablePush() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const res = await fetch("/api/push/vapid");
      const { publicKey } = await res.json();
      if (!publicKey) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setVisible(false);
    } catch (err) {
      console.error("[push] subscribe failed:", err);
    } finally {
      setLoading(false);
    }
  }

  function dismiss() {
    localStorage.setItem("push-dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-lg items-center gap-4 rounded-2xl border border-card-border bg-card p-4 shadow-xl md:left-auto md:right-6">
      <Bell className="h-5 w-5 shrink-0 text-accent" />
      <div className="flex-1">
        <p className="text-sm font-medium">Enable push notifications</p>
        <p className="text-xs text-muted">Get alerts for messages, giveaways, and events.</p>
      </div>
      <button onClick={enablePush} disabled={loading} className="btn-primary px-4 py-2 text-xs">
        {loading ? "..." : "Enable"}
      </button>
      <button onClick={dismiss} className="btn-ghost text-xs">
        Later
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
