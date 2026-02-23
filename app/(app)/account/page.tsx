"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Farm {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  hectares: number | null;
  _count?: { animals: number };
}

interface UserSession {
  name?: string | null;
  phone?: string;
  id?: string;
}

type Plan = "BASIC" | "PRO";

const PRO_FEATURES = [
  "Real-time tracking",
  "Priority alerts",
  "WhatsApp integration",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AccountPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [plan, setPlan] = useState<Plan>("BASIC");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  /* ---------- Fetch session + farm data ---------- */
  useEffect(() => {
    async function load() {
      try {
        // Fetch session
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (session?.user) {
          setUser({
            name: session.user.name,
            phone: session.user.phone,
            id: session.user.id,
          });
        }

        // Fetch farms
        const farmRes = await fetch("/api/farms");
        if (farmRes.ok) {
          const farms: Farm[] = await farmRes.json();
          if (farms.length > 0) {
            setFarm(farms[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load account data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---------- Sign out ---------- */
  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
      setSigningOut(false);
    }
  };

  /* ---------- Derived ---------- */
  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";
  const animalCount = farm?._count?.animals ?? 0;

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="p-4 pt-6 space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 bg-surface-card rounded-full animate-pulse" />
          <div className="h-6 w-32 bg-surface-card rounded-lg animate-pulse" />
          <div className="h-4 w-40 bg-surface-card rounded-lg animate-pulse" />
        </div>
        <div className="h-24 w-full bg-surface-card rounded-xl animate-pulse" />
        <div className="h-40 w-full bg-surface-card rounded-xl animate-pulse" />
        <div className="h-14 w-full bg-surface-card rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 pb-24">
      {/* ---- Profile header ---- */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-cyan rounded-full flex items-center justify-center mb-3">
          <span className="text-navy text-3xl font-bold">{userInitial}</span>
        </div>
        <h1 className="font-heading text-xl font-bold text-white">
          {user?.name || "Farmer"}
        </h1>
        <p className="text-slate-light text-sm mt-0.5">
          {user?.phone || "No phone"}
        </p>
      </div>

      {/* ---- Farm card ---- */}
      {farm && (
        <div className="bg-navy-light rounded-xl border border-cyan/20 p-4 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cyan/15 rounded-xl flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">{farm.name}</h3>
              <p className="text-xs text-slate-light">
                {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-surface-card rounded-lg px-3 py-2">
            <span className="text-sm text-slate-light">Animals</span>
            <span className="font-semibold text-white">{animalCount}</span>
          </div>
          {farm.hectares && (
            <div className="flex items-center justify-between bg-surface-card rounded-lg px-3 py-2 mt-2">
              <span className="text-sm text-slate-light">Size</span>
              <span className="font-semibold text-white">{farm.hectares} ha</span>
            </div>
          )}
        </div>
      )}

      {/* ---- Plan card ---- */}
      <div className="bg-navy-light rounded-xl border border-cyan/20 p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Subscription Plan</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              plan === "PRO"
                ? "bg-cyan text-navy"
                : "bg-surface-card text-slate-light"
            }`}
          >
            {plan}
          </span>
        </div>

        <div className="bg-surface-card rounded-lg px-3 py-2 mb-3">
          <p className="text-sm">
            {plan === "BASIC" ? (
              <>
                <span className="font-bold text-lg text-white">R100</span>
                <span className="text-slate-light">/animal/month</span>
              </>
            ) : (
              <>
                <span className="font-bold text-lg text-white">R150</span>
                <span className="text-slate-light">/animal/month</span>
              </>
            )}
          </p>
        </div>

        {/* Upgrade card for BASIC users */}
        {plan === "BASIC" && (
          <div className="relative rounded-xl p-[2px] bg-gradient-to-r from-cyan via-lime to-cyan overflow-hidden">
            <div className="bg-navy rounded-[10px] p-4">
              <h4 className="font-heading font-bold text-cyan mb-2">
                Upgrade to PRO
              </h4>
              <ul className="space-y-2">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-cyan shrink-0"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setPlan("PRO")}
                className="mt-4 w-full bg-cyan text-navy font-semibold py-2.5 rounded-xl active:scale-[0.98] transition-transform"
              >
                Upgrade Now — R150/animal/mo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Settings section ---- */}
      <div className="bg-navy-light rounded-xl border border-cyan/20 shadow-sm mb-6 divide-y divide-slate-dark/30">
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-light"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="text-sm font-medium text-white">Notification Settings</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-light"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-light"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="text-sm font-medium text-white">App Settings</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-light"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-light"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-sm font-medium text-white">Help & Support</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-light"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* ---- Sign out button ---- */}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="border border-alert-red text-alert-red rounded-xl p-4 w-full font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {signingOut ? "Signing out..." : "Sign Out"}
      </button>

      {/* Version */}
      <p className="text-center text-slate-light text-xs mt-6">
        HerdGuard v1.0.0
      </p>
    </div>
  );
}
