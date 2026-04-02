import React, { forwardRef, useEffect, useState } from "react";
import { FaFileAlt, FaBars, FaClipboardList, FaUserShield } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import regularImage from "../../assets/images/regular.png";
import { useSidebar } from "../../contexts/SidebarContext";

interface SidebarRef {
  refreshAktindsigt: () => Promise<void>;
}

interface SidebarProps {}

const Sidebar = forwardRef<SidebarRef, SidebarProps>((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const handleAktindsigtClick = () => {
    navigate("/kisagsbehandler");
  };

  const handleAnsoegningClick = () => {
    navigate("/ansoegning");
  };

  const handleSagsbehandlerClick = () => {
    navigate("/sagsbehandler");
  };

  const isAktindsigtRoute = () => {
    return location.pathname === "/kis";
  };

  const isAnsoegningRoute = () => {
    return location.pathname === "/ansoegning";
  };

  const isSagsbehandlerRoute = () => {
    return location.pathname === "/sagsbehandler";
  };

  return (
    <div
      className={`bg-emerald-800 h-full flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden ${
        isSidebarOpen ? "w-[250px]" : "w-[50px]"
      }`}
    >
      <div className="h-14 p-2 border-b border-white/10 flex items-center flex-shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <FaBars className="w-4 h-4" />
        </button>
        {isSidebarOpen && (
          <div
            className="flex-1 flex justify-center cursor-pointer px-2"
            onClick={() => navigate("/")}
          >
            <img
              src={regularImage}
              alt="KIF"
              className="h-14 w-auto object-contain"
            />
          </div>
        )}
      </div>

      {isSidebarOpen ? (
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/30">
          <button
            onClick={handleAktindsigtClick}
            className={`w-full text-left p-4 text-white transition-all duration-200 hover:bg-emerald-1000 cursor-pointer flex items-center space-x-3 ${
              isAktindsigtRoute()
                ? "bg-emerald-1000 border-l-4 border-white"
                : "border-l-4 border-transparent"
            }`}
          >
            <FaFileAlt className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">KISagsbehandler</span>
          </button>
          <button
            onClick={handleAnsoegningClick}
            className={`w-full text-left p-4 text-white transition-all duration-200 hover:bg-emerald-1000 cursor-pointer flex items-center space-x-3 ${
              isAnsoegningRoute()
                ? "bg-emerald-1000 border-l-4 border-white"
                : "border-l-4 border-transparent"
            }`}
          >
            <FaClipboardList className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">KIAnsøgning</span>
          </button>
          <button
            onClick={handleSagsbehandlerClick}
            className={`w-full text-left p-4 text-white transition-all duration-200 hover:bg-emerald-1000 cursor-pointer flex items-center space-x-3 ${
              isSagsbehandlerRoute()
                ? "bg-emerald-1000 border-l-4 border-white"
                : "border-l-4 border-transparent"
            }`}
          >
            <FaUserShield className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Sagsbehandler</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 py-2 flex flex-col items-center gap-2">
          <button
            onClick={handleAktindsigtClick}
            className={`p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors w-10 h-10 flex items-center justify-center
              ${isAktindsigtRoute() ? "bg-white/10 text-white" : ""}`}
            title="KISagsbehandler"
          >
            <FaFileAlt className="w-4 h-4" />
          </button>
          <button
            onClick={handleAnsoegningClick}
            className={`p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors w-10 h-10 flex items-center justify-center
              ${isAnsoegningRoute() ? "bg-white/10 text-white" : ""}`}
            title="KIAnsøgning"
          >
            <FaClipboardList className="w-4 h-4" />
          </button>
          <button
            onClick={handleSagsbehandlerClick}
            className={`p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors w-10 h-10 flex items-center justify-center
              ${isSagsbehandlerRoute() ? "bg-white/10 text-white" : ""}`}
            title="Sagsbehandler"
          >
            <FaUserShield className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});

export default Sidebar;
