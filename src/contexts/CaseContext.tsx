import { createContext, useContext, useState, ReactNode } from "react";
import type { CaseJSON, IncomeStatement } from "../utils/formToJSON";
import type { KravResult } from "../utils/quickEval";

interface CaseContextType {
  caseJSON: CaseJSON | null;
  setCaseJSON: (data: CaseJSON | null) => void;
  incomeStatement: IncomeStatement | null;
  setIncomeStatement: (data: IncomeStatement | null) => void;
  kravResults: KravResult[];
  setKravResults: (results: KravResult[]) => void;
}

const CaseContext = createContext<CaseContextType | null>(null);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [caseJSON, setCaseJSON] = useState<CaseJSON | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [kravResults, setKravResults] = useState<KravResult[]>([]);

  return (
    <CaseContext.Provider value={{
      caseJSON, setCaseJSON,
      incomeStatement, setIncomeStatement,
      kravResults, setKravResults,
    }}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  const ctx = useContext(CaseContext);
  if (!ctx) throw new Error("useCase must be used within CaseProvider");
  return ctx;
}
