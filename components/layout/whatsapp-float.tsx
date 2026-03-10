import { MessageCircleMore } from "lucide-react";

const defaultMessage =
  "Hello Mediway, I want help with treatment options, doctor recommendations, and travel planning.";

export function WhatsAppFloat() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,#1fa855,#25d366)] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_50px_rgba(37,211,102,0.35)] transition hover:-translate-y-1"
    >
      <MessageCircleMore className="h-5 w-5" />
      WhatsApp us
    </a>
  );
}
