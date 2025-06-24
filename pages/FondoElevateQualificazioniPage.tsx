// pages/FondoElevateQualificazioniPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { FondoElevateQualificazioniData } from '../types.js';
import { Card } from '../components/shared/Card.js';
import { Input } from '../components/shared/Input.js';
import { TEXTS_UI, RIF_ART17_CCNL2022, RIF_ART23_C5_CCNL2022, RIF_ART79_CCNL2022, RIF_ART23_DLGS75_2017, RIF_ART33_DL34_2019, RIF_DELIBERA_ENTE } from '../constants.js';

const formatCurrency = (value?: number, defaultText = TEXTS_UI.notApplicable) => {
    if (value === undefined || value === null || isNaN(value)) return defaultText;
    return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface FundingItemProps {
  id: keyof FondoElevateQualificazioniData;
  description: string;
  riferimentoNormativo: string;
  value?: number;
  isSubtractor?: boolean; 
  onChange: (field: keyof FondoElevateQualificazioniData, value?: number) => void;
  inputInfo?: string | React.ReactNode;
  isInputInfoWarning?: boolean;
  disabled?: boolean;
}

const FundingItem: React.FC<FundingItemProps> = ({ id, description, riferimentoNormativo, value, isSubtractor = false, onChange, inputInfo, isInputInfoWarning = false, disabled = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onChange(id, val);
  };

  return (
    <div className={`grid grid-cols-12 gap-x-4 gap-y-2 py-4 border-b border-[#f3e7e8] last:border-b-0 items-start ${disabled ? 'opacity-60 bg-[#fcf8f8]' : ''}`}>
      <div className="col-span-12 md:col-span-8">
        <label htmlFor={id} className={`block text-sm text-[#1b0e0e] ${disabled ? 'cursor-not-allowed' : ''}`}>
          {description}
          {isSubtractor && <span className="text-xs text-[#ea2832] ml-1">(da sottrarre)</span>}
        </label>
        {riferimentoNormativo && <p className="text-xs text-[#5f5252] mt-0.5">{riferimentoNormativo}</p>}
      </div>
      <div className="col-span-12 md:col-span-4">
        <Input
          type="number"
          id={id}
          name={id}
          value={value ?? ''}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          inputClassName={`text-right w-full h-11 p-2.5 ${disabled ? 'bg-[#e0d8d8] cursor-not-allowed' : 'bg-[#f3e7e8]'}`}
          containerClassName="mb-0"
          labelClassName="pb-1"
          aria-label={description}
          disabled={disabled}
        />
        {inputInfo && <div className={`text-xs mt-1 ${isInputInfoWarning ? 'text-[#c02128]' : 'text-[#5f5252]'}`}>{inputInfo}</div>}
      </div>
    </div>
  );
};

const SectionTotal: React.FC<{ label: string; total?: number, className?: string }> = ({ label, total, className = "" }) => {
  return (
    <div className={`mt-4 pt-4 border-t-2 border-[#d1c0c1] ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-base font-bold text-[#1b0e0e]">{label}</span>
        <span className="text-lg font-bold text-[#ea2832]">
          {total === undefined || isNaN(total) ? TEXTS_UI.notApplicable : `€ ${total.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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

  const sommaRisorseEQRilevantiLimiteArt23 =
    (data.ris_fondoPO2017 || 0) +
    (data.ris_incrementoConRiduzioneFondoDipendenti || 0) +
    (data.ris_incrementoLimiteArt23c2_DL34 || 0) -
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
    <div className="space-y-8 pb-12">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Fondo delle Elevate Qualificazioni (EQ)</h2>

      <Card title="Risorse per le Elevate Qualificazioni" className="mb-6" isCollapsible defaultCollapsed={false}>
        {/* ... FundingItem components ... */}
        <FundingItem id="ris_fondoPO2017" description="Fondo delle Posizioni Organizzative nell'anno 2017 (valore storico di partenza)" riferimentoNormativo="Valore storico Ente / CCNL Precedente" value={data.ris_fondoPO2017} onChange={handleChange} />
        <FundingItem id="ris_incrementoConRiduzioneFondoDipendenti" description="Incremento del Fondo Elevate Qualificazioni con contestuale riduzione del fondo del personale dipendente" riferimentoNormativo={RIF_DELIBERA_ENTE} value={data.ris_incrementoConRiduzioneFondoDipendenti} onChange={handleChange} />
        <FundingItem id="ris_incrementoLimiteArt23c2_DL34" description="Incremento del Fondo Elevate Qualificazioni nel limite dell'art. 23 c. 2 del D.Lgs. n. 75/2017 (compreso art. 33 DL 34/2019)" riferimentoNormativo={`${RIF_ART23_DLGS75_2017} e ${RIF_ART33_DL34_2019}`} value={data.ris_incrementoLimiteArt23c2_DL34} onChange={handleChange} />
        <FundingItem id="ris_incremento022MonteSalari2018" description="0,22% del monte salari anno 2018 con decorrenza dal 01.01.2022, quota d'incremento del fondo proporzionale (non rileva ai fini del limite)." riferimentoNormativo={RIF_ART79_CCNL2022 + " c.3"} value={data.ris_incremento022MonteSalari2018} onChange={handleChange} />
        <FundingItem id="fin_art23c2_adeguamentoTetto2016" description="Eventuale decurtazione annuale per il rispetto del tetto complessivo del salario accessorio dell'anno 2016." riferimentoNormativo={RIF_ART23_DLGS75_2017} value={data.fin_art23c2_adeguamentoTetto2016} onChange={handleChange} isSubtractor={true}/>
        <SectionTotal label="SOMMA RISORSE PER LE ELEVATE QUALIFICAZIONI (Totale Fondo EQ)" total={sommaRisorseSpecificheEQ} />
      </Card>
      
      <Card title="Distribuzione del fondo EQ" className="mb-6" isCollapsible defaultCollapsed={false}>
        <h4 className="text-base font-bold text-[#1b0e0e] mb-2 py-3 border-b border-[#f3e7e8]">Retribuzione di Posizione (Art. 17 CCNL)</h4>
        {/* ... FundingItem components ... */}
        <FundingItem id="st_art17c2_retribuzionePosizione" description="L’importo della retribuzione di posizione varia da un minimo di € 5.000 ad un massimo di € 18.000 lordi per tredici mensilità, sulla base della graduazione di ciascuna posizione..." riferimentoNormativo={RIF_ART17_CCNL2022 + " c.2"} value={data.st_art17c2_retribuzionePosizione} onChange={handleChange} />
        <FundingItem id="st_art17c3_retribuzionePosizioneArt16c4" description="Nelle ipotesi considerate nell’art. 16, comma 4, l’importo della retribuzione di posizione varia da un minimo di € 3.000 ad un massimo di € 9.500 annui lordi per tredici mensilità." riferimentoNormativo={RIF_ART17_CCNL2022 + " c.3"} value={data.st_art17c3_retribuzionePosizioneArt16c4} onChange={handleChange} />
        <FundingItem id="st_art17c5_interimEQ" description="Nell’ipotesi di conferimento ad interim... ulteriore importo la cui misura può variare dal 15% al 25% del valore economico della retribuzione di posizione..." riferimentoNormativo={RIF_ART17_CCNL2022 + " c.5"} value={data.st_art17c5_interimEQ} onChange={handleChange} />
        <FundingItem id="st_art23c5_maggiorazioneSedi" description="Maggiorazione della retribuzione di posizione per servizio in diverse sedi (fino al 30%)..." riferimentoNormativo={RIF_ART23_C5_CCNL2022} value={data.st_art23c5_maggiorazioneSedi} onChange={handleChange} />

        <h4 className="text-base font-bold text-[#1b0e0e] mb-2 mt-6 py-3 border-b border-t border-[#f3e7e8]">Retribuzione di Risultato (Art. 17 CCNL)</h4>
        <FundingItem 
            id="va_art17c4_retribuzioneRisultato" 
            description="Gli enti definiscono i criteri per la determinazione e per l’erogazione annuale della retribuzione di risultato degli incarichi di EQ, destinando a tale particolare voce retributiva una quota non inferiore al 15% delle risorse complessivamente finalizzate alla erogazione della retribuzione di posizione e di risultato di tutti gli incarichi previsti dal proprio ordinamento." 
            riferimentoNormativo={RIF_ART17_CCNL2022 + " c.4"} 
            value={data.va_art17c4_retribuzioneRisultato} 
            onChange={handleChange} 
            inputInfo={retribuzioneRisultatoInfo}
            isInputInfoWarning={isRetribuzioneRisultatoWarning}
        />
        
        <SectionTotal label="SOMMA DISTRIBUZIONE FONDO EQ" total={sommaDistribuzioneFondoEQ} className="border-t-2 border-[#d1c0c1]" />
        <CalculatedDisplayItem label="Somme non utilizzate" value={sommeNonUtilizzate} infoText="Calcolato come: (Somma Risorse per le Elevate Qualificazioni) - (Somma Distribuzione Fondo EQ)" isWarning={sommeNonUtilizzate < 0} isBold={true}/>
      </Card>

      <Card title="RIEPILOGO LIMITE E DISPONIBILITÀ" className="mb-6 bg-[#fffbea] border-[#fde68a]" isCollapsible defaultCollapsed={false}> {/* Light yellow for this summary */}
        <SectionTotal label="SOMMA RISORSE EQ SOGGETTE AL LIMITE ART. 23 C.2 D.LGS. 75/2017" total={sommaRisorseEQRilevantiLimiteArt23} className="pt-0 border-t-0" />
        <p className="text-xs text-[#5f5252] mt-1 pl-1">
            (Include: Fondo PO 2017, Incremento con riduzione fondo dipendenti, Incremento limite Art. 23c2/DL34. Esclude: 0,22% monte salari 2018. Sottrae: Decurtazione per rispetto tetto 2016).
        </p>
      </Card>
      
      <Card title="TOTALE RISORSE EFFETTIVAMENTE DISPONIBILI PER EQ" className="mb-6 bg-[#f3e7e8] border-[#d1c0c1]">
        <div className="p-4 text-center">
            <span className="text-2xl font-bold text-[#ea2832]">
            {formatCurrency(totaleRisorseDisponibili)}
            </span>
        </div>
        <p className="text-xs text-center text-[#1b0e0e] mt-2">
            Rappresenta il totale delle risorse qualificate per le EQ (cfr. Somma Risorse per le Elevate Qualificazioni), disponibili per la distribuzione nelle voci della card "Distribuzione del fondo EQ".
        </p>
      </Card>

    </div>
  );
};