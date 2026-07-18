import React from "react";
import { Phone } from "lucide-react";
import { Branch } from "../types";

interface LocationsPageProps {
  branches: Branch[];
}

export default function LocationsPage({ branches }: LocationsPageProps) {
  const displayBranches = (branches && branches.length > 0)
    ? branches.filter(b => b.isActive !== false)
    : [
        { _id: "nizwa", name: "Nizwa Outlet", phone: "+968 96928714", map: "https://maps.google.com/maps?q=Nizwa,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Near Nizwa Souq, Nizwa City Center, Nizwa, Oman", geo: "Nizwa", hours: "Daily 11 AM – 11 PM", delivery: true },
        { _id: "samail", name: "Samail Outlet", phone: "+968 96928716", map: "https://maps.google.com/maps?q=Samail,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Main Shopping High Street Plaza, Samail, Oman", geo: "Samail", hours: "Daily 11 AM – 11 PM", delivery: true },
        { _id: "sur", name: "Sur Outlet", phone: "+968 96928717", map: "https://maps.google.com/maps?q=Sur,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Al-Muraj Street Commercial Corridor, Sur, Oman", geo: "Sur", hours: "Daily 11 AM – 11 PM", delivery: true },
        { _id: "quriyat", name: "Quriyat Outlet", phone: "+968 96928719", map: "https://maps.google.com/maps?q=Quriyat,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Coastal Expressway High Road, Quriyat, Oman", geo: "Quriyat", hours: "Daily 11 AM – 11 PM", delivery: true },
        { _id: "fanja", name: "Fanja Outlet", phone: "+968 96749772", map: "https://maps.google.com/maps?q=Fanja,Oman&t=&z=13&ie=UTF8&iwloc=&output=embed", address: "Main Highway Intersection Plaza Road, Fanja, Oman", geo: "Fanja", hours: "Daily 11 AM – 11 PM", delivery: true },
        { _id: "Al Khoud", name: "Al Khoud Outlet", phone: "+968 96749772", map: "https://maps.app.goo.gl/uLHNwrGK2kaRFULdA", address: "Main Highway Intersection Plaza Road, Fanja, Oman", geo: "Al Khoud", hours: "Daily 11 AM – 11 PM", delivery: true },
      ];

  return (
    <div className="container mx-auto px-4 md:px-8 pb-16 space-y-8 animate-fadeIn">
      {/* Hero section */}
      <div className="text-center space-y-1.5 max-w-xl mx-auto py-6">
        <span className="text-xs font-bold text-[#F26522] uppercase tracking-widest block">Available Outlets</span>
        <h1 className="font-playfair font-black text-3xl md:text-4xl text-[#1A0A00]">Our Pizza City Network</h1>
        <p className="text-xs text-[#9A7B5E] leading-relaxed">
          Come dine-in, collect order pick-ups, or select hot delivery directly to your home coordinates.
        </p>
      </div>

      {/* Location item grids cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayBranches.map((outlet: any) => {
          const embedMapSrc = outlet.map && outlet.map.includes("output=embed")
            ? outlet.map
            : `https://maps.google.com/maps?q=${encodeURIComponent(outlet.name + ", " + outlet.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
          const gpsLink = outlet.map && !outlet.map.includes("output=embed")
            ? outlet.map
            : `https://maps.google.com/?q=${encodeURIComponent(outlet.geo || outlet.name || "Oman")}`;

          return (
            <div key={outlet._id || outlet.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
              
              {/* Map or Image Header */}
              <div className="w-full h-44 bg-[#F5EDE3] relative">
                <iframe 
                  src={embedMapSrc}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy"
                  className="opacity-90 hover:opacity-100 transition-opacity"
                ></iframe>
              </div>

              {/* Content panel */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-green-700 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                    {outlet.hours || "Open Now · Daily 11 AM – 11 PM"}
                  </div>
                  
                  <h4 className="font-playfair font-black text-lg text-[#1A0A00] leading-tight">{outlet.name}</h4>
                  
                  <p className="text-xs text-[#9A7B5E] leading-relaxed">
                    📍 {outlet.address}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100">
                  {/* Dial telephone helper */}
                  <div className="flex items-center justify-between text-xs text-[#3D1F00]">
                    <span className="font-semibold flex items-center gap-1">
                      <Phone size={13} className="text-[#F26522]" />
                      Dial Staff line:
                    </span>
                    <span className="font-mono font-bold">{outlet.phone}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-bold">Delivery Status:</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      outlet.delivery !== false 
                        ? "bg-green-100 text-green-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {outlet.delivery !== false ? "🛵 Delivery Active" : "🛍️ Pickup Only"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <a 
                      href={`tel:${outlet.phone.replace(/\s+/g, "")}`}
                      className="py-2 bg-gray-50 hover:bg-gray-100 text-[#3D1F00] font-bold text-center text-xs rounded-xl border border-gray-100 active:scale-95 transition-all block"
                    >
                      📞 Call Branch
                    </a>
                    <a 
                      href={gpsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 bg-gradient-to-r from-[#D72B2B] to-[#F26522] text-white font-bold text-center text-xs rounded-xl active:scale-95 transition-all block"
                    >
                      📍 GPS Dir
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
