"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import PageTransition from "@/components/ui/PageTransition";
import {
  Bell,
  Settings,
  HelpCircle,
  ChevronRight,
  Home,
  Crown,
  LogOut,
  User,
  Check,
} from "lucide-react";

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
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [plan, setPlan] = useState<Plan>("BASIC");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

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
          if (session.user.plan) {
            setPlan(session.user.plan as Plan);
          }
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

  /* ---------- Upgrade plan ---------- */
  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/user/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "PRO" }),
      });
      if (res.ok) {
        setPlan("PRO");
      }
    } catch (err) {
      console.error("Failed to upgrade:", err);
    } finally {
      setUpgrading(false);
    }
  };

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
          <div className="w-20 h-20 bg-surface-light rounded-full animate-pulse" />
          <div className="h-6 w-32 bg-surface-light rounded-lg animate-pulse" />
          <div className="h-4 w-40 bg-surface-light rounded-lg animate-pulse" />
        </div>
        <div className="h-24 w-full bg-surface-light rounded-xl animate-pulse" />
        <div className="h-40 w-full bg-surface-light rounded-xl animate-pulse" />
        <div className="h-14 w-full bg-surface-light rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 pt-6 pb-24">
        {/* ---- Profile header ---- */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-3">
            <span className="text-background text-3xl font-bold">{userInitial}</span>
          </div>
          <h1 className="font-bold text-xl text-white">
            {user?.name || "Farmer"}
          </h1>
          <p className="text-secondary text-sm mt-0.5">
            {user?.phone || "No phone"}
          </p>
        </motion.div>

        {/* Branding banner */}
        <motion.div
          className="relative w-full h-24 rounded-xl overflow-hidden mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <Image src="/images/farm-2.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40 flex items-center px-4">
            <p className="text-white text-sm font-semibold">Protecting South African livestock since 2024</p>
          </div>
        </motion.div>

        {/* ---- Farm card ---- */}
        {farm && (
          <motion.div
            className="bg-surface rounded-xl border border-primary/20 p-4 shadow-sm mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                <Home size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{farm.name}</h3>
                <p className="text-xs text-secondary">
                  {farm.latitude.toFixed(4)}, {farm.longitude.toFixed(4)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-surface-light rounded-lg px-3 py-2">
              <span className="text-sm text-secondary">Animals</span>
              <span className="font-semibold text-white">{animalCount}</span>
            </div>
            {farm.hectares && (
              <div className="flex items-center justify-between bg-surface-light rounded-lg px-3 py-2 mt-2">
                <span className="text-sm text-secondary">Size</span>
                <span className="font-semibold text-white">{farm.hectares} ha</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ---- Plan card ---- */}
        <motion.div
          className="bg-surface rounded-xl border border-primary/20 p-4 shadow-sm mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Subscription Plan</h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                plan === "PRO"
                  ? "bg-primary text-background"
                  : "bg-surface-light text-secondary"
              }`}
            >
              {plan}
            </span>
          </div>

          <div className="bg-surface-light rounded-lg px-3 py-2 mb-3">
            <p className="text-sm">
              {plan === "BASIC" ? (
                <>
                  <span className="font-bold text-lg text-white">R100</span>
                  <span className="text-secondary">/animal/month</span>
                </>
              ) : (
                <>
                  <span className="font-bold text-lg text-white">R150</span>
                  <span className="text-secondary">/animal/month</span>
                </>
              )}
            </p>
          </div>

          {/* Upgrade card for BASIC users */}
          {plan === "BASIC" && (
            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 animate-shimmer" />
              <div className="relative bg-surface m-[1px] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={18} className="text-primary" />
                  <h4 className="font-bold text-primary">
                    Upgrade to PRO
                  </h4>
                </div>
                <ul className="space-y-2">
                  {PRO_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-white">
                      <Check size={16} className="text-primary shrink-0" strokeWidth={2.5} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="mt-4 w-full bg-primary text-background font-semibold py-2.5 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60"
                >
                  {upgrading ? "Upgrading..." : "Upgrade Now — R150/animal/mo"}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ---- Settings section ---- */}
        <motion.div
          className="bg-surface rounded-xl border border-primary/20 shadow-sm mb-6 divide-y divide-border"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <button
            type="button"
            onClick={() => router.push("/account/notifications")}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-secondary" />
              <span className="text-sm font-medium text-white">Notification Settings</span>
            </div>
            <ChevronRight size={16} className="text-secondary" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/account/settings")}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-secondary" />
              <span className="text-sm font-medium text-white">App Settings</span>
            </div>
            <ChevronRight size={16} className="text-secondary" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/account/help")}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={20} className="text-secondary" />
              <span className="text-sm font-medium text-white">Help & Support</span>
            </div>
            <ChevronRight size={16} className="text-secondary" />
          </button>
        </motion.div>

        {/* ---- Sign out button ---- */}
        <motion.button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="border border-danger text-danger rounded-xl p-4 w-full font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <LogOut size={18} />
          {signingOut ? "Signing out..." : "Sign Out"}
        </motion.button>

        {/* Version */}
        <p className="text-center text-muted text-xs mt-6">
          HerdGuard v1.0.0
        </p>
      </div>
    </PageTransition>
  );
}
