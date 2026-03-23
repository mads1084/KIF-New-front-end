import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaBolt,
  FaLightbulb,
  FaArrowRight,
  FaRocket,
  FaBrain,
  FaComments,
  FaChartLine,
} from "react-icons/fa";
import regularImage from "../assets/images/regular_green.png";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6">
              <img
                src={regularImage}
                alt="KIF"
                className="h-12 sm:h-16 lg:h-20 w-auto object-contain"
              />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Velkommen til{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  KIForvaltning
                </span>
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Vi er en AI-drevet platform, der hjælper med sagsbehandling gennem
              intelligent dokumentanalyse og smarte arbejdsgange. Vores
              avancerede AI-teknologi strømliner din sagsbehandling, gør dig
              mere effektiv og sikrer konsistente resultater i hver sag.
            </p>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
          {/* Aktindsigt Card */}
          <div
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden border border-gray-100"
            onClick={() => navigate("/kisagsbehandler")}
          >
            {/* Gradient Header */}
            <div
              className="h-24 sm:h-28 lg:h-32 relative overflow-hidden"
              style={{
                background: "linear-gradient(to right, #059669, #065f46)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-opacity-10"></div>
              <div className="absolute top-4 sm:top-5 lg:top-6 left-4 sm:left-5 lg:left-6">
                <FaFileAlt className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute top-4 sm:top-5 lg:top-6 right-4 sm:right-5 lg:right-6">
                <FaBolt className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white opacity-80" />
              </div>
              <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-4 sm:left-5 lg:left-6 text-white">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  KI Sagsbehandler
                </h2>
                <p className="text-xs sm:text-sm opacity-90">
                  Dokumentadgang & Styring
                </p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Intelligent dokumentadgang og styringssystem drevet af AI.
                Strømlinje dine dokumentarbejdsgange med smart kategorisering,
                adgangskontrol og omfattende revisionsspor.
              </p>

              {/* Features List */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <FaFileAlt className="w-3 h-3 sm:w-4 sm:h-4 text-success-600" />
                  <span>Filupload & styring</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <FaComments className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                  <span>AI-drevne samtaler</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <FaBrain className="w-3 h-3 sm:w-4 sm:h-4 text-accent-600" />
                  <span>Intelligente indsigter</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center text-emerald-600 group-hover:gap-2 sm:group-hover:gap-3 transition-all duration-300">
                <span className="font-semibold text-sm sm:text-base lg:text-lg">
                  Gennemse KI Sagsbehandler
                </span>
                <FaArrowRight className="ml-1 sm:ml-2 group-hover:ml-2 sm:group-hover:ml-3 transition-all duration-300" />
              </div>
            </div>
          </div>

          {/* Analysis Card */}
          <div className="group relative bg-white rounded-2xl shadow-lg transition-all duration-300 cursor-not-allowed overflow-hidden border border-gray-100 opacity-60">
            {/* Gradient Header */}
            <div
              className="h-24 sm:h-28 lg:h-32 relative overflow-hidden"
              style={{
                background: "linear-gradient(to right, #f97316, #ef4444)",
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-10"></div>
              <div className="absolute top-4 sm:top-5 lg:top-6 left-4 sm:left-5 lg:left-6">
                <FaChartLine className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute top-4 sm:top-5 lg:top-6 right-4 sm:right-5 lg:right-6">
                <div className="bg-yellow-400 text-gray-900 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                  Kommer Snart
                </div>
              </div>
              <div className="absolute bottom-4 sm:bottom-5 lg:bottom-6 left-4 sm:left-5 lg:left-6 text-white">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  Analyse
                </h2>
                <p className="text-xs sm:text-sm opacity-90">
                  Data Indsigter & Rapporter
                </p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>

              {/* Features List */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <FaChartLine className="w-3 h-3 sm:w-4 sm:h-4 text-success-600" />
                  <span>Lorem ipsum dolor</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <FaBrain className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
                  <span>Consectetur adipiscing</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                  <FaRocket className="w-3 h-3 sm:w-4 sm:h-4 text-accent-600" />
                  <span>Sed do eiusmod tempor</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center text-gray-400 group-hover:gap-2 sm:group-hover:gap-3 transition-all duration-300">
                <span className="font-semibold text-sm sm:text-base lg:text-lg">
                  Kommer Snart
                </span>
                <FaArrowRight className="ml-1 sm:ml-2 group-hover:ml-2 sm:group-hover:ml-3 transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
