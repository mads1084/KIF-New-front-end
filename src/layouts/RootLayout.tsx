import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/sidebar";
import { useSidebar } from "../contexts/SidebarContext";
import { CaseProvider } from "../contexts/CaseContext";

export default function RootLayout() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <CaseProvider>
      <div className="h-screen flex overflow-hidden">
        {/* Sidebar with animated width */}
        <div className="flex-shrink-0 h-full">
          <Sidebar />
        </div>
        {/* Main content area with independent scrolling */}
        <main className="flex-1 relative overflow-y-auto bg-gray-100">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </CaseProvider>
  );
}
