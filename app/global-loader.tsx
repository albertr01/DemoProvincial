"use client";
import React from "react";
import { useLoading } from "@/app/loading-context";
import LoaderOverlay from "@/components/ui/loader-overlay";

const GlobalLoader = () => {
  const { show, message } = useLoading();
  return <LoaderOverlay show={show} message={message} />;
};

export default GlobalLoader;
