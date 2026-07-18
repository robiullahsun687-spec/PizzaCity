import React, { useState } from "react";
import { Send } from "lucide-react";

interface ContactPageProps {
  displayToast: (msg: string) => void;
}

export default function ContactPage({ displayToast }: ContactPageProps) {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    displayToast("📨 Thank you! Your feedback was received. We’ll respond within 24 hours.");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactMsg("");
  };

  return (
    <div className="container mx-auto px-4 md:px-8 pb-16 space-y-8 animate-fadeIn">
      <div className="text-center space-y-1.5 max-w-xl mx-auto py-6">
        <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest block">Get in Touch</span>
        <h1 className="font-playfair font-black text-3xl md:text-4xl text-[#1A0A00]">We'd Love to Hear From You</h1>
        <p className="text-xs text-[#9A7B5E] leading-relaxed">
          Submit customer suggestions, menu feedbacks, bulk party bookings, or support questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column blocks */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <h4 className="font-bold text-xs text-[#9A7B5E] uppercase tracking-wider">Corporate Email</h4>
            <p className="font-bold text-sm text-[#1A0A00]">info@pizzacityoman.com</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <h4 className="font-bold text-xs text-[#9A7B5E] uppercase tracking-wider">Dial Helpline</h4>
            <p className="font-bold text-sm text-[#1A0A00]">+968 9692 8714</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <h4 className="font-bold text-xs text-[#9A7B5E] uppercase tracking-wider">Instagram Feed</h4>
            <p className="font-bold text-sm text-[#D72B2B]">@_pizza.city_</p>
          </div>
        </div>

        {/* Right Column message form */}
        <form onSubmit={handleContactSubmit} className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[28px] border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-playfair font-black text-xl text-[#1A0A00] mb-2">Send Us a Direct Message</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">Full Name</label>
              <input 
                type="text" 
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Salim Al-Maskari" 
                className="w-full bg-[#FFF8F2] border border-[#D72B2B]/10 rounded-xl px-4 py-3 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">Email (Optional)</label>
              <input 
                type="email" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. salim@example.com" 
                className="w-full bg-[#FFF8F2] border border-[#D72B2B]/10 rounded-xl px-4 py-3 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">WhatsApp Number (Optional)</label>
            <input 
              type="tel" 
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +968 9XXX XXXX" 
              className="w-full bg-[#FFF8F2] border border-[#D72B2B]/10 rounded-xl px-4 py-3 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D1F00] uppercase tracking-wider mb-1.5">Message / Customer Enquiry</label>
            <textarea 
              rows={4}
              required
              value={contactMsg}
              onChange={(e) => setContactMsg(e.target.value)}
              placeholder="Type what's on your mind..." 
              className="w-full bg-[#FFF8F2] border border-[#D72B2B]/10 rounded-xl px-4 py-3 text-xs text-[#3D1F00] focus:border-[#F26522] focus:outline-none"
            />
          </div>

          <button 
            type="submit"
            className="px-6 py-3.5 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white font-bold rounded-full w-full text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D72B2B]/10 active:scale-95 transition-all"
          >
            <Send size={14} />
            Transmit Message
          </button>
        </form>
      </div>
    </div>
  );
}
