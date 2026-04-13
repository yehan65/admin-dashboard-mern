import { Home, Users, FileText, MessageCircle, Settings } from "lucide-react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen, collapsed }) {
  const links = [
    { name: "Dashboard", icon: <Home />, path: "/" },
    { name: "Users", icon: <Users />, path: "/users" },
    { name: "Posts", icon: <FileText />, path: "/posts" },
    { name: "Messages", icon: <MessageCircle />, path: "/messages" },
    { name: "Settings", icon: <Settings />, path: "/settings" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 min-h-screen ${collapsed ? "w-20" : "w-56 sm:w-60 md:w-64"} bg-gray-900 text-white p-5 transform
      transition-transform duration-300 z-40
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
       md:translate-x-0 md:relative`}
      >
        <div className="p-5 text-2xl font-bold border-b border-gray-800">
          {collapsed ? "A" : "Admin Panel"}
        </div>

        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? "bg-gray-700 text-white" : "hover:bg-gray-800 text-gray-300"}`
            }
          >
            {link.icon}
            {!collapsed && <span>{link.name}</span>}
          </NavLink>
        ))}
      </div>
    </>
  );
}
