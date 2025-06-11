"use client";
import React from "react";
import { Clock } from "lucide-react";

interface LoaderOverlayProps {
  show: boolean;
  message?: string;
}

export const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ show, message }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-all">
      <div className="relative flex flex-col items-center gap-4 p-8 bg-white/90 rounded-xl shadow-xl border border-blue-100">
        <Clock className="h-14 w-14 text-blue-700 animate-spin" />
        {message && <span className="text-blue-900 font-semibold text-lg text-center">{message}</span>}
      </div>
    </div>
  );
};

export default LoaderOverlay;
