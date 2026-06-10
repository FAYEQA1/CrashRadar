import Dashboard from "../components/dashboard";
import IncidentMap from "../components/IncidentMap";
function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <Dashboard />
      <div className="p-6">
        <IncidentMap />
      </div>
    </div>
  );
}

export default DashboardPage;