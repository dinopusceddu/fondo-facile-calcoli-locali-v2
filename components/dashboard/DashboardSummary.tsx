// components/dashboard/DashboardSummary.tsx
import React from 'react';
import { CalculatedFund, FundData } from '../../types.js';
import { Card } from '../shared/Card.js';
import { TEXTS_UI } from '../../constants.js';

interface DashboardSummaryProps {
  calculatedFund?: CalculatedFund;
  fundData: FundData;
  annoRiferimento: number;
}

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return TEXTS_UI.notApplicable;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const calculatePercentageChange = (current?: number, previous?: number) => {
  if (previous === undefined || previous === 0 || current === undefined) {
    return null;
  }
  const change = ((current - previous) / previous) * 100;
  return change;
};

const renderPercentage = (change: number | null) => {
  if (change === null) return null;
  const isPositive = change > 0;
  const color = isPositive ? 'text-green-500' : 'text-red-500';
  return (
    <span className={`text-sm ml-2 ${color}`}>
      ({isPositive ? '+' : ''}{change.toFixed(1)}%)
    </span>
  );
};

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ calculatedFund, fundData, annoRiferimento }) => {
  if (!calculatedFund) {
    return (
      <Card title={`Riepilogo Fondo ${annoRiferimento}`}>
        <p className="text-[#1b0e0e]">{TEXTS_UI.noDataAvailable} Effettuare prima il calcolo dalla sezione "Dati Costituzione Fondo".</p>
      </Card>
    );
  }

  const prevYearData = fundData.historicalData[annoRiferimento - 1];

  const summaryItems = [
    {
      label: "Totale Componente Stabile",
      value: formatCurrency(calculatedFund.summary.totaleParteStabile),
      change: calculatePercentageChange(calculatedFund.summary.totaleParteStabile, prevYearData?.totaleParteStabile),
      important: true
    },
    {
      label: "Totale Componente Variabile",
      value: formatCurrency(calculatedFund.summary.totaleParteVariabile),
      change: calculatePercentageChange(calculatedFund.summary.totaleParteVariabile, prevYearData?.totaleParteVariabile),
      important: true
    },
    {
      label: "TOTALE FONDO RISORSE DECENTRATE",
      value: formatCurrency(calculatedFund.summary.totaleFondo),
      change: calculatePercentageChange(calculatedFund.summary.totaleFondo, prevYearData?.totaleFondo),
      veryImportant: true
    },
    { label: "Ammontare Soggetto a Limite 2016", value: formatCurrency(calculatedFund.summary.importoLimite2016) },
    {
      label: "Superamento Limite 2016",
      value: calculatedFund.summary.superamentoLimite ? formatCurrency(calculatedFund.summary.superamentoLimite) : "Nessuno",
      isAlert: !!calculatedFund.summary.superamentoLimite
    },
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
            <h4 className="text-sm font-medium text-[#5f5252]">{item.label}</h4>
            <p className={`text-xl font-bold ${
                item.isAlert ? 'text-[#c02128]' :
                item.veryImportant ? 'text-[#ea2832]' : 
                item.important ? 'text-[#1b0e0e]' : 'text-[#1b0e0e]'
            }`}>
              {item.value}
              {'change' in item && renderPercentage(item.change)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};