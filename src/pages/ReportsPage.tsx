// pages/ReportsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Card } from '../components/shared/Card.js';
import { Button } from '../components/shared/Button.js';
import { generateDeterminazioneTXT, generateFullSummaryPDF, generateFADXLS } from '../services/reportService.js';
import { TEXTS_UI } from '../constants.js';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.js';


export const ReportsPage: React.FC = () => {
  const { state } = useAppContext();
  const { calculatedFund, fundData, currentUser, isLoading, complianceChecks } = state;

  const handleGenerateFullSummary = () => {
    if (calculatedFund && complianceChecks) {
      try {
        generateFullSummaryPDF(calculatedFund, fundData, currentUser, complianceChecks);
      } catch (error) {
        console.error("Errore generazione Riepilogo Generale PDF:", error);
        alert("Errore durante la generazione del Riepilogo Generale PDF. Controllare la console per dettagli.");
      }
    } else {
      alert("Dati del fondo o controlli di conformità non calcolati. Eseguire prima il calcolo completo.");
    }
  };

  const handleGenerateDeterminazione = () => {
    if (calculatedFund) {
      try {
        generateDeterminazioneTXT(calculatedFund, fundData, currentUser); 
      } catch (error) {
          console.error("Errore generazione TXT:", error);
          alert("Errore durante la generazione del TXT. Controllare la console per dettagli.");
      }
    } else {
      alert("Dati del fondo non calcolati. Eseguire prima il calcolo.");
    }
  };

  const handleGenerateFADXLS = () => {
    const { fondoAccessorioDipendenteData, annualData, fondoElevateQualificazioniData } = fundData;
    if (fondoAccessorioDipendenteData) {
      try {
        const isEnteInCondizioniSpeciali = !!annualData.isEnteDissestato || !!annualData.isEnteStrutturalmenteDeficitario || !!annualData.isEnteRiequilibrioFinanziario;
        generateFADXLS(
          fondoAccessorioDipendenteData, 
          annualData.annoRiferimento,
          annualData.simulatoreRisultati,
          isEnteInCondizioniSpeciali,
          fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti
        );
      } catch (error) {
        console.error("Errore generazione XLS Fondo Dipendente:", error);
        alert("Errore durante la generazione del XLS del Fondo Dipendente. Controllare la console per dettagli.");
      }
    } else {
      alert("Dati del Fondo Accessorio Personale Dipendente non disponibili.");
    }
  };


  if (isLoading && !calculatedFund) { 
    return <LoadingSpinner text="Attendere il calcolo del fondo..." />;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Generazione Report e Documentazione</h2>
      
      {!calculatedFund && (
         <Card title="Attenzione">
            <p className="text-[#1b0e0e]">{TEXTS_UI.noDataAvailable} per la generazione dei report. Effettuare prima il calcolo del fondo dalla sezione "Dati Costituzione Fondo".</p>
         </Card>
      )}

      {calculatedFund && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6"> {/* Changed to 1 column for primary report */}
            <Card title="Riepilogo Generale Calcoli e Risultanze" className="bg-[#fffbea] border-[#fde68a]">
                <p className="text-sm text-[#1b0e0e] mb-4">
                    Genera un report PDF completo che include tutti i dati di input, i calcoli dettagliati per ciascun fondo,
                    i risultati del simulatore di incremento e il riepilogo dei controlli di conformità.
                </p>
                <Button variant="primary" onClick={handleGenerateFullSummary} disabled={!calculatedFund || isLoading} size="md">
                    {isLoading ? TEXTS_UI.calculating : "Genera Riepilogo Generale (PDF)"} 
                </Button>
            </Card>
        </div>
      )}

      {calculatedFund && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"> {/* Secondary reports below */}
            <Card title="Atto di Costituzione del Fondo (Testuale)">
            <p className="text-sm text-[#1b0e0e] mb-4">
                Genera una bozza formale della "Determinazione Dirigenziale di Costituzione del Fondo" per l'anno in corso in formato TXT.
                Include un elenco dettagliato delle componenti e i riferimenti normativi.
            </p>
            <Button variant="secondary" onClick={handleGenerateDeterminazione} disabled={!calculatedFund || isLoading} size="md">
                {isLoading ? TEXTS_UI.calculating : "Genera Determinazione (TXT)"} 
            </Button>
            </Card>
            
            <Card title="Esportazione Dati Fondo Personale Dipendente (XLS)">
              <p className="text-sm text-[#1b0e0e] mb-4">
                Scarica un file XLS con il dettaglio analitico delle voci che compongono il Fondo Accessorio del Personale Dipendente.
                Include le singole componenti, i riferimenti normativi e i totali di sezione.
              </p>
              <Button variant="secondary" onClick={handleGenerateFADXLS} disabled={!fundData.fondoAccessorioDipendenteData || isLoading} size="md">
                {isLoading ? TEXTS_UI.calculating : "Genera Dettaglio Fondo Dipendente (XLS)"}
              </Button>
            </Card>

            <Card title="Relazione Illustrativa (Prossimamente)">
            <p className="text-sm text-[#1b0e0e] mb-4">
                Generazione di una bozza di "Relazione Illustrativa" che spieghi obiettivi e criteri di utilizzo del Fondo.
                (Funzionalità in sviluppo)
            </p>
            <Button variant="secondary" disabled size="md">
                Genera Relazione Illustrativa
            </Button>
            </Card>

            <Card title="Relazione Tecnico-Finanziaria (Prossimamente)">
            <p className="text-sm text-[#1b0e0e] mb-4">
                Generazione di una bozza di "Relazione Tecnico-Finanziaria" che attesti la copertura finanziaria e il rispetto dei vincoli.
                (Funzionalità in sviluppo)
            </p>
            <Button variant="secondary" disabled size="md">
                Genera Relazione Tecnico-Finanziaria
            </Button>
            </Card>
            
            <Card title="Esportazione Dati per Conto Annuale (Prossimamente)">
            <p className="text-sm text-[#1b0e0e] mb-4">
                Esporta i dati del fondo in formato compatibile con le tabelle del "Conto Annuale del personale".
                (Funzionalità in sviluppo)
            </p>
            <Button variant="secondary" disabled size="md">
                Esporta Dati (Excel)
            </Button>
            </Card>
        </div>
      )}
    </div>
  );
};
