// src/DataEntryPage.tsx
import React from 'react';
import { HistoricalDataForm } from './HistoricalDataForm.js';
import { AnnualDataForm } from './AnnualDataForm.js';
import { Button } from './Button.js';
import { useAppContext } from './AppContext.js';
import { TEXTS_UI } from '../constants.js';

export const DataEntryPage: React.FC = () => {
  const { state, performFundCalculation } = useAppContext();
  const { isLoading } = state;
  
  const handleSubmit = async () => {
    // Qui si potrebbe aggiungere una logica di salvataggio dei dati (es. localStorage o API)
    // Per ora, il salvataggio è implicito nello state di AppContext.
    console.log("Dati del fondo pronti per il calcolo:", state.fundData);
    await performFundCalculation();
    // Potrebbe mostrare un messaggio di successo/errore per il salvataggio se implementato
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Inserimento Dati per Costituzione Fondo</h2>
      
      {state.error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
          <strong className="font-bold">Errore: </strong>
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}

      <HistoricalDataForm />
      <AnnualDataForm />

      <div className="mt-8 flex justify-end">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? TEXTS_UI.calculating : "Salva Dati e Calcola Fondo"}
        </Button>
      </div>
    </div>
  );
};