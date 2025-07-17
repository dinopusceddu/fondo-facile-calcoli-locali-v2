// pages/FondoElevateQualificazioniPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { FondoElevateQualificazioniData } from '../types.js';
import { Card } from '../components/shared/Card.js';
import { TEXTS_UI, RIF_ART17_CCNL2022, RIF_ART23_C5_CCNL2022, RIF_ART79_CCNL2022, RIF_ART23_DLGS75_2017, RIF_ART33_DL34_2019, RIF_DELIBERA_ENTE } from '../constants.js';
import { FundingItem } from '../components/shared/FundingItem.js';


const formatCurrency = (value?: number, defaultText = TEXTS_UI.notApplicable) => {
    if (value === undefined || value === null || isNaN(value)) return defaultText;
    return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const SectionTotal: React.FC<{ label: string; total?: number, className?: string }> = ({ label, total, className = "" }) => {
  return (
    <div className={`mt-4 pt-4 border-t-2 border-[#d1c0c1] ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-[#1b0e0e]">{label}</span>
        <span className="text-lg font-bold text-[#ea2832]">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};

const CalculatedDisplayItem: React.FC<{ label: string; value?: number; infoText?: string | React.ReactNode; isWarning?: boolean; isBold?: boolean }> = ({ label, value, infoText, isWarning = false, isBold = false }) => (
    <div className={`grid grid-cols-12 gap-x-4 gap-y-1 py-3 items-center ${isBold ? 'bg-[#f3e7e8]' : 'bg-white'}`}>
      <div className="col-span-12 md:col-span-8">
        <p className={`block text-sm ${isBold ? 'font-bold' : 'font-medium'} text-[#1b0e0e]`}>{label}</p>
        {infoText && <div className={`text-xs ${isWarning ? 'text-[#c02128]' : 'text-[#5f5252]'}`}>{infoText}</div>}
      </div>
      <div className="col-span-12 md:col-span-4 text-right">
        <p className={`text-sm ${isBold ? 'font-bold' : 'font-semibold'} ${isWarning ? 'text-[#c02128]' : 'text-[#1b0e0e]'}`}>
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  );


export const FondoElevateQualificazioniPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const data = state.fundData.fondoElevateQualificazioniData || {} as FondoElevateQualificazioniData;

  const handleChange = (field: keyof FondoElevateQualificazioniData, value?: number) => {
    dispatch({ type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA', payload: { [field]: value } });
  };
  
  const sommaRisorseSpecificheEQ = 
    (data.ris_fondoPO2017 || 0) +
    (data.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (data.ris_incrementoLimiteArt23c2_DL34 || 0) +
    (data.ris_incremento022MonteSalari2018 || 0) -
    (data.fin_art23c2_adeguamentoTetto2016 || 0);

  const sommaDistribuzioneFondoEQ = 
    (data.st_art17c2_retribuzionePosizione || 0) +
    (data.st_art17c3_retribuzionePosizioneArt16c4 || 0) +
    (data.st_art17c5_interimEQ || 0) +
    (data.st_art23c5_maggiorazioneSedi || 0) +
    (data.va_art17c4_retribuzioneRisultato || 0);
    
  const totaleRisorseDisponibili = sommaRisorseSpecificheEQ; 
  const sommeNonUtilizzate = sommaRisorseSpecificheEQ - sommaDistribuzioneFondoEQ;
  const minRetribuzioneRisultato = sommaRisorseSpecificheEQ * 0.15;
  
  let retribuzioneRisultatoInfo: string | React.ReactNode = `Minimo atteso: ${formatCurrency(minRetribuzioneRisultato)}.`;
  let isRetribuzioneRisultatoWarning = false;

  if (data.va_art17c4_retribuzioneRisultato !== undefined && data.va_art17c4_retribuzioneRisultato < minRetribuzioneRisultato && minRetribuzioneRisultato > 0) {
    isRetribuzioneRisultatoWarning = true;
    retribuzioneRisultatoInfo = (
        <>
            Minimo atteso: {formatCurrency(minRetribuzioneRisultato)}.<br/>
            <strong className="text-[#c02128]">Attenzione: l'importo è inferiore al 15% delle Risorse Specifiche EQ.</strong>
        </>
    );
  } else if (minRetribuzioneRisultato <= 0 && sommaRisorseSpecificheEQ > 0) {
     retribuzioneRisultatoInfo = "Calcolare prima le Risorse per le Elevate Qualificazioni per determinare il minimo.";
  } else if (sommaRisorseSpecificheEQ <= 0) {
     retribuzioneRisultatoInfo = "Nessuna risorsa specifica EQ definita.";
  }


  return (
    <div className="space-y-8 pb-20">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Fondo delle Elevate Qualificazioni (EQ)</h2>

      <Card title="Risorse per le Elevate Qualificazioni" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <FundingItem<FondoElevateQualificazioniData> id="ris_fondoPO2017" description="Fondo delle Posizioni Organizzative nell'anno 2017 (valore storico di partenza)" riferimentoNormativo="Valore storico Ente / CCNL Precedente" value={data.ris_fondoPO2017} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="ris_incrementoConRiduzioneFondoDipendenti" description="Incremento del Fondo Elevate Qualificazioni con contestuale riduzione del fondo del personale dipendente" riferimentoNormativo={RIF_DELIBERA_ENTE} value={data.ris_incrementoConRiduzioneFondoDipendenti} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="ris_incrementoLimiteArt23c2_DL34" description="Incremento del Fondo Elevate Qualificazioni nel limite dell'art. 23 c. 2 del D.Lgs. n. 75/2017 (compreso art. 33 DL 34/2019)" riferimentoNormativo={`${RIF_ART23_DLGS75_2017} e ${RIF_ART33_DL34_2019}`} value={data.ris_incrementoLimiteArt23c2_DL34} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="ris_incremento022MonteSalari2018" description="0,22% del monte salari anno 2018 con decorrenza dal 01.01.2022, quota d'incremento del fondo proporzionale (non rileva ai fini del limite)." riferimentoNormativo={RIF_ART79_CCNL2022 + " c.3"} value={data.ris_incremento022MonteSalari2018} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="fin_art23c2_adeguamentoTetto2016" description="Eventuale decurtazione annuale per il rispetto del tetto complessivo del salario accessorio dell'anno 2016." riferimentoNormativo={RIF_ART23_DLGS75_2017} value={data.fin_art23c2_adeguamentoTetto2016} onChange={handleChange} isSubtractor={true}/>
        <SectionTotal label="SOMMA RISORSE PER LE ELEVATE QUALIFICAZIONI (Totale Fondo EQ)" total={sommaRisorseSpecificheEQ} />
      </Card>
      
      <Card title="Distribuzione del fondo EQ" className="mb-6" isCollapsible={true} defaultCollapsed={true}>
        <h4 className="text-base font-bold text-[#1b0e0e] mb-2 py-3 border-b border-[#f3e7e8]">Retribuzione di Posizione (Art. 17 CCNL)</h4>
        <FundingItem<FondoElevateQualificazioniData> id="st_art17c2_retribuzionePosizione" description="L’importo della retribuzione di posizione varia da un minimo di € 5.000 ad un massimo di € 18.000 lordi per tredici mensilità, sulla base della graduazione di ciascuna posizione..." riferimentoNormativo={RIF_ART17_CCNL2022 + " c.2"} value={data.st_art17c2_retribuzionePosizione} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="st_art17c3_retribuzionePosizioneArt16c4" description="Nelle ipotesi considerate nell’art. 16, comma 4, l’importo della retribuzione di posizione varia da un minimo di € 3.000 ad un massimo di € 9.500 annui lordi per tredici mensilità." riferimentoNormativo={RIF_ART17_CCNL2022 + " c.3"} value={data.st_art17c3_retribuzionePosizioneArt16c4} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="st_art17c5_interimEQ" description="Nell’ipotesi di conferimento ad interim... ulteriore importo la cui misura può variare dal 15% al 25% del valore economico della retribuzione di posizione..." riferimentoNormativo={RIF_ART17_CCNL2022 + " c.5"} value={data.st_art17c5_interimEQ} onChange={handleChange} />
        <FundingItem<FondoElevateQualificazioniData> id="st_art23c5_maggiorazioneSedi" description="Maggiorazione della retribuzione di posizione per servizio in diverse sedi (fino al 30%)..." riferimentoNormativo={RIF_ART23_C5_CCNL2022} value={data.st_art23c5_maggiorazioneSedi} onChange={handleChange} />

        <h4 className="text-base font-bold text-[#1b0e0e] mb-2 mt-6 py-3 border-b border-t border-[#f3e7e8]">Retribuzione di Risultato (Art. 17 CCNL)</h4>
        <FundingItem<FondoElevateQualificazioniData>
            id="va_art17c4_retribuzioneRisultato" 
            description="Gli enti definiscono i criteri per la determinazione e per l’erogazione annuale della retribuzione di risultato degli incarichi di EQ, destinando a tale particolare voce retributiva una quota non inferiore al 15% delle risorse complessivamente finalizzate alla erogazione della retribuzione di posizione e di risultato di tutti gli incarichi previsti dal proprio ordinamento." 
            riferimentoNormativo={RIF_ART17_CCNL2022 + " c.4"} 
            value={data.va_art17c4_retribuzioneRisultato} 
            onChange={handleChange} 
            inputInfo={retribuzioneRisultatoInfo}
        />
        
        <SectionTotal label="SOMMA DISTRIBUZIONE FONDO EQ" total={sommaDistribuzioneFondoEQ} className="border-t-2 border-[#d1c0c1]" />
        <CalculatedDisplayItem label="Somme non utilizzate" value={sommeNonUtilizzate} infoText="Calcolato come: (Somma Risorse per le Elevate Qualificazioni) - (Somma Distribuzione Fondo EQ)" isWarning={sommeNonUtilizzate < 0} isBold={true}/>
      </Card>
      
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-[#fcf8f8]/80 backdrop-blur-sm border-t border-t-[#f3e7e8] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-[960px] mx-auto flex justify-between items-center">
            <span className="text-lg font-bold text-[#1b0e0e]">TOTALE RISORSE DISPONIBILI:</span>
            <span className="text-2xl font-bold text-[#ea2832]">
                {formatCurrency(totaleRisorseDisponibili)}
            </span>
        </div>
      </div>

    </div>
  );
};