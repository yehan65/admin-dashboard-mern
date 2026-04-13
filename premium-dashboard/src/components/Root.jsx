import { Outlet, useAsyncError } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useState } from "react";

export default function RootLayout() {
  // const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} collapsed={collapsed} />
        <div className="flex-1 flex flex-col">
          <Navbar
            toggleCollapse={() => setCollapsed(!collapsed)}
            toggleSidebar={() => setIsOpen(!isOpen)}
          />
          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
