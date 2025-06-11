"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoadingContextType {
  show: boolean;
  message?: string;
  setLoading: (show: boolean, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  show: false,
  setLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const setLoading = (visible: boolean, msg?: string) => {
    setShow(visible);
    setMessage(msg);
  };

  return (
    <LoadingContext.Provider value={{ show, message, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
