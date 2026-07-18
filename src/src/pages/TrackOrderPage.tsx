import React from "react";
import OrderTracker from "../components/OrderTracker";

interface TrackOrderPageProps {
  trackOrderId: string;
  displayToast: (msg: string) => void;
  isDarkMode: boolean;
}

export default function TrackOrderPage({ trackOrderId, displayToast, isDarkMode }: TrackOrderPageProps) {
  return (
    <div className="container mx-auto px-4 md:px-8 pb-16 animate-fadeIn">
      <OrderTracker 
        initialOrderId={trackOrderId} 
        onShowToast={displayToast}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
