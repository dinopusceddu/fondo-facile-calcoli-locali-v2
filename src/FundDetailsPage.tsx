// src/FundDetailsPage.tsx
import React from 'react';
import { useAppContext } from './AppContext.js';
import { Card } from './Card.js';
import { FundComponent } from '../types.js';
import { TEXTS_UI } from '../constants.js';
import { LoadingSpinner } from './LoadingSpinner.js';

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return TEXTS_UI.notApplicable;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const FundComponentTable: React.FC<{ title: string; components: FundComponent[]; total?: number, totalLabel?: string }> = ({ title, components, total, totalLabel }) => {
  if (!components || components.length === 0 && total === undefined) return null;

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-700 mb-2">{title}</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Riferimento Normativo</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {components.map((item, index) => (
              <tr key={index} className={item.esclusoDalLimite2016 ? 'bg-yellow-50' : ''}>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{item.descrizione}{item.esclusoDalLimite2016 ? ' (Escluso Lim. 2016)' : ''}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.riferimento}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 text-right">{formatCurrency(item.importo)}</td>
              </tr>
            ))}
            {total !== undefined && totalLabel && (
                <tr className="bg-gray-100 font-bold">
                    <td colSpan={2} className="px-4 py-2 text-sm text-gray-900 text-right">{totalLabel}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(total)}</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export const FundDetailsPage: React.FC = () => {
  const { state } = useAppContext();
  const { calculatedFund, fundData, isLoading } = state;

  if (isLoading) {
    return <LoadingSpinner text="Caricamento dettagli fondo..." />;
  }

  if (!calculatedFund) {
    return (
      <Card title="Dettaglio Calcolo Fondo">
        <p className="text-gray-600">{TEXTS_UI.noDataAvailable} Effettuare prima il calcolo del fondo dalla sezione "Dati Fondo".</p>
      </Card>
    );
  }
  
  const allStableComponents: FundComponent[] = [
    { descrizione: "Fondo Risorse Decentrate Anno Precedente (consolidato storico 2016)", importo: calculatedFund.fondoBase2016, riferimento: "Art. 23, c.2, D.Lgs. 75/2017", tipo: 'stabile' },
    ...calculatedFund.incrementiStabiliCCNL,
    calculatedFund.adeguamentoProCapite,
  ];
  if(calculatedFund.incrementoOpzionaleVirtuosi) {
    allStableComponents.push(calculatedFund.incrementoOpzionaleVirtuosi);
  }


  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dettaglio Calcolo Fondo Risorse Decentrate {fundData.annualData.annoRiferimento}</h2>
      
      <Card title="Riepilogo Generale del Fondo" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-md"><strong>Totale Componente Stabile:</strong> {formatCurrency(calculatedFund.totaleComponenteStabile)}</div>
            <div className="p-3 bg-green-50 rounded-md"><strong>Totale Componente Variabile:</strong> {formatCurrency(calculatedFund.totaleComponenteVariabile)}</div>
            <div className="p-3 bg-indigo-100 rounded-md md:col-span-2 text-center text-lg"><strong>TOTALE FONDO RISORSE DECENTRATE:</strong> {formatCurrency(calculatedFund.totaleFondoRisorseDecentrate)}</div>
        </div>
      </Card>
      
      <FundComponentTable 
        title="Componente Stabile del Fondo" 
        components={allStableComponents}
        total={calculatedFund.totaleComponenteStabile}
        totalLabel="Totale Componente Stabile"
      />
      
      {calculatedFund.risorseVariabili.length > 0 && (
        <FundComponentTable 
            title="Componente Variabile del Fondo" 
            components={calculatedFund.risorseVariabili}
            total={calculatedFund.totaleComponenteVariabile}
            totalLabel="Totale Componente Variabile"
        />
      )}

      <Card title="Verifica Limite Art. 23 D.Lgs. 75/2017 (Fondo 2016)" className="mt-6">
        <p><strong>Fondo Base Storico (Limite 2016):</strong> {formatCurrency(calculatedFund.fondoBase2016)}</p>
        <p><strong>Ammontare Complessivo Risorse Soggette al Limite 2016:</strong> {formatCurrency(calculatedFund.ammontareSoggettoLimite2016)}</p>
        {calculatedFund.superamentoLimite2016 && calculatedFund.superamentoLimite2016 > 0 ? (
          <p className="text-red-600 font-semibold"><strong>Superamento Limite 2016:</strong> {formatCurrency(calculatedFund.superamentoLimite2016)}</p>
        ) : (
          <p className="text-green-600 font-semibold">Nessun superamento del limite 2016 rilevato.</p>
        )}
         <p className="text-xs text-gray-500 mt-2">Nota: Le risorse marcate come "(Escluso Lim. 2016)" non concorrono al calcolo dell'ammontare soggetto al limite del 2016.</p>
      </Card>

    </div>
  );
};