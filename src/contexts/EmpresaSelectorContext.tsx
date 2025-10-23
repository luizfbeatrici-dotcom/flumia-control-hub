import React, { createContext, useContext, useState, useEffect } from "react";

interface EmpresaSelectorContextType {
  selectedEmpresaId: string | null;
  setSelectedEmpresaId: (id: string | null) => void;
}

const EmpresaSelectorContext = createContext<EmpresaSelectorContextType | undefined>(undefined);

export function EmpresaSelectorProvider({ children }: { children: React.ReactNode }) {
  const [selectedEmpresaId, setSelectedEmpresaIdState] = useState<string | null>(() => {
    return localStorage.getItem("selectedEmpresaId") || null;
  });

  const setSelectedEmpresaId = (id: string | null) => {
    setSelectedEmpresaIdState(id);
    if (id) {
      localStorage.setItem("selectedEmpresaId", id);
    } else {
      localStorage.removeItem("selectedEmpresaId");
    }
  };

  return (
    <EmpresaSelectorContext.Provider value={{ selectedEmpresaId, setSelectedEmpresaId }}>
      {children}
    </EmpresaSelectorContext.Provider>
  );
}

export function useEmpresaSelector() {
  const context = useContext(EmpresaSelectorContext);
  if (context === undefined) {
    throw new Error("useEmpresaSelector must be used within EmpresaSelectorProvider");
  }
  return context;
}
