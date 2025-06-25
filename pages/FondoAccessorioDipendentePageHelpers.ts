// pages/FondoAccessorioDipendentePageHelpers.ts
import { FondoAccessorioDipendenteData, FondoElevateQualificazioniData, SimulatoreIncrementoRisultati } from '../types.js';

export const fadFieldDefinitions: Array<{
  key: keyof FondoAccessorioDipendenteData;
  description: string;
  riferimento: string;
  isRelevantToArt23Limit?: boolean; // Default to true if not specified, for safety, but better to be explicit
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
  { key: 'fin_art4_dl16_misureMancatoRispettoVincoli', description: "Misure per mancato rispetto vincoli (Art. 4 DL 16/14)", riferimento: "Art. 4 DL 16/2014", isRelevantToArt23Limit: false, isSubtractor: true, section: 'fin_decurtazioni' }, // Non rileva per il limite Art. 23 di per sé ma è una decurtazione finale
  { key: 'cl_art23c2_decurtazioneIncrementoAnnualeTetto2016', description: "Decurtazione annuale per rispetto tetto 2016", riferimento: "Art. 23 c.2 D.Lgs 75/2017", isRelevantToArt23Limit: true, isSubtractor: true, section: 'cl_limiti' },
];


export const getFadEffectiveValue = (
    key: keyof FondoAccessorioDipendenteData, 
    originalValue?: number,
    isDisabledBySourceDefinition?: boolean,
    isEnteInCondizioniSpecialiGlobal?: boolean
) => {
    if (isDisabledBySourceDefinition && isEnteInCondizioniSpecialiGlobal) {
        return 0;
    }
    return originalValue || 0;
};

// Helper function for more complex effective value calculations, used also in reportService
export const getFadEffectiveValueHelper = (
    key: keyof FondoAccessorioDipendenteData, 
    originalValue: number | undefined,
    isDisabledBySourceDefinition: boolean | undefined,
    isEnteInCondizioniSpecialiGlobal: boolean | undefined,
    simulatoreRisultati?: SimulatoreIncrementoRisultati,
    incrementoEQconRiduzioneDipendenti?: number
): number => {
    if (isDisabledBySourceDefinition && isEnteInCondizioniSpecialiGlobal) {
        return 0;
    }
    if (key === 'st_incrementoDecretoPA') {
        const maxIncremento = simulatoreRisultati?.fase5_incrementoNettoEffettivoFondo ?? 0;
        return maxIncremento > 0 ? (originalValue || 0) : 0;
    }
    if (key === 'st_riduzionePerIncrementoEQ') {
        return incrementoEQconRiduzioneDipendenti || 0;
    }
    return originalValue || 0;
};


export const calculateFadTotals = (
    fadData: FondoAccessorioDipendenteData,
    simulatoreRisultati: SimulatoreIncrementoRisultati | undefined,
    isEnteInCondizioniSpeciali: boolean,
    incrementoEQconRiduzioneDipendenti?: number
) => {
    const getValue = (key: keyof FondoAccessorioDipendenteData) => {
        const definition = fadFieldDefinitions.find(def => def.key === key);
        return getFadEffectiveValueHelper(
            key, 
            fadData[key], 
            definition?.isDisabledByCondizioniSpeciali, 
            isEnteInCondizioniSpeciali,
            simulatoreRisultati,
            incrementoEQconRiduzioneDipendenti
        );
    };
    
    const sommaStabili_Dipendenti =
        getValue('st_art79c1_art67c1_unicoImporto2017') +
        getValue('st_art79c1_art67c1_alteProfessionalitaNonUtil') +
        getValue('st_art79c1_art67c2a_incr8320') +
        getValue('st_art79c1_art67c2b_incrStipendialiDiff') +
        getValue('st_art79c1_art4c2_art67c2c_integrazioneRIA') +
        getValue('st_art79c1_art67c2d_risorseRiassorbite165') +
        getValue('st_art79c1_art15c1l_art67c2e_personaleTrasferito') +
        getValue('st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig') +
        getValue('st_art79c1_art14c3_art67c2g_riduzioneStraordinario') -
        getValue('st_taglioFondoDL78_2010') -
        getValue('st_riduzioniPersonaleATA_PO_Esternalizzazioni') -
        getValue('st_art67c1_decurtazionePO_AP_EntiDirigenza') +
        getValue('st_art79c1b_euro8450') +
        getValue('st_art79c1c_incrementoStabileConsistenzaPers') +
        getValue('st_art79c1d_differenzialiStipendiali2022') +
        getValue('st_art79c1bis_diffStipendialiB3D3') +
        getValue('st_incrementoDecretoPA') - // Already processed by getFadEffectiveValueHelper
        getValue('st_riduzionePerIncrementoEQ'); // Already processed by getFadEffectiveValueHelper


    const sommaVariabiliSoggette_Dipendenti =
        getValue('vs_art4c3_art15c1k_art67c3c_recuperoEvasione') +
        getValue('vs_art4c2_art67c3d_integrazioneRIAMensile') +
        getValue('vs_art67c3g_personaleCaseGioco') +
        getValue('vs_art79c2b_max1_2MonteSalari1997') +
        getValue('vs_art67c3k_integrazioneArt62c2e_personaleTrasferito') +
        getValue('vs_art79c2c_risorseScelteOrganizzative');

    const sommaVariabiliNonSoggette_Dipendenti =
        getValue('vn_art15c1d_art67c3a_sponsorConvenzioni') +
        getValue('vn_art54_art67c3f_rimborsoSpeseNotifica') +
        getValue('vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione') +
        getValue('vn_art15c1k_art67c3c_incentiviTecniciCondoni') +
        getValue('vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti') +
        getValue('vn_art15c1m_art67c3e_risparmiStraordinario') +
        getValue('vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale') +
        getValue('vn_art80c1_sommeNonUtilizzateStabiliPrec') +
        getValue('vn_l145_art1c1091_incentiviRiscossioneIMUTARI') +
        getValue('vn_l178_art1c870_risparmiBuoniPasto2020') +
        getValue('vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga') +
        getValue('vn_art79c3_022MonteSalari2018_da2022Proporzionale') +
        getValue('vn_art79c1b_euro8450_unaTantum2021_2022') +
        getValue('vn_art79c3_022MonteSalari2018_da2022UnaTantum2022') +
        getValue('vn_dl13_art8c3_incrementoPNRR_max5stabile2016');
    
    const altreRisorseDecurtazioniFinali_Dipendenti = getValue('fin_art4_dl16_misureMancatoRispettoVincoli');
    const decurtazioniLimiteSalarioAccessorio_Dipendenti = getValue('cl_art23c2_decurtazioneIncrementoAnnualeTetto2016');

    const totaleRisorseDisponibiliContrattazione_Dipendenti =
        sommaStabili_Dipendenti +
        sommaVariabiliSoggette_Dipendenti +
        sommaVariabiliNonSoggette_Dipendenti -
        altreRisorseDecurtazioniFinali_Dipendenti -
        decurtazioniLimiteSalarioAccessorio_Dipendenti;
        
    return {
        sommaStabili_Dipendenti,
        sommaVariabiliSoggette_Dipendenti,
        sommaVariabiliNonSoggette_Dipendenti,
        altreRisorseDecurtazioniFinali_Dipendenti,
        decurtazioniLimiteSalarioAccessorio_Dipendenti,
        totaleRisorseDisponibiliContrattazione_Dipendenti
    };
};