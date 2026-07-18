import React, { useState } from "react";
import { Search, HelpCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FaqPage() {
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const FAQS = [
    { q: "How long does delivery take?", a: "We aim for 30 minutes or less across Nizwa, Samail, Sur, Quriyat, and Fanja. If we exceed that, your next order is on us!" },
    { q: "How can I place an order?", a: "Just click the 'Order Now' or 'Add to Cart' buttons here! It builds your invoice list, inserts it into our Express-MongoDB backend, and immediately opens WhatsApp with the pre-filled invoice message for your outlet of choice!" },
    { q: "What active areas do you offer delivery?", a: "We offer hot and fast delivery from our 5 regional stations: Nizwa, Samail, Sur, Quriyat, and Fanja. Follow us on Instagram @_pizza.city_ to get updates when we open near you." },
    { q: "Am I able to configure custom toppings?", a: "Absolutely. When placing your automated WhatsApp text checkout, you can append any custom configurations, extra toppings, or instructions like 'make it extra hot'!" },
    { q: "What payment systems are available?", a: "We currently accept cash-on-delivery, local bank transfer, or card systems. Integrated Oman payment gateways like Thawani are currently under active development." },
    { q: "Are all components of the pizza clean and fresh?", a: "Yes, 100%! We source premium whole-milk mozzarella and hand-stretch our dough daily. No frozen crusts or canned shortcuts are ever permitted." },
  ];

  const filteredFaqs = FAQS.filter(f => 
    f.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 md:px-8 pb-16 space-y-8 animate-fadeIn">
      <div className="text-center space-y-1.5 max-w-xl mx-auto py-6">
        <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest block font-sans">Support</span>
        <h1 className="font-playfair font-black text-3xl md:text-4xl text-[#1A0A00]">Answers to Common Queries</h1>
        <p className="text-xs text-[#9A7B5E] leading-relaxed">
          Search questions or look at the accordion blocks below to resolve your inquiries instantly.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* FAQs Text Search Bar */}
        <div className="flex items-center gap-2.5 bg-white border border-[#D72B2B]/10 rounded-full px-4 py-3 shadow-xs">
          <Search size={16} className="text-[#9A7B5E]" />
          <input 
            type="text" 
            placeholder="Search questions or keywords..."
            value={faqSearchQuery}
            onChange={(e) => setFaqSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#3D1F00] focus:outline-none"
          />
        </div>

        {/* Accordion list */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-xs transition-shadow"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left p-5 font-bold text-xs md:text-sm text-[#1A0A00] hover:text-[#D72B2B] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-[#F26522]" />
                      {faq.q}
                    </span>
                    <ChevronDown size={14} className={`text-[#9A7B5E] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-50 bg-[#F26522]/2"
                      >
                        <p className="p-5 text-xs text-[#9A7B5E] leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <p className="text-center text-xs text-[#9A7B5E] py-8">No matching FAQs resolved.</p>
          )}
        </div>
      </div>
    </div>
  );
}
