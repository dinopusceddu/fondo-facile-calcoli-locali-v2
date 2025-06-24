// src/HomePage.tsx
import React from 'react';
import { useAppContext } from './AppContext.js';
import { DashboardSummary } from './DashboardSummary.js';
import { ComplianceStatusWidget } from './ComplianceStatusWidget.js';
import { Button } from './Button.js';
import { TEXTS_UI } from '../constants.js';

export const HomePage: React.FC = () => {
  const { state, performFundCalculation } = useAppContext(); // removed dispatch as it's not directly used here.
  const { calculatedFund, complianceChecks, fundData, isLoading } = state;

  const handleRecalculate = () => {
    performFundCalculation();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard Principale</h2>
        <Button onClick={handleRecalculate} isLoading={isLoading} disabled={isLoading} variant="primary">
          {isLoading ? TEXTS_UI.calculating : "Aggiorna Calcoli e Conformità"}
        </Button>
      </div>
      
      {state.error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
          <strong className="font-bold">Errore: </strong>
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}

      <DashboardSummary calculatedFund={calculatedFund} annoRiferimento={fundData.annualData.annoRiferimento} />
      <ComplianceStatusWidget complianceChecks={complianceChecks} />
      
      {/* Ulteriori widget possono essere aggiunti qui, come grafici o scadenze */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
        <h3 className="text-lg font-semibold text-yellow-800">Prossimi Passi</h3>
        <ul className="list-disc list-inside text-yellow-700 mt-2">
            <li>Verificare tutti i dati inseriti nella sezione "Dati Fondo".</li>
            <li>Analizzare i risultati dei controlli di conformità.</li>
            <li>Procedere alla generazione dei report formali.</li>
            <li>Consultare la documentazione per i riferimenti normativi dettagliati.</li>
        </ul>
      </div>
    </div>
  );
};