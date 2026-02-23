"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import PageTransition from "@/components/ui/PageTransition";

const FAQ = [
  {
    q: "How do I add a new animal?",
    a: "Go to the Herd tab and tap the + button at the bottom right. Fill in the animal details and tap Save.",
  },
  {
    q: "What does the boundary alert mean?",
    a: "A boundary alert means one of your animals has moved outside the designated farm area. Check the map to see its current location.",
  },
  {
    q: "How accurate is the GPS tracking?",
    a: "GPS tracking is accurate to within 5-10 meters in open areas. Dense vegetation or buildings may reduce accuracy.",
  },
  {
    q: "How do I report a stolen animal?",
    a: "Go to the animal's detail page and tap the 'Report Theft' button. This will create a theft report with the animal's last known location.",
  },
  {
    q: "What's included in the PRO plan?",
    a: "PRO includes real-time tracking updates, priority alert processing, WhatsApp integration for instant notifications, and detailed analytics.",
  },
];

export default function HelpSupportPage() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <PageTransition>
      <div className="p-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-secondary" />
          </button>
          <h1 className="font-bold text-xl text-white">Help & Support</h1>
        </div>

        {/* Contact options */}
        <motion.div
          className="bg-surface rounded-xl border border-border divide-y divide-border mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <a
            href="https://wa.me/27600000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4"
          >
            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
              <MessageCircle size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">WhatsApp Support</p>
              <p className="text-xs text-secondary">Chat with us directly</p>
            </div>
            <ExternalLink size={16} className="text-secondary" />
          </a>
          <a href="tel:+27600000000" className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-info/15 rounded-xl flex items-center justify-center">
              <Phone size={20} className="text-info" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Call Us</p>
              <p className="text-xs text-secondary">Mon-Fri, 8am-5pm SAST</p>
            </div>
            <ExternalLink size={16} className="text-secondary" />
          </a>
          <a href="mailto:support@herdguard.co.za" className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-warning/15 rounded-xl flex items-center justify-center">
              <Mail size={20} className="text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Email Support</p>
              <p className="text-xs text-secondary">support@herdguard.co.za</p>
            </div>
            <ExternalLink size={16} className="text-secondary" />
          </a>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-semibold text-white mb-3">Frequently Asked Questions</h2>
          <div className="bg-surface rounded-xl border border-border divide-y divide-border">
            {FAQ.map((faq, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left p-4"
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white pr-4">{faq.q}</p>
                  {expandedFaq === i ? (
                    <ChevronUp size={16} className="text-secondary shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-secondary shrink-0" />
                  )}
                </div>
                {expandedFaq === i && (
                  <motion.p
                    className="text-sm text-secondary mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    {faq.a}
                  </motion.p>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
