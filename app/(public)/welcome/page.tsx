"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, MapPin, Bell } from "lucide-react";

const features = [
  { icon: MapPin, title: "GPS Tracking", desc: "Real-time location monitoring" },
  { icon: Shield, title: "Geofencing", desc: "Boundary exit alerts" },
  { icon: Bell, title: "Smart Alerts", desc: "Instant theft notifications" },
];

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Image
          src="/herdguard-logo.jpeg"
          alt="HerdGuard"
          width={100}
          height={100}
          className="rounded-2xl"
          priority
        />
      </motion.div>

      <motion.h1
        className="text-3xl font-bold text-white mt-6 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Welcome to HerdGuard
      </motion.h1>

      <motion.p
        className="text-text-secondary text-center mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        Smart livestock protection for South African farmers
      </motion.p>

      {/* Trusted by SA farmers */}
      <motion.div
        className="w-full flex gap-2 overflow-hidden rounded-xl mb-8 h-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        <div className="relative flex-1 rounded-lg overflow-hidden">
          <Image src="/images/cattle-3.jpg" alt="Cattle" fill className="object-cover" />
        </div>
        <div className="relative flex-1 rounded-lg overflow-hidden">
          <Image src="/images/horses-2.jpg" alt="Horses" fill className="object-cover" />
        </div>
        <div className="relative flex-1 rounded-lg overflow-hidden">
          <Image src="/images/goat.jpg" alt="Goats" fill className="object-cover" />
        </div>
      </motion.div>

      {/* Features */}
      <div className="w-full space-y-4 mb-12">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="flex items-center gap-4 bg-surface rounded-xl p-4 border border-border"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <f.icon size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-white">{f.title}</p>
              <p className="text-sm text-text-secondary">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        onClick={() => router.push("/login")}
        className="w-full bg-primary text-background font-bold rounded-xl p-4 min-h-[56px] active:scale-[0.98] transition-transform"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        whileTap={{ scale: 0.98 }}
      >
        Get Started
      </motion.button>
    </div>
  );
}
