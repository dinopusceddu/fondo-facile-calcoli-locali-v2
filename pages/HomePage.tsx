// pages/HomePage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Button } from '../components/shared/Button.js';
import { Card } from '../components/shared/Card.js';
import { TEXTS_UI } from '../constants.js';
import { DashboardSummary } from '../components/dashboard/DashboardSummary.js';
import FundAllocationChart from '../components/dashboard/FundAllocationChart.js';
import { ComplianceStatusWidget } from '../components/dashboard/ComplianceStatusWidget.js';

export const HomePage: React.FC = () => {
  const { state, performFundCalculation } = useAppContext();
  const { calculatedFund, complianceChecks, fundData, isLoading, error, currentYear } = state;

  const handleRecalculate = () => {
    performFundCalculation();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">
          Dashboard Direzionale - {fundData.annualData.denominazioneEnte || 'Ente non specificato'} ({currentYear})
        </h2>
        <Button onClick={handleRecalculate} isLoading={isLoading} disabled={isLoading} variant="primary" size="lg">
          {isLoading ? TEXTS_UI.calculating : "Aggiorna Dati Dashboard"}
        </Button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg" role="alert">
          <strong className="font-bold">Errore: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!calculatedFund && (
        <Card title="Benvenuto">
          <div className="p-4 text-center">
            <p className="text-lg text-gray-700">
              Per visualizzare la dashboard, è necessario prima inserire i dati e calcolare il fondo.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Vai alla sezione "Dati Costituzione Fondo" per iniziare.
            </p>
          </div>
        </Card>
      )}

      {calculatedFund && (
        <>
          <DashboardSummary
            calculatedFund={calculatedFund}
            fundData={fundData}
            annoRiferimento={currentYear}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <FundAllocationChart />
            </div>
            <div>
              <ComplianceStatusWidget checks={complianceChecks} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
