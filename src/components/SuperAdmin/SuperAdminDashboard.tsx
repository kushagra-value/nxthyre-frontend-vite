import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import UsersManagement from "./UsersManagement";
import OrganizationsManagement from "./OrganizationsManagement";
import CreditsManagement from "./CreditsManagement";

interface SuperAdminDashboardProps {
  onLogout?: () => void;
}

export default function SuperAdminDashboard({
  onLogout,
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("users");

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UsersManagement />;
      case "organizations":
        return <OrganizationsManagement />;
      // case "credits":
      //   return <CreditsManagement />;
      default:
        return <UsersManagement />;
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={onLogout}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
