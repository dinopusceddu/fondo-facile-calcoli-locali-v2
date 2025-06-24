
// pages/FundDetailsPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Card } from '../components/shared/Card.js';
import { FundComponent, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData } from '../types.js';
import { TEXTS_UI } from '../constants.js';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.js';

const formatCurrency = (value?: number, notApplicableText = TEXTS_UI.notApplicable) => {
  if (value === undefined || value === null || isNaN(value)) return notApplicableText;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const FundComponentTable: React.FC<{ title: string; components: FundComponent[]; total?: number, totalLabel?: string }> = ({ title, components, total, totalLabel }) => {
  if (!components || components.length === 0 && total === undefined) return null;

  return (
    <Card title={title} className="mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-[#fcf8f8]">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#1b0e0e] uppercase tracking-wider">Descrizione</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#1b0e0e] uppercase tracking-wider">Riferimento Normativo</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-[#1b0e0e] uppercase tracking-wider">Importo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3e7e8]">
            {components.map((item, index) => (
              <tr key={index} className={item.esclusoDalLimite2016 ? 'bg-[#fffbea]' : 'hover:bg-[#fcf8f8]'}>
                <td className="px-5 py-3 whitespace-nowrap text-sm text-[#1b0e0e]">{item.descrizione}{item.esclusoDalLimite2016 ? <span className="text-xs text-[#994d51] ml-1">(Escluso Lim. 2016)</span> : ''}</td>
                <td className="px-5 py-3 whitespace-nowrap text-sm text-[#5f5252]">{item.riferimento}</td> {/* Slightly muted for refs */}
                <td className="px-5 py-3 whitespace-nowrap text-sm text-[#1b0e0e] text-right">{formatCurrency(item.importo)}</td>
              </tr>
            ))}
            {total !== undefined && totalLabel && (
                <tr className="bg-[#f3e7e8] font-bold">
                    <td colSpan={2} className="px-5 py-3 text-sm text-[#1b0e0e] text-right">{totalLabel}</td>
                    <td className="px-5 py-3 text-sm text-[#1b0e0e] text-right">{formatCurrency(total)}</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

interface DetailedFundItemRowProps {
  description: string;
  riferimento?: string;
  value?: number;
  isRelevantToArt23Limit: boolean;
  isSubtractor?: boolean;
  isEnteInCondizioniSpeciali?: boolean;
  isDisabledByCondizioniSpeciali?: boolean;
}

const DetailedFundItemRow: React.FC<DetailedFundItemRowProps> = ({ 
    description, 
    riferimento, 
    value, 
    isRelevantToArt23Limit, 
    isSubtractor,
    isDisabledByCondizioniSpeciali
}) => {
  const effectiveValue = isDisabledByCondizioniSpeciali ? 0 : value;
  const bgColor = isRelevantToArt23Limit ? 'bg-[#fff7ed]' : 'bg-[#eff6ff]'; // Orange-50 / Blue-50
  const textColor = isRelevantToArt23Limit ? 'text-[#9a3412]' : 'text-[#1e40af]'; // Orange-800 / Blue-800
  const valueColor = isRelevantToArt23Limit ? 'text-[#c2410c]' : 'text-[#1d4ed8]'; // Orange-700 / Blue-700 for value
  const borderColor = isRelevantToArt23Limit ? 'border-[#fed7aa]' : 'border-[#bfdbfe]'; // Orange-200 / Blue-200

  return (
    <div className={`p-3 border-b ${borderColor} ${bgColor} ${isDisabledByCondizioniSpeciali ? 'opacity-70' : ''}`}>
      <div className="grid grid-cols-12 gap-x-4 items-center">
        <div className="col-span-12 md:col-span-7">
          <p className={`text-sm font-medium ${textColor}`}>
            {description}
            {isSubtractor && <span className="text-xs text-[#c02128] ml-1">(da sottrarre)</span>}
          </p>
          {riferimento && <p className="text-xs text-[#5f5252] mt-0.5">{riferimento}</p>}
           {isDisabledByCondizioniSpeciali && <p className="text-xs text-yellow-700 mt-0.5">Disabilitato a causa dello stato dell'ente.</p>}
        </div>
        <div className="col-span-12 md:col-span-5 text-right">
          <span className={`text-sm font-semibold ${valueColor}`}>
            {isSubtractor && effectiveValue !== undefined && effectiveValue > 0 ? "- " : ""}
            {formatCurrency(effectiveValue, '')}
          </span>
        </div>
      </div>
    </div>
  );
};

const SectionSubTotal: React.FC<{ label: string; total: number; className?: string}> = ({label, total, className=""}) => (
    <div className={`flex justify-between items-center py-3 px-3 mt-2 font-semibold ${className}`}>
        <span className="text-sm text-[#1b0e0e]">{label}</span>
        <span className="text-sm text-[#ea2832]">{formatCurrency(total)}</span>
    </div>
);

const fadFieldDefinitions: Array<{
  key: keyof FondoAccessorioDipendenteData;
  description: string;
  riferimento: string;
  isRelevantToArt23Limit: boolean;
  isSubtractor?: boolean;
  section: 'stabili' | 'vs_soggette' | 'vn_non_soggette' | 'fin_decurtazioni' | 'cl_limiti';
  isDisabledByCondizioniSpeciali?: boolean; 
}> = [
  // Stabili
  { key: 'st_art79c1_art67c1_unicoImporto2017', description: "Unico importo consolidato 2017", riferimento: "Art. 79 c.1 (rif. Art. 67 c.1 CCNL 2018)", isRelevantToArt23Limit: true, section: 'stabili' },
  { key: 'st_art79c1_art67c1_alteProfessionalitaNonUtil', description: "Alte professionalità non utilizzate (se non in unico importo)", riferimento: "Art. 79 c.1 (rif. Art. 67 c.1 CCNL 2018)", isRelevantToArt23Limit: true, section: 'stabili' },
  { key: 'st_art79c1_art67c2a_incr8320', description: "Incremento €83,20/unità (personale 31.12.2015)", riferimento: "Art. 79 c.1 (rif. Art. 67 c.2a CCNL 2018)", isRelevantToArt23Limit: false, section: 'stabili' },
  { key: 'st_art79c1_art67c2b_incrStipendialiDiff', description: "Incrementi stipendiali differenziali (Art. 64 CCNL 2018)", riferimento: "Art. 79 c.1 (rif. Art. 67 c.2b CCNL 2018)", isRelevantToArt23Limit: false, section: 'stabili' },
  { key: 'st_art79c1_art4c2_art67c2c_integrazioneRIA', description: "Integrazione RIA personale cessato anno precedente", riferimento: "Art. 79 c.1 (rif. Art. 67 c.2c CCNL 2018)", isRelevantToArt23Limit: true, section: 'stabili' },
  { key: 'st_art79c1_art67c2d_risorseRiassorbite165', description: "Risorse riassorbite (Art. 2 c.3 D.Lgs 165/01)", riferimento: "Art. 79 c.1 (rif. Art. 67 c.2d CCNL 2018)", isRelevantToArt23Limit: true, section: 'stabili' },
  { key: 'st_art79c1_art15c1l_art67c2e_personaleTrasferito', description: "Risorse personale trasferito (decentramento)", riferimento: "Art. 79 c.1 (rif. Art. 67 c.2e CCNL 2018)", isRelevantToArt23Limit: true, section: 'stabili' },
  { key: 'st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig', description: "Regioni: riduzione stabile posti dirig. (fino a 0,2% MS Dir.)", riferimento: "Art. 79 c.1 (rif. Art. 67 c.2f CCNL 2018)", isRelevantToArt23Limit: true, section: 'stabili' },
  { key: 'st_art79c1_art14c3_art67c2g_riduzioneStraordinario', description: "Riduzione stabile straordinario", riferimento: "Art. 79 c.1 (rif. Art. 67 c.2g CCNL 2018)", isRelevantToArt23Limit: true, section: 'stabili' },
  { key: 'st_taglioFondoDL78_2010', description: "Taglio fondo DL 78/2010 (se non già in unico importo)", riferimento: "Art. 9 c.2bis DL 78/2010", isRelevantToArt23Limit: true, isSubtractor: true, section: 'stabili' },
  { key: 'st_riduzioniPersonaleATA_PO_Esternalizzazioni', description: "Riduzioni per pers. ATA, PO, esternalizzazioni, trasferimenti", riferimento: "Disposizioni specifiche", isRelevantToArt23Limit: true, isSubtractor: true, section: 'stabili' },
  { key: 'st_art67c1_decurtazionePO_AP_EntiDirigenza', description: "Decurtazione PO/AP enti con dirigenza (Art. 67 c.1 CCNL 2018)", riferimento: "Art. 67 c.1 CCNL 2018", isRelevantToArt23Limit: true, isSubtractor: true, section: 'stabili' },
  { key: 'st_art79c1b_euro8450', description: "Incremento €84,50/unità (personale 31.12.2018, da 01.01.2021)", riferimento: "Art. 79 c.1b CCNL 2022", isRelevantToArt23Limit: false, section: 'stabili' },
  { key: 'st_art79c1c_incrementoStabileConsistenzaPers', description: "Incremento stabile per consistenza personale (Art. 23c2)", riferimento: "Art. 79 c.1c CCNL 2022", isRelevantToArt23Limit: true, section: 'stabili' },
  { key: 'st_art79c1d_differenzialiStipendiali2022', description: "Differenziali stipendiali personale in servizio 2022", riferimento: "Art. 79 c.1d CCNL 2022", isRelevantToArt23Limit: false, section: 'stabili' },
  { key: 'st_art79c1bis_diffStipendialiB3D3', description: "Differenze stipendiali personale B3 e D3", riferimento: "Art. 79 c.1-bis CCNL 2022", isRelevantToArt23Limit: false, section: 'stabili' },
  { key: 'st_incrementoDecretoPA', description: "Incremento Decreto PA (da simulatore)", riferimento: "DL PA / Misure Urgenti", isRelevantToArt23Limit: true, section: 'stabili' },
  { key: 'st_riduzionePerIncrementoEQ', description: "Riduzione per incremento risorse EQ", riferimento: "Art. 7 c.4u CCNL 2022", isRelevantToArt23Limit: true, isSubtractor: true, section: 'stabili' },
  // Variabili Soggette
  { key: 'vs_art4c3_art15c1k_art67c3c_recuperoEvasione', description: "Recupero evasione ICI, ecc.", riferimento: "Art. 67 c.3c CCNL 2018", isRelevantToArt23Limit: true, section: 'vs_soggette' },
  { key: 'vs_art4c2_art67c3d_integrazioneRIAMensile', description: "Integrazione RIA mensile personale cessato in anno", riferimento: "Art. 67 c.3d CCNL 2018", isRelevantToArt23Limit: true, section: 'vs_soggette' },
  { key: 'vs_art67c3g_personaleCaseGioco', description: "Risorse personale case da gioco", riferimento: "Art. 67 c.3g CCNL 2018", isRelevantToArt23Limit: true, section: 'vs_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vs_art79c2b_max1_2MonteSalari1997', description: "Max 1,2% monte salari 1997", riferimento: "Art. 79 c.2b CCNL 2022", isRelevantToArt23Limit: true, section: 'vs_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vs_art67c3k_integrazioneArt62c2e_personaleTrasferito', description: "Integrazione per personale trasferito (variabile)", riferimento: "Art. 67 c.3k CCNL 2018", isRelevantToArt23Limit: true, section: 'vs_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vs_art79c2c_risorseScelteOrganizzative', description: "Risorse per scelte organizzative (anche TD)", riferimento: "Art. 79 c.2c CCNL 2022", isRelevantToArt23Limit: true, section: 'vs_soggette', isDisabledByCondizioniSpeciali: true },
  // Variabili Non Soggette
  { key: 'vn_art15c1d_art67c3a_sponsorConvenzioni', description: "Sponsorizzazioni, convenzioni, servizi non essenziali", riferimento: "Art. 67 c.3a CCNL 2018", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vn_art54_art67c3f_rimborsoSpeseNotifica', description: "Quota rimborso spese notifica (messi)", riferimento: "Art. 67 c.3f CCNL 2018", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione', description: "Piani di razionalizzazione (Art. 16 DL 98/11)", riferimento: "Art. 67 c.3b CCNL 2018", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vn_art15c1k_art67c3c_incentiviTecniciCondoni', description: "Incentivi funzioni tecniche, condoni, ecc.", riferimento: "Art. 67 c.3c CCNL 2018", isRelevantToArt23Limit: false, section: 'vn_non_soggette' },
  { key: 'vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti', description: "Incentivi spese giudizio, compensi censimento/ISTAT", riferimento: "Art. 67 c.3c CCNL 2018", isRelevantToArt23Limit: false, section: 'vn_non_soggette' },
  { key: 'vn_art15c1m_art67c3e_risparmiStraordinario', description: "Risparmi da disciplina straordinario (Art. 14 CCNL)", riferimento: "Art. 67 c.3e CCNL 2018", isRelevantToArt23Limit: false, section: 'vn_non_soggette' },
  { key: 'vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale', description: "Regioni/Città Metro: Incremento % (Art. 23 c.4 D.Lgs 75/17)", riferimento: "Art. 67 c.3j CCNL 2018", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vn_art80c1_sommeNonUtilizzateStabiliPrec', description: "Somme non utilizzate esercizi precedenti (stabili)", riferimento: "Art. 80 c.1 CCNL 2022", isRelevantToArt23Limit: false, section: 'vn_non_soggette' },
  { key: 'vn_l145_art1c1091_incentiviRiscossioneIMUTARI', description: "Incentivi riscossione IMU/TARI (L. 145/18)", riferimento: "L. 145/2018 Art.1 c.1091", isRelevantToArt23Limit: false, section: 'vn_non_soggette' },
  { key: 'vn_l178_art1c870_risparmiBuoniPasto2020', description: "Risparmi buoni pasto 2020 (L. 178/20)", riferimento: "L. 178/2020 Art.1 c.870", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga', description: "Risorse accessorie per assunzioni in deroga", riferimento: "DL 135/2018 Art.11 c.1b", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vn_art79c3_022MonteSalari2018_da2022Proporzionale', description: "0,22% MS 2018 (da 01.01.2022, quota proporzionale)", riferimento: "Art. 79 c.3 CCNL 2022", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vn_art79c1b_euro8450_unaTantum2021_2022', description: "€84,50/unità (pers. 31.12.18, una tantum 2021-22)", riferimento: "Art. 79 c.1b CCNL 2022", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vn_art79c3_022MonteSalari2018_da2022UnaTantum2022', description: "0,22% MS 2018 (da 01.01.2022, una tantum 2022)", riferimento: "Art. 79 c.3 CCNL 2022", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  { key: 'vn_dl13_art8c3_incrementoPNRR_max5stabile2016', description: "Incremento PNRR (max 5% fondo stabile 2016)", riferimento: "DL 13/2023 Art.8 c.3", isRelevantToArt23Limit: false, section: 'vn_non_soggette', isDisabledByCondizioniSpeciali: true },
  // Finali e Limiti
  { key: 'fin_art4_dl16_misureMancatoRispettoVincoli', description: "Misure per mancato rispetto vincoli (Art. 4 DL 16/14)", riferimento: "Art. 4 DL 16/2014", isRelevantToArt23Limit: false, isSubtractor: true, section: 'fin_decurtazioni' },
  { key: 'cl_art23c2_decurtazioneIncrementoAnnualeTetto2016', description: "Decurtazione annuale per rispetto tetto 2016", riferimento: "Art. 23 c.2 D.Lgs 75/2017", isRelevantToArt23Limit: true, isSubtractor: true, section: 'cl_limiti' },
];

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
  const simResults = fundData.annualData.simulatoreRisultati;
  const maxIncrementoDecretoPA_FAD = simResults?.fase5_incrementoNettoEffettivoFondo ?? 0;
  const isIncrementoDecretoPAActive_FAD = maxIncrementoDecretoPA_FAD > 0;
  
  const { 
    isEnteDissestato,
    isEnteStrutturalmenteDeficitario,
    isEnteRiequilibrioFinanziario,
   } = fundData.annualData;
  const isEnteInCondizioniSpeciali = !!isEnteDissestato || !!isEnteStrutturalmenteDeficitario || !!isEnteRiequilibrioFinanziario;

  const getEffectiveValue = (key: keyof FondoAccessorioDipendenteData, originalValue?: number) => {
    const definition = fadFieldDefinitions.find(def => def.key === key);
    if (definition?.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali) {
        return 0;
    }
    return originalValue || 0;
  };

  const sommaStabili_Dipendenti = 
    getEffectiveValue('st_art79c1_art67c1_unicoImporto2017', fadData.st_art79c1_art67c1_unicoImporto2017) +
    getEffectiveValue('st_art79c1_art67c1_alteProfessionalitaNonUtil', fadData.st_art79c1_art67c1_alteProfessionalitaNonUtil) +
    getEffectiveValue('st_art79c1_art67c2a_incr8320', fadData.st_art79c1_art67c2a_incr8320) +
    getEffectiveValue('st_art79c1_art67c2b_incrStipendialiDiff', fadData.st_art79c1_art67c2b_incrStipendialiDiff) +
    getEffectiveValue('st_art79c1_art4c2_art67c2c_integrazioneRIA', fadData.st_art79c1_art4c2_art67c2c_integrazioneRIA) +
    getEffectiveValue('st_art79c1_art67c2d_risorseRiassorbite165', fadData.st_art79c1_art67c2d_risorseRiassorbite165) +
    getEffectiveValue('st_art79c1_art15c1l_art67c2e_personaleTrasferito', fadData.st_art79c1_art15c1l_art67c2e_personaleTrasferito) +
    getEffectiveValue('st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig', fadData.st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig) +
    getEffectiveValue('st_art79c1_art14c3_art67c2g_riduzioneStraordinario', fadData.st_art79c1_art14c3_art67c2g_riduzioneStraordinario) -
    getEffectiveValue('st_taglioFondoDL78_2010', fadData.st_taglioFondoDL78_2010) - 
    getEffectiveValue('st_riduzioniPersonaleATA_PO_Esternalizzazioni', fadData.st_riduzioniPersonaleATA_PO_Esternalizzazioni) - 
    getEffectiveValue('st_art67c1_decurtazionePO_AP_EntiDirigenza', fadData.st_art67c1_decurtazionePO_AP_EntiDirigenza) + 
    getEffectiveValue('st_art79c1b_euro8450', fadData.st_art79c1b_euro8450) +
    getEffectiveValue('st_art79c1c_incrementoStabileConsistenzaPers', fadData.st_art79c1c_incrementoStabileConsistenzaPers) + 
    getEffectiveValue('st_art79c1d_differenzialiStipendiali2022', fadData.st_art79c1d_differenzialiStipendiali2022) +
    getEffectiveValue('st_art79c1bis_diffStipendialiB3D3', fadData.st_art79c1bis_diffStipendialiB3D3) +
    (isIncrementoDecretoPAActive_FAD ? getEffectiveValue('st_incrementoDecretoPA', fadData.st_incrementoDecretoPA) : 0) -
    getEffectiveValue('st_riduzionePerIncrementoEQ', fadData.st_riduzionePerIncrementoEQ);

  const sommaVariabiliSoggette_Dipendenti =
    getEffectiveValue('vs_art4c3_art15c1k_art67c3c_recuperoEvasione', fadData.vs_art4c3_art15c1k_art67c3c_recuperoEvasione) +
    getEffectiveValue('vs_art4c2_art67c3d_integrazioneRIAMensile', fadData.vs_art4c2_art67c3d_integrazioneRIAMensile) +
    getEffectiveValue('vs_art67c3g_personaleCaseGioco', fadData.vs_art67c3g_personaleCaseGioco) +
    getEffectiveValue('vs_art79c2b_max1_2MonteSalari1997', fadData.vs_art79c2b_max1_2MonteSalari1997) +
    getEffectiveValue('vs_art67c3k_integrazioneArt62c2e_personaleTrasferito', fadData.vs_art67c3k_integrazioneArt62c2e_personaleTrasferito) +
    getEffectiveValue('vs_art79c2c_risorseScelteOrganizzative', fadData.vs_art79c2c_risorseScelteOrganizzative);
    
  const sommaVariabiliNonSoggette_Dipendenti = 
    getEffectiveValue('vn_art15c1d_art67c3a_sponsorConvenzioni', fadData.vn_art15c1d_art67c3a_sponsorConvenzioni) +
    getEffectiveValue('vn_art54_art67c3f_rimborsoSpeseNotifica', fadData.vn_art54_art67c3f_rimborsoSpeseNotifica) +
    getEffectiveValue('vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione', fadData.vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione) +
    getEffectiveValue('vn_art15c1k_art67c3c_incentiviTecniciCondoni', fadData.vn_art15c1k_art67c3c_incentiviTecniciCondoni) +
    getEffectiveValue('vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti', fadData.vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti) +
    getEffectiveValue('vn_art15c1m_art67c3e_risparmiStraordinario', fadData.vn_art15c1m_art67c3e_risparmiStraordinario) +
    getEffectiveValue('vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale', fadData.vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale) +
    getEffectiveValue('vn_art80c1_sommeNonUtilizzateStabiliPrec', fadData.vn_art80c1_sommeNonUtilizzateStabiliPrec) +
    getEffectiveValue('vn_l145_art1c1091_incentiviRiscossioneIMUTARI', fadData.vn_l145_art1c1091_incentiviRiscossioneIMUTARI) +
    getEffectiveValue('vn_l178_art1c870_risparmiBuoniPasto2020', fadData.vn_l178_art1c870_risparmiBuoniPasto2020) +
    getEffectiveValue('vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga', fadData.vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga) +
    getEffectiveValue('vn_art79c3_022MonteSalari2018_da2022Proporzionale', fadData.vn_art79c3_022MonteSalari2018_da2022Proporzionale) +
    getEffectiveValue('vn_art79c1b_euro8450_unaTantum2021_2022', fadData.vn_art79c1b_euro8450_unaTantum2021_2022) +
    getEffectiveValue('vn_art79c3_022MonteSalari2018_da2022UnaTantum2022', fadData.vn_art79c3_022MonteSalari2018_da2022UnaTantum2022) +
    getEffectiveValue('vn_dl13_art8c3_incrementoPNRR_max5stabile2016', fadData.vn_dl13_art8c3_incrementoPNRR_max5stabile2016);

  const altreRisorseDecurtazioniFinali_Dipendenti = getEffectiveValue('fin_art4_dl16_misureMancatoRispettoVincoli', fadData.fin_art4_dl16_misureMancatoRispettoVincoli) || 0;
  const decurtazioniLimiteSalarioAccessorio_Dipendenti = getEffectiveValue('cl_art23c2_decurtazioneIncrementoAnnualeTetto2016', fadData.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016) || 0;

  const totaleRisorseDisponibiliContrattazione_Dipendenti = 
    sommaStabili_Dipendenti + 
    sommaVariabiliSoggette_Dipendenti + 
    sommaVariabiliNonSoggette_Dipendenti -
    altreRisorseDecurtazioniFinali_Dipendenti -
    decurtazioniLimiteSalarioAccessorio_Dipendenti;
  
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
    totaleRisorseDisponibiliContrattazione_Dipendenti +
    totaleRisorseDisponibiliEQ +
    totaleRisorseDisponibiliSeg +
    (fundData.annualData.hasDirigenza ? totaleRisorseDisponibiliDir : 0);

  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Dettaglio Calcolo Fondo Risorse Decentrate {fundData.annualData.annoRiferimento}</h2>
      
      <Card title={`Riepilogo Risorse Disponibili per Fondo (Anno ${fundData.annualData.annoRiferimento})`} className="mb-8 bg-[#fcf8f8]">
        <div className="space-y-3 p-1">
          <SummaryRow label="Totale Risorse - Fondo Personale Dipendente" value={totaleRisorseDisponibiliContrattazione_Dipendenti} />
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
      
      {calculatedFund.risorseVariabili.length > 0 && (
        <FundComponentTable 
            title="Componente Variabile del Fondo (Calcolo Globale)" 
            components={calculatedFund.risorseVariabili}
            total={calculatedFund.totaleComponenteVariabile}
            totalLabel="Totale Componente Variabile (Globale)"
        />
      )}

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
                <DetailedFundItemRow 
                    key={def.key}
                    description={def.description}
                    riferimento={def.riferimento}
                    value={fadData[def.key]}
                    isRelevantToArt23Limit={def.isRelevantToArt23Limit}
                    isSubtractor={def.isSubtractor}
                    isDisabledByCondizioniSpeciali={def.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali}
                />
            ))}
            <SectionSubTotal label="Totale Risorse Stabili (da Fondo Personale Dipendente)" total={sommaStabili_Dipendenti} className="bg-[#f3e7e8] rounded-b-md"/>
        </div>

        <div className="mb-6">
            <h4 className="text-lg font-bold text-[#1b0e0e] mb-2 p-3 bg-[#f3e7e8] rounded-t-md">Risorse Variabili Soggette al Limite (da Fondo Personale Dipendente)</h4>
            {fadFieldDefinitions.filter(def => def.section === 'vs_soggette').map(def => (
                <DetailedFundItemRow 
                    key={def.key}
                    description={def.description}
                    riferimento={def.riferimento}
                    value={fadData[def.key]}
                    isRelevantToArt23Limit={def.isRelevantToArt23Limit}
                    isSubtractor={def.isSubtractor}
                    isDisabledByCondizioniSpeciali={def.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali}
                />
            ))}
            <SectionSubTotal label="Totale Risorse Variabili Soggette al Limite (da Fondo Personale Dipendente)" total={sommaVariabiliSoggette_Dipendenti} className="bg-[#f3e7e8] rounded-b-md"/>
        </div>

        <div className="mb-6">
            <h4 className="text-lg font-bold text-[#1b0e0e] mb-2 p-3 bg-[#f3e7e8] rounded-t-md">Risorse Variabili Non Soggette al Limite (da Fondo Personale Dipendente)</h4>
            {fadFieldDefinitions.filter(def => def.section === 'vn_non_soggette').map(def => (
                <DetailedFundItemRow 
                    key={def.key}
                    description={def.description}
                    riferimento={def.riferimento}
                    value={fadData[def.key]}
                    isRelevantToArt23Limit={def.isRelevantToArt23Limit}
                    isSubtractor={def.isSubtractor}
                    isDisabledByCondizioniSpeciali={def.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali}
                />
            ))}
            <SectionSubTotal label="Totale Risorse Variabili Non Soggette al Limite (da Fondo Personale Dipendente)" total={sommaVariabiliNonSoggette_Dipendenti} className="bg-[#f3e7e8] rounded-b-md"/>
        </div>
        
        <div className="mb-6">
            <h4 className="text-lg font-bold text-[#1b0e0e] mb-2 p-3 bg-[#f3e7e8] rounded-t-md">Altre Risorse e Decurtazioni Finali (da Fondo Personale Dipendente)</h4>
             {fadFieldDefinitions.filter(def => def.section === 'fin_decurtazioni').map(def => (
                <DetailedFundItemRow 
                    key={def.key}
                    description={def.description}
                    riferimento={def.riferimento}
                    value={fadData[def.key]}
                    isRelevantToArt23Limit={def.isRelevantToArt23Limit}
                    isSubtractor={def.isSubtractor}
                />
            ))}
            <SectionSubTotal label="Totale Altre Decurtazioni Finali" total={altreRisorseDecurtazioniFinali_Dipendenti} className="bg-[#f3e7e8] rounded-b-md"/>
        </div>
        
        <div className="mb-6">
             <h4 className="text-lg font-bold text-[#1b0e0e] mb-2 p-3 bg-[#f3e7e8] rounded-t-md">Decurtazioni per Rispetto Limiti Salario Accessorio (da Fondo Personale Dipendente)</h4>
             {fadFieldDefinitions.filter(def => def.section === 'cl_limiti').map(def => (
                <DetailedFundItemRow 
                    key={def.key}
                    description={def.description}
                    riferimento={def.riferimento}
                    value={fadData[def.key]}
                    isRelevantToArt23Limit={def.isRelevantToArt23Limit}
                    isSubtractor={def.isSubtractor}
                />
            ))}
             <SectionSubTotal label="Totale Decurtazioni per Rispetto Limiti" total={decurtazioniLimiteSalarioAccessorio_Dipendenti} className="bg-[#f3e7e8] rounded-b-md"/>
        </div>

        <div className="mt-6 p-4 bg-[#d1c0c1] rounded-lg">
            <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[#1b0e0e]">TOTALE RISORSE DISPONIBILI PER LA CONTRATTAZIONE (da Fondo Personale Dipendente):</span>
                <span className="text-xl font-bold text-[#ea2832]">
                    {formatCurrency(totaleRisorseDisponibiliContrattazione_Dipendenti)}
                </span>
            </div>
             <p className="text-xs text-[#5f5252] mt-3 p-2 bg-white rounded">
                Nota: Questi valori sono calcolati sommando le voci inserite nella pagina "Fondo Accessorio Personale Dipendente" e potrebbero differire dal "Calcolo Globale" se le logiche di aggregazione o le fonti di alcuni incrementi non sono perfettamente allineate o se i dati non sono stati ancora propagati. Le voci disabilitate a causa dello stato dell'ente (es. dissesto) sono considerate pari a zero in questi totali.
            </p>
        </div>
      </Card>

    </div>
  );
};
