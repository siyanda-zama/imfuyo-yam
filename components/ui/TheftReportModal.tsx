"use client";

interface TheftAnimal {
  name: string;
  tagId: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface TheftReportModalProps {
  animal: TheftAnimal;
  onClose: () => void;
  isOpen: boolean;
}

export default function TheftReportModal({
  animal,
  onClose,
  isOpen,
}: TheftReportModalProps) {
  if (!isOpen) return null;

  const message = encodeURIComponent(
    `LIVESTOCK THEFT REPORT\n\nAnimal: ${animal.name}\nTag ID: ${animal.tagId}\nStatus: ${animal.status}\nLast Known GPS: ${animal.latitude.toFixed(6)}, ${animal.longitude.toFixed(6)}\nGoogle Maps: https://maps.google.com/?q=${animal.latitude},${animal.longitude}\n\nPlease investigate urgently.`
  );

  const whatsappUrl = `https://wa.me/10111?text=${message}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-surface rounded-2xl p-6 w-full max-w-[380px] shadow-xl border border-danger/30">
        {/* Heading */}
        <h2 className="text-xl font-bold text-center mb-4 text-white">
          Report Livestock Theft
        </h2>

        {/* Animal details */}
        <div className="bg-background rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-secondary text-sm">Animal</span>
            <span className="font-semibold text-white">{animal.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary text-sm">Tag ID</span>
            <span className="font-semibold text-white">{animal.tagId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary text-sm">Last GPS</span>
            <span className="font-semibold text-sm text-white">
              {animal.latitude.toFixed(6)}, {animal.longitude.toFixed(6)}
            </span>
          </div>
        </div>

        {/* WhatsApp report button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-danger text-white font-semibold text-center py-3 rounded-xl active:scale-[0.98] transition-transform"
        >
          Report via WhatsApp
        </a>

        {/* Cancel button */}
        <button
          type="button"
          onClick={onClose}
          className="block w-full text-center text-secondary mt-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
