// src/DashboardSummary.tsx
import React from 'react';
import { CalculatedFund } from '../types.js';
import { Card } from './Card.js';
import { TEXTS_UI } from '../constants.js';

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
        <p className="text-gray-600">{TEXTS_UI.noDataAvailable} Effettuare prima il calcolo dalla sezione "Dati Fondo".</p>
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
    <Card title={`Riepilogo Calcolo Fondo Risorse Decentrate ${annoRiferimento}`} className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryItems.map(item => (
          <div key={item.label} className={`p-4 rounded-lg shadow ${item.veryImportant ? 'bg-blue-50 border-blue-200 border-2' : item.important ? 'bg-sky-50 border-sky-200 border' : 'bg-gray-50 border-gray-200 border'}`}>
            <h4 className="text-sm font-medium text-gray-500">{item.label}</h4>
            <p className={`text-xl font-semibold ${
                item.isAlert ? 'text-red-600' : 
                item.veryImportant ? 'text-blue-700' : 
                item.important ? 'text-sky-700' : 'text-gray-800'
            }`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};