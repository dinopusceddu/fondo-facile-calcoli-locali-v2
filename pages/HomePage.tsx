// pages/HomePage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { DashboardSummary } from '../components/dashboard/DashboardSummary.js';
import { ComplianceStatusWidget } from '../components/dashboard/ComplianceStatusWidget.js';
import { Button } from '../components/shared/Button.js';
import { TEXTS_UI } from '../constants.js';

export const HomePage: React.FC = () => {
  const { state, performFundCalculation } = useAppContext();
  const { calculatedFund, complianceChecks, fundData, isLoading } = state;

  const handleRecalculate = () => {
    performFundCalculation();
  };

  return (
    <div className="space-y-8"> {/* Added spacing between major sections */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Dashboard Principale</h2>
        <Button onClick={handleRecalculate} isLoading={isLoading} disabled={isLoading} variant="primary" size="md">
          {isLoading ? TEXTS_UI.calculating : "Aggiorna Calcoli e Conformità"}
        </Button>
      </div>
      
      {state.error && (
        <div className="p-4 bg-[#fdd0d2] border border-[#ea2832] text-[#5c1114] rounded-lg" role="alert"> {/* Adjusted error alert style */}
          <strong className="font-bold">Errore: </strong>
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}

      <DashboardSummary calculatedFund={calculatedFund} annoRiferimento={fundData.annualData.annoRiferimento} />
      <ComplianceStatusWidget complianceChecks={complianceChecks} />
      
      <div className="p-6 bg-[#fffbea] border border-[#f3e7e8] rounded-lg"> {/* Adjusted info box style */}
        <h3 className="text-lg font-bold text-[#1b0e0e] mb-2">Prossimi Passi</h3>
        <ul className="list-disc list-inside text-[#1b0e0e] space-y-1 text-sm">
            <li>Verificare tutti i dati inseriti nella sezione "Dati Costituzione Fondo".</li>
            <li>Analizzare i risultati dei controlli di conformità.</li>
            <li>Procedere alla generazione dei report formali.</li>
            <li>Consultare la documentazione per i riferimenti normativi dettagliati.</li>
        </ul>
      </div>
    </div>
  );
};