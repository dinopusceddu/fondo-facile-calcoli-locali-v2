// pages/FundDetailsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Card } from '../components/shared/Card.js';
import { FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData } from '../types.js';
import { TEXTS_UI } from '../constants.js';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.js';
import { fadFieldDefinitions, calculateFadTotals } from './FondoAccessorioDipendentePageHelpers.js';
import { FundingItem } from '../components/shared/FundingItem.js';

const formatCurrency = (value?: number, defaultText = TEXTS_UI.notApplicable) => {
  if (value === undefined || value === null || isNaN(value)) return defaultText;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const SummaryRow: React.FC<{ label: string; value?: number; isGrandTotal?: boolean; className?: string }> = ({ label, value, isGrandTotal = false, className ="" }) => (
  <div className={`flex justify-between items-center py-2 px-3 rounded-md ${isGrandTotal ? 'bg-[#d1c0c1]' : 'bg-white border border-[#f3e7e8]'} ${className}`}>
    <span className={`text-sm font-medium ${isGrandTotal ? 'text-[#1b0e0e] font-bold' : 'text-[#1b0e0e]'}`}>{label}</span>
    <span className={`text-lg font-bold ${isGrandTotal ? 'text-[#ea2832]' : 'text-[#ea2832]'}`}>{formatCurrency(value)}</span>
  </div>
);


export const FundDetailsPage: React.FC = () => {
  const { state } = useAppContext();
  const { calculatedFund, fundData, isLoading } = state;

  if (isLoading && !calculatedFund) { 
    return <LoadingSpinner text="Caricamento dettagli fondo..." />;
  }

  if (!calculatedFund) {
    return (
      <Card title="Dettaglio Calcolo Fondo">
        <p className="text-[#1b0e0e]">{TEXTS_UI.noDataAvailable} Effettuare prima il calcolo del fondo dalla sezione "Dati Costituzione Fondo".</p>
      </Card>
    );
  }
  
  // Calculations for FondoAccessorioDipendenteData
  const fadData = fundData.fondoAccessorioDipendenteData || {} as FondoAccessorioDipendenteData;
  const { 
    simulatoreRisultati, 
    isEnteDissestato,
    isEnteStrutturalmenteDeficitario,
    isEnteRiequilibrioFinanziario,
  } = fundData.annualData;
  const isEnteInCondizioniSpeciali = !!isEnteDissestato || !!isEnteStrutturalmenteDeficitario || !!isEnteRiequilibrioFinanziario;
  const incrementoEQconRiduzioneDipendenti = fundData.fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti;

  const fadTotals = calculateFadTotals(fadData, simulatoreRisultati, isEnteInCondizioniSpeciali, incrementoEQconRiduzioneDipendenti);
  
  // Calculations for FondoElevateQualificazioniData
  const eqData = state.fundData.fondoElevateQualificazioniData || {} as FondoElevateQualificazioniData;
  const totaleRisorseDisponibiliEQ = 
    (eqData.ris_fondoPO2017 || 0) +
    (eqData.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (eqData.ris_incrementoLimiteArt23c2_DL34 || 0) +
    (eqData.ris_incremento022MonteSalari2018 || 0) -
    (eqData.fin_art23c2_adeguamentoTetto2016 || 0);

  // Calculations for FondoSegretarioComunaleData
  const segData = state.fundData.fondoSegretarioComunaleData || {} as FondoSegretarioComunaleData;
  const sommaRisorseStabiliSeg = 
    (segData.st_art3c6_CCNL2011_retribuzionePosizione || 0) +
    (segData.st_art58c1_CCNL2024_differenzialeAumento || 0) +
    (segData.st_art60c1_CCNL2024_retribuzionePosizioneClassi || 0) +
    (segData.st_art60c3_CCNL2024_maggiorazioneComplessita || 0) +
    (segData.st_art60c5_CCNL2024_allineamentoDirigEQ || 0) +
    (segData.st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni || 0) +
    (segData.st_art56c1h_CCNL2024_indennitaReggenzaSupplenza || 0);
  const sommaRisorseVariabiliSeg =
    (segData.va_art56c1f_CCNL2024_dirittiSegreteria || 0) +
    (segData.va_art56c1i_CCNL2024_altriCompensiLegge || 0) +
    (segData.va_art8c3_DL13_2023_incrementoPNRR || 0) +
    (segData.va_art61c2_CCNL2024_retribuzioneRisultato10 || 0) +
    (segData.va_art61c2bis_CCNL2024_retribuzioneRisultato15 || 0) +
    (segData.va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane || 0) +
    (segData.va_art61c3_CCNL2024_incremento022MonteSalari2018 || 0);
  const totaleRisorseSeg = sommaRisorseStabiliSeg + sommaRisorseVariabiliSeg;
  const percentualeCoperturaSeg = segData.fin_percentualeCoperturaPostoSegretario === undefined ? 100 : segData.fin_percentualeCoperturaPostoSegretario;
  const totaleRisorseDisponibiliSeg = totaleRisorseSeg * (percentualeCoperturaSeg / 100);

  // Calculations for FondoDirigenzaData
  let totaleRisorseDisponibiliDir = 0;
  if (fundData.annualData.hasDirigenza) {
    const dirData = state.fundData.fondoDirigenzaData || {} as FondoDirigenzaData;
    const sommaRisorseStabiliDir = 
      (dirData.st_art57c2a_CCNL2020_unicoImporto2020 || 0) +
      (dirData.st_art57c2a_CCNL2020_riaPersonaleCessato2020 || 0) +
      (dirData.st_art56c1_CCNL2020_incremento1_53MonteSalari2015 || 0) +
      (dirData.st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo || 0) +
      (dirData.st_art57c2e_CCNL2020_risorseAutonomeStabili || 0) +
      (dirData.st_art39c1_CCNL2024_incremento2_01MonteSalari2018 || 0);
    const sommaRisorseVariabiliDir =
      (dirData.va_art57c2b_CCNL2020_risorseLeggeSponsor || 0) +
      (dirData.va_art57c2d_CCNL2020_sommeOnnicomprensivita || 0) +
      (dirData.va_art57c2e_CCNL2020_risorseAutonomeVariabili || 0) +
      (dirData.va_art57c3_CCNL2020_residuiAnnoPrecedente || 0) +
      (dirData.va_dl13_2023_art8c3_incrementoPNRR || 0) +
      (dirData.va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020 || 0) +
      (dirData.va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023 || 0) +
      (dirData.va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione || 0) +
      (dirData.va_art33c2_DL34_2019_incrementoDeroga || 0);
    totaleRisorseDisponibiliDir = 
      sommaRisorseStabiliDir + 
      sommaRisorseVariabiliDir +
      (dirData.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016 || 0) -
      (dirData.lim_art4_DL16_2014_misureMancatoRispettoVincoli || 0);
  }

  const grandTotalRisorseDisponibili = 
    fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti +
    totaleRisorseDisponibiliEQ +
    totaleRisorseDisponibiliSeg +
    (fundData.annualData.hasDirigenza ? totaleRisorseDisponibiliDir : 0);

  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Dettaglio Calcolo Fondo Risorse Decentrate {fundData.annualData.annoRiferimento}</h2>
      
      <Card title={`Riepilogo Risorse Disponibili per Fondo (Anno ${fundData.annualData.annoRiferimento})`} className="mb-8 bg-[#fcf8f8]">
        <div className="space-y-3 p-1">
          <SummaryRow label="Totale Risorse - Fondo Personale Dipendente" value={fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti} />
          <SummaryRow label="Totale Risorse - Fondo Elevate Qualificazioni" value={totaleRisorseDisponibiliEQ} />
          <SummaryRow label="Totale Risorse - Risorse Segretario Comunale" value={totaleRisorseDisponibiliSeg} />
          {fundData.annualData.hasDirigenza && (
            <SummaryRow label="Totale Risorse - Fondo Dirigenza" value={totaleRisorseDisponibiliDir} />
          )}
          <div className="pt-3 mt-3 border-t-2 border-[#d1c0c1]">
            <SummaryRow label="TOTALE COMPLESSIVO RISORSE DISPONIBILI (DA TUTTI I FONDI)" value={grandTotalRisorseDisponibili} isGrandTotal />
          </div>
        </div>
      </Card>
      
      <Card title="Verifica Limite Art. 23 D.Lgs. 75/2017 (Fondo 2016)" className="mt-6">
        <div className="space-y-2 text-sm text-[#1b0e0e]">
            <p><strong>Fondo Base Storico (originale 2016):</strong> {formatCurrency(calculatedFund.fondoBase2016)}</p>
            {calculatedFund.incrementoDeterminatoArt23C2 && (
                <p><strong>Adeguamento per Variazione Personale (Art. 23 c.2, base 2018):</strong> {formatCurrency(calculatedFund.incrementoDeterminatoArt23C2.importo)}</p>
            )}
            <p><strong>Limite Effettivo Fondo 2016 (modificato):</strong> 
                <strong className="ml-1 text-base">{formatCurrency(calculatedFund.limiteArt23C2Modificato)}</strong>
            </p>
            <hr className="my-3 border-[#f3e7e8]"/>
            <p><strong>Ammontare Complessivo Risorse Soggette al Limite (Calcolo Globale):</strong> {formatCurrency(calculatedFund.ammontareSoggettoLimite2016)}</p>
            {calculatedFund.superamentoLimite2016 && calculatedFund.superamentoLimite2016 > 0 ? (
            <p className="text-[#ea2832] font-semibold"><strong>Superamento Limite 2016 (Calcolo Globale):</strong> {formatCurrency(calculatedFund.superamentoLimite2016)}</p>
            ) : (
            <p className="text-green-600 font-semibold">Nessun superamento del limite 2016 (Calcolo Globale) rilevato.</p>
            )}
            <hr className="my-3 border-[#f3e7e8]"/>
            <p className="font-semibold text-base">Verifica Somma Fondi Specifici:</p>
            <p><strong>Somma Risorse Soggette al Limite dai Fondi Specifici:</strong> {formatCurrency(calculatedFund.totaleRisorseSoggetteAlLimiteDaFondiSpecifici)}</p>
            {calculatedFund.totaleRisorseSoggetteAlLimiteDaFondiSpecifici > (calculatedFund.limiteArt23C2Modificato ?? 0) ? (
                 <p className="text-[#ea2832] font-semibold"><strong>Superamento Limite 2016 (Fondi Specifici):</strong> {formatCurrency(calculatedFund.totaleRisorseSoggetteAlLimiteDaFondiSpecifici - (calculatedFund.limiteArt23C2Modificato ?? 0))}</p>
            ) : (
                 <p className="text-green-600 font-semibold">Nessun superamento del limite 2016 (Fondi Specifici) rilevato.</p>
            )}

            <p className="text-xs text-[#5f5252] mt-2">Nota: Le risorse marcate come "(Escluso Lim. 2016)" nel calcolo globale non concorrono al calcolo dell'ammontare soggetto al limite. L'adeguamento per variazione personale modifica il tetto di spesa.</p>
        </div>
      </Card>
      
      <Card 
        title={`Dettaglio Completo Fondo Accessorio Personale Dipendente (Anno ${fundData.annualData.annoRiferimento})`} 
        className="bg-[#fcf8f8] border-[#e0e0e0]" 
        isCollapsible={true} 
        defaultCollapsed={true}
      >
        <div className="mb-6">
            <h4 className="text-lg font-bold text-[#1b0e0e] mb-2 p-3 bg-[#f3e7e8] rounded-t-md">Risorse Stabili (da Fondo Personale Dipendente)</h4>
            {fadFieldDefinitions.filter(def => def.section === 'stabili').map(def => (
                <FundingItem<FondoAccessorioDipendenteData>
                    key={def.key}
                    id={def.key} 
                    description={def.description}
                    value={fadData[def.key]} 
                    onChange={()=>{}}
                    isSubtractor={def.isSubtractor}
                    disabled={true}
                />
            ))}
            <div className="flex justify-between items-center py-3 px-3 mt-2 font-semibold bg-[#f3e7e8] rounded-b-md">
                <span className="text-sm text-[#1b0e0e]">Totale Risorse Stabili (da Fondo Personale Dipendente)</span>
                <span className="text-sm text-[#ea2832]">{formatCurrency(fadTotals.sommaStabili_Dipendenti)}</span>
            </div>
        </div>
      </Card>

    </div>
  );
};
