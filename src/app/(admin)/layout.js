import { AuthWrapper } from "@/wrapper/AuthWrapper.jsx";
import Header from "../../components/Header.jsx";
import Sidebar from "../../components/Sidebar.jsx";

export default function AdminLayout({ children }) {
  return (
    <AuthWrapper
      allowedRoles={["Collector"]}
      className="flex flex-col min-h-screen"
    >
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar role="admin" />
        <main className="flex-1 p-6 bg-gray-100 overflow-auto mt-16">
          {children}
        </main>
      </div>
    </AuthWrapper>
  );
}
