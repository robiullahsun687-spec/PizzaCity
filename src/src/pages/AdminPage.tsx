import React from "react";
import AdminDashboard from "../components/AdminDashboard";

interface AdminPageProps {
  displayToast: (msg: string) => void;
  refreshMenu: () => void;
}

export default function AdminPage({ displayToast, refreshMenu }: AdminPageProps) {
  return (
    <div className="container mx-auto px-4 md:px-8 pb-16 animate-fadeIn">
      <AdminDashboard onShowToast={displayToast} onMenuUpdated={refreshMenu} />
    </div>
  );
}
