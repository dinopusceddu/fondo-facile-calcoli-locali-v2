// components/dashboard/DashboardSummary.tsx
import React from 'react';
import { CalculatedFund } from '../../types.js';
import { Card } from '../shared/Card.js';
import { TEXTS_UI } from '../../constants.js';

interface DashboardSummaryProps {
  calculatedFund?: CalculatedFund;
  annoRiferimento: number;
}

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return TEXTS_UI.notApplicable;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ calculatedFund, annoRiferimento }) => {
  if (!calculatedFund) {
    return (
      <Card title={`Riepilogo Fondo ${annoRiferimento}`}>
        <p className="text-[#1b0e0e]">{TEXTS_UI.noDataAvailable} Effettuare prima il calcolo dalla sezione "Dati Costituzione Fondo".</p>
      </Card>
    );
  }

  const summaryItems = [
    { label: "Fondo Storico Base (2016)", value: formatCurrency(calculatedFund.fondoBase2016) },
    { label: "Totale Componente Stabile", value: formatCurrency(calculatedFund.totaleComponenteStabile), important: true },
    { label: "Totale Componente Variabile", value: formatCurrency(calculatedFund.totaleComponenteVariabile), important: true },
    { label: "TOTALE FONDO RISORSE DECENTRATE", value: formatCurrency(calculatedFund.totaleFondoRisorseDecentrate), veryImportant: true },
    { label: "Ammontare Soggetto a Limite 2016", value: formatCurrency(calculatedFund.ammontareSoggettoLimite2016) },
    { label: "Superamento Limite 2016 (se presente)", value: calculatedFund.superamentoLimite2016 ? formatCurrency(calculatedFund.superamentoLimite2016) : "Nessuno", isAlert: !!calculatedFund.superamentoLimite2016 },
  ];

  return (
    <Card title={`Riepilogo Calcolo Fondo Risorse Decentrate ${annoRiferimento}`} className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryItems.map(item => (
          <div key={item.label} className={`p-4 rounded-lg border
            ${item.veryImportant ? 'bg-[#f3e7e8] border-[#d1c0c1]' : 
              item.important ? 'bg-[#fcf8f8] border-[#f3e7e8]' : 
              'bg-white border-[#f3e7e8]'
            }`}>
            <h4 className="text-sm font-medium text-[#5f5252]">{item.label}</h4> {/* Muted label color */}
            <p className={`text-xl font-bold ${
                item.isAlert ? 'text-[#c02128]' : // Darker red for alerts
                item.veryImportant ? 'text-[#ea2832]' : 
                item.important ? 'text-[#1b0e0e]' : 'text-[#1b0e0e]'
            }`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};