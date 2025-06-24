// src/ReportsPage.tsx
import React from 'react';
import { useAppContext } from './AppContext.js';
import { Card } from './Card.js';
import { Button } from './Button.js';
import { generateDeterminazionePDF } from './reportService.js';
import { TEXTS_UI } from '../constants.js';
import { LoadingSpinner } from './LoadingSpinner.js';


export const ReportsPage: React.FC = () => {
  const { state } = useAppContext();
  const { calculatedFund, fundData, currentUser, isLoading } = state;

  const handleGenerateDeterminazione = () => {
    if (calculatedFund) {
      try {
        generateDeterminazionePDF(calculatedFund, fundData, currentUser);
      } catch (error) {
          console.error("Errore generazione PDF:", error);
          alert("Errore durante la generazione del PDF. Controllare la console per dettagli.");
      }
    } else {
      alert("Dati del fondo non calcolati. Eseguire prima il calcolo.");
    }
  };

  if (isLoading && !calculatedFund) { // Show loading only if initial calc is happening
    return <LoadingSpinner text="Attendere il calcolo del fondo..." />;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Generazione Report e Documentazione</h2>
      
      {!calculatedFund && (
         <Card title="Attenzione">
            <p className="text-gray-600">{TEXTS_UI.noDataAvailable} per la generazione dei report. Effettuare prima il calcolo del fondo dalla sezione "Dati Fondo".</p>
         </Card>
      )}

      {calculatedFund && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Atto di Costituzione del Fondo">
            <p className="text-sm text-gray-600 mb-4">
                Genera una bozza formale della "Determinazione Dirigenziale di Costituzione del Fondo" per l'anno in corso.
                Include un elenco dettagliato delle componenti e i riferimenti normativi.
            </p>
            <Button variant="primary" onClick={handleGenerateDeterminazione} disabled={!calculatedFund || isLoading}>
                {isLoading ? TEXTS_UI.calculating : "Genera Determinazione (PDF)"}
            </Button>
            </Card>

            <Card title="Relazione Illustrativa (Prossimamente)">
            <p className="text-sm text-gray-600 mb-4">
                Generazione di una bozza di "Relazione Illustrativa" che spieghi obiettivi e criteri di utilizzo del Fondo.
                (Funzionalità in sviluppo)
            </p>
            <Button variant="secondary" disabled>
                Genera Relazione Illustrativa
            </Button>
            </Card>

            <Card title="Relazione Tecnico-Finanziaria (Prossimamente)">
            <p className="text-sm text-gray-600 mb-4">
                Generazione di una bozza di "Relazione Tecnico-Finanziaria" che attesti la copertura finanziaria e il rispetto dei vincoli.
                (Funzionalità in sviluppo)
            </p>
            <Button variant="secondary" disabled>
                Genera Relazione Tecnico-Finanziaria
            </Button>
            </Card>
            
            <Card title="Esportazione Dati per Conto Annuale (Prossimamente)">
            <p className="text-sm text-gray-600 mb-4">
                Esporta i dati del fondo in formato compatibile con le tabelle del "Conto Annuale del personale".
                (Funzionalità in sviluppo)
            </p>
            <Button variant="secondary" disabled>
                Esporta Dati (Excel)
            </Button>
            </Card>
        </div>
      )}
    </div>
  );
};