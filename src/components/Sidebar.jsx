import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  MessageSquare,
  Upload,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  FolderOpen
} from "lucide-react";

import logo from "../assets/logo.png";

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navLinkClass = (path) =>
    `flex items-center rounded-md transition-colors ${
      location.pathname.startsWith(path) && path !== "/"
      ? "bg-gray-800 text-white"
      : location.pathname === path 
        ? "bg-gray-800 text-white" 
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  const textClass = `text-sm whitespace-nowrap transition-all duration-200 ${
    collapsed ? "hidden" : "block opacity-100"
  }`;

  return (
    <div
      className={`relative bg-gray-900 text-white h-screen flex flex-col justify-between
      ${collapsed ? "w-16" : "w-56"} transition-[width] duration-300 flex-shrink-0`}
    >
      {/* 🔝 Top Section */}
      <div className="p-3 overflow-hidden">
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} mb-6`}>
          <img src={logo} alt="Logo" className="w-7 h-7 object-contain flex-shrink-0" />
          <span className={`text-sm font-semibold whitespace-nowrap transition-opacity duration-200 ${collapsed ? "hidden" : "opacity-100"}`}>
            Control-Narrative AI
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {[
            { to: "/", label: "Home", Icon: Home },
            { to: "/chat", label: "Chat", Icon: MessageSquare },
            { to: "/upload", label: "Upload Docs", Icon: Upload },
            { to: "/documents", label: "My Documents", Icon: FolderOpen }, // NEW TAB
          ].map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={`${navLinkClass(to)} ${
                collapsed ? "justify-center py-2 px-0" : "gap-3 px-3 py-2"
              }`}
            >
              <div className="w-6 flex justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
              <span className={textClass}>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* 🔽 Bottom Section (Profile/Logout) ... kept same as before */}
      <div className="p-3 space-y-1 overflow-hidden">
        <Link to="/profile" className={`${navLinkClass("/profile")} ${collapsed ? "justify-center py-2 px-0" : "gap-3 px-3 py-2"}`}>
            <div className="w-6 flex justify-center flex-shrink-0"><User size={18} /></div>
            <span className={textClass}>Profile</span>
        </Link>
        <button onClick={logout} className={`w-full flex items-center rounded-md bg-red-600 hover:bg-red-700 transition ${collapsed ? "justify-center py-2 px-0" : "gap-3 px-3 py-2"}`}>
          <div className="w-6 flex justify-center flex-shrink-0"><LogOut size={18} /></div>
          <span className={textClass}>Logout</span>
        </button>
      </div>

      {/* ▶ Collapse Button */}
      <button onClick={() => setCollapsed(!collapsed)} className="absolute top-1/2 -right-3 -translate-y-1/2 bg-gray-800 border border-gray-700 rounded-full p-1 hover:bg-gray-700 transition z-50">
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
}