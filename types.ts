// types.ts
import React from 'react';

export enum UserRole {
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  HR = 'HR',
  AUDITOR = 'AUDITOR',
  GUEST = 'GUEST',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface HistoricalData {
  fondoSalarioAccessorioPersonaleNonDirEQ2016?: number; 
  fondoElevateQualificazioni2016?: number;
  fondoDirigenza2016?: number;
  risorseSegretarioComunale2016?: number;
  personaleServizio2018?: number; // Usato per Art. 33 DL 34/2019
  spesaStipendiTabellari2023?: number;
  includeDifferenzialiStipendiali2023?: boolean;
  // Nuovi campi per Art. 23 c.2 D.Lgs. 75/2017, calcolo su base 2018
  fondoPersonaleNonDirEQ2018_Art23?: number;
  fondoEQ2018_Art23?: number;
}

export interface Art23EmployeeDetail {
  id: string;
  matricola?: string;
  partTimePercentage?: number; // 1-100
  cedoliniEmessi?: number;     // 1-12, solo per personale anno di riferimento
}

export enum EmployeeCategory {
  DIPENDENTE = 'Personale Dipendente non Dirigente',
  DIRIGENTE = 'Personale Dirigente',
  EQ = 'Titolari di Incarichi di Elevata Qualificazione (EQ)',
  SEGRETARIO = 'Segretario Generale',
}

export const ALL_EMPLOYEE_CATEGORIES: EmployeeCategory[] = [
  EmployeeCategory.DIPENDENTE,
  EmployeeCategory.EQ,
  EmployeeCategory.DIRIGENTE,
  EmployeeCategory.SEGRETARIO,
];

export enum TipologiaEnte {
  COMUNE = "Comune",
  PROVINCIA = "Provincia",
  UNIONE_COMUNI = "Unione dei Comuni",
  COMUNITA_MONTANA = "Comunità Montana",
  ALTRO = "Altro"
}

export interface AnnualEmployeeCount { // Usato per Art. 33 DL 34/2019
  category: EmployeeCategory;
  count?: number;
}

export interface ProventoSpecifico {
  id: string;
  descrizione: string;
  importo?: number;
  riferimentoNormativo: string;
}

export interface SimulatoreIncrementoInput {
  simStipendiTabellari2023?: number;
  simFondoStabileUltimoApprovato?: number;
  simRisorsePOEQUltimoApprovato?: number;
  simSpesaPersonaleConsuntivo2023?: number;
  simMediaEntrateCorrenti2021_2023?: number;
  simTettoSpesaPersonaleL296_06?: number;
  simCostoAnnuoNuoveAssunzioniPIAO?: number;
  simPercentualeOneriIncremento?: number; // Es. 33 per 33%
}

export interface SimulatoreIncrementoRisultati {
  fase1_obiettivo48?: number;
  fase1_fondoAttualeComplessivo?: number;
  fase1_incrementoPotenzialeLordo?: number;
  fase2_spesaPersonaleAttualePrevista?: number;
  fase2_sogliaPercentualeDM17_03_2020?: number;
  fase2_limiteSostenibileDL34?: number;
  fase2_spazioDisponibileDL34?: number;
  fase3_margineDisponibileL296_06?: number;
  fase4_spazioUtilizzabileLordo?: number;
  fase5_incrementoNettoEffettivoFondo?: number;
}

export interface FondoAccessorioDipendenteData {
  // Stabili
  st_art79c1_art67c1_unicoImporto2017?: number;
  st_art79c1_art67c1_alteProfessionalitaNonUtil?: number;
  st_art79c1_art67c2a_incr8320?: number;
  st_art79c1_art67c2b_incrStipendialiDiff?: number;
  st_art79c1_art4c2_art67c2c_integrazioneRIA?: number;
  st_art79c1_art67c2d_risorseRiassorbite165?: number;
  st_art79c1_art15c1l_art67c2e_personaleTrasferito?: number;
  st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig?: number;
  st_art79c1_art14c3_art67c2g_riduzioneStraordinario?: number;
  st_taglioFondoDL78_2010?: number; // da sottrarre
  st_riduzioniPersonaleATA_PO_Esternalizzazioni?: number; // da sottrarre
  st_art67c1_decurtazionePO_AP_EntiDirigenza?: number; // da sottrarre
  st_art79c1b_euro8450?: number;
  st_art79c1c_incrementoStabileConsistenzaPers?: number;
  st_art79c1d_differenzialiStipendiali2022?: number;
  st_art79c1bis_diffStipendialiB3D3?: number;
  st_incrementoDecretoPA?: number; 
  st_riduzionePerIncrementoEQ?: number; // NUOVO CAMPO - da sottrarre

  // Variabili Soggette al Limite
  vs_art4c3_art15c1k_art67c3c_recuperoEvasione?: number;
  vs_art4c2_art67c3d_integrazioneRIAMensile?: number;
  vs_art67c3g_personaleCaseGioco?: number;
  vs_art79c2b_max1_2MonteSalari1997?: number;
  vs_art67c3k_integrazioneArt62c2e_personaleTrasferito?: number;
  vs_art79c2c_risorseScelteOrganizzative?: number;

  // Calcolo Rispetto Limiti
  cl_totaleParzialeRisorsePerConfrontoTetto2016?: number; 
  cl_art23c2_decurtazioneIncrementoAnnualeTetto2016?: number;

  // Variabili Non Soggette al Limite
  vn_art15c1d_art67c3a_sponsorConvenzioni?: number;
  vn_art54_art67c3f_rimborsoSpeseNotifica?: number;
  vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione?: number;
  vn_art15c1k_art67c3c_incentiviTecniciCondoni?: number;
  vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti?: number;
  vn_art15c1m_art67c3e_risparmiStraordinario?: number;
  vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale?: number;
  vn_art80c1_sommeNonUtilizzateStabiliPrec?: number;
  vn_l145_art1c1091_incentiviRiscossioneIMUTARI?: number;
  vn_l178_art1c870_risparmiBuoniPasto2020?: number;
  vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga?: number;
  vn_art79c3_022MonteSalari2018_da2022Proporzionale?: number;
  vn_art79c1b_euro8450_unaTantum2021_2022?: number;
  vn_art79c3_022MonteSalari2018_da2022UnaTantum2022?: number;
  vn_dl13_art8c3_incrementoPNRR_max5stabile2016?: number;
  
  // Finali
  fin_art33c2_dl34_incrementoSalarioAccessorioDeroga?: number; // Rimosso da UI, ma tenuto in types
  fin_art4_dl16_misureMancatoRispettoVincoli?: number; 
}

export interface FondoElevateQualificazioniData {
  // Sezione: Risorse per le Elevate Qualificazioni
  ris_fondoPO2017?: number; 
  ris_incrementoConRiduzioneFondoDipendenti?: number; 
  ris_incrementoLimiteArt23c2_DL34?: number; 
  ris_incremento022MonteSalari2018?: number; // Spostato e rinominato da va_art79c3_incremento022MonteSalari2018
  fin_art23c2_adeguamentoTetto2016?: number; // Inteso come decurtazione
  
  // Sezione: Distribuzione del fondo EQ (ex Stabili e Variabili)
  st_art17c2_retribuzionePosizione?: number;
  st_art17c3_retribuzionePosizioneArt16c4?: number;
  st_art17c5_interimEQ?: number;
  st_art23c5_maggiorazioneSedi?: number;
  va_art17c4_retribuzioneRisultato?: number;
}

export interface FondoSegretarioComunaleData {
  // Risorse Stabili
  st_art3c6_CCNL2011_retribuzionePosizione?: number;
  st_art58c1_CCNL2024_differenzialeAumento?: number;
  st_art60c1_CCNL2024_retribuzionePosizioneClassi?: number;
  st_art60c3_CCNL2024_maggiorazioneComplessita?: number;
  st_art60c5_CCNL2024_allineamentoDirigEQ?: number;
  st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni?: number;
  st_art56c1h_CCNL2024_indennitaReggenzaSupplenza?: number;

  // Risorse Variabili
  va_art56c1f_CCNL2024_dirittiSegreteria?: number;
  va_art56c1i_CCNL2024_altriCompensiLegge?: number;
  va_art8c3_DL13_2023_incrementoPNRR?: number;
  va_art61c2_CCNL2024_retribuzioneRisultato10?: number;
  va_art61c2bis_CCNL2024_retribuzioneRisultato15?: number;
  va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane?: number;
  va_art61c3_CCNL2024_incremento022MonteSalari2018?: number;

  // Riepilogo e Adeguamenti Finali
  fin_totaleRisorseRilevantiLimite?: number; 
  fin_percentualeCoperturaPostoSegretario?: number; 
}

export interface FondoDirigenzaData {
  // Risorse Stabili
  st_art57c2a_CCNL2020_unicoImporto2020?: number;
  st_art57c2a_CCNL2020_riaPersonaleCessato2020?: number;
  st_art56c1_CCNL2020_incremento1_53MonteSalari2015?: number;
  st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo?: number;
  st_art57c2e_CCNL2020_risorseAutonomeStabili?: number; // Stessa lettera 'e' ma per sezione Stabili
  st_art39c1_CCNL2024_incremento2_01MonteSalari2018?: number;

  // Risorse Variabili
  va_art57c2b_CCNL2020_risorseLeggeSponsor?: number;
  va_art57c2d_CCNL2020_sommeOnnicomprensivita?: number;
  va_art57c2e_CCNL2020_risorseAutonomeVariabili?: number; // Stessa lettera 'e' ma per sezione Variabili
  va_art57c3_CCNL2020_residuiAnnoPrecedente?: number;
  va_dl13_2023_art8c3_incrementoPNRR?: number;
  va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020?: number;
  va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023?: number;
  va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione?: number;
  va_art33c2_DL34_2019_incrementoDeroga?: number;

  // Calcolo del Rispetto dei Limiti del Salario Accessorio
  lim_totaleParzialeRisorseConfrontoTetto2016?: number;
  lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016?: number; // Può essere +/-
  lim_art4_DL16_2014_misureMancatoRispettoVincoli?: number; // Da sottrarre
}


export interface AnnualData {
  annoRiferimento: number;
  denominazioneEnte?: string;
  tipologiaEnte?: TipologiaEnte;
  altroTipologiaEnte?: string;
  numeroAbitanti?: number;
  isEnteDissestato?: boolean;
  isEnteStrutturalmenteDeficitario?: boolean;
  isEnteRiequilibrioFinanziario?: boolean;
  hasDirigenza?: boolean; 
  personaleServizioAttuale: AnnualEmployeeCount[]; 
  rispettoEquilibrioBilancioPrecedente?: boolean;
  rispettoDebitoCommercialePrecedente?: boolean;
  incidenzaSalarioAccessorioUltimoRendiconto?: number;
  approvazioneRendicontoPrecedente?: boolean;
  proventiSpecifici: ProventoSpecifico[]; // Rimosso da UI, ma tenuto in types
  incentiviPNRROpMisureStraordinarie?: number; // Rimosso da UI, ma tenuto in types
  condizioniVirtuositaFinanziariaSoddisfatte?: boolean; // Rimosso da UI, ma tenuto in types
  personale2018PerArt23: Art23EmployeeDetail[];
  personaleAnnoRifPerArt23: Art23EmployeeDetail[];
  simulatoreInput?: SimulatoreIncrementoInput;
  simulatoreRisultati?: SimulatoreIncrementoRisultati; 
  fondoStabile2016PNRR?: number;
  calcolatoIncrementoPNRR3?: number; // Nuovo campo per risultato calcolo PNRR 3
}

export interface FundData {
  historicalData: HistoricalData;
  annualData: AnnualData;
  fondoAccessorioDipendenteData?: FondoAccessorioDipendenteData;
  fondoElevateQualificazioniData?: FondoElevateQualificazioniData;
  fondoSegretarioComunaleData?: FondoSegretarioComunaleData;
  fondoDirigenzaData?: FondoDirigenzaData;
}

export interface FundComponent {
  descrizione: string;
  importo: number;
  riferimento: string;
  tipo: 'stabile' | 'variabile';
  esclusoDalLimite2016?: boolean;
}

export interface CalculatedFund {
  fondoBase2016: number; 
  incrementiStabiliCCNL: FundComponent[]; 
  adeguamentoProCapite: FundComponent; 
  incrementoDeterminatoArt23C2?: FundComponent; 
  incrementoOpzionaleVirtuosi?: FundComponent; 
  
  totaleComponenteStabile: number;

  risorseVariabili: FundComponent[]; 
  totaleComponenteVariabile: number;

  totaleFondoRisorseDecentrate: number;

  limiteArt23C2Modificato?: number; 
  ammontareSoggettoLimite2016: number; // Somma globale risorse soggette al limite (basata su calcolo principale)
  superamentoLimite2016?: number; 
  totaleRisorseSoggetteAlLimiteDaFondiSpecifici: number; // NUOVO CAMPO: Somma risorse soggette al limite da specifici fondi
}

export interface ComplianceCheck {
  id: string;
  descrizione: string;
  isCompliant: boolean;
  valoreAttuale?: string | number;
  limite?: string | number;
  messaggio: string;
  riferimentoNormativo: string;
  gravita: 'info' | 'warning' | 'error';
}

export interface AppState {
  currentUser: User;
  currentYear: number;
  fundData: FundData;
  calculatedFund?: CalculatedFund;
  complianceChecks: ComplianceCheck[];
  isLoading: boolean;
  error?: string;
  activeTab: string;
}

export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_CURRENT_YEAR'; payload: number }
  | { type: 'UPDATE_HISTORICAL_DATA'; payload: Partial<HistoricalData> }
  | { type: 'UPDATE_ANNUAL_DATA'; payload: Partial<AnnualData> }
  | { type: 'UPDATE_EMPLOYEE_COUNT'; payload: { category: EmployeeCategory; count: number } } 
  | { type: 'ADD_PROVENTO_SPECIFICO'; payload: ProventoSpecifico }
  | { type: 'UPDATE_PROVENTO_SPECIFICO'; payload: { index: number; provento: ProventoSpecifico } }
  | { type: 'REMOVE_PROVENTO_SPECIFICO'; payload: number }
  | { type: 'CALCULATE_FUND_START' }
  | { type: 'CALCULATE_FUND_SUCCESS'; payload: { fund: CalculatedFund; checks: ComplianceCheck[] } }
  | { type: 'CALCULATE_FUND_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'ADD_ART23_EMPLOYEE_DETAIL'; payload: { yearType: '2018' | 'annoRif'; detail: Art23EmployeeDetail } }
  | { type: 'UPDATE_ART23_EMPLOYEE_DETAIL'; payload: { yearType: '2018' | 'annoRif'; index: number; detail: Art23EmployeeDetail } }
  | { type: 'REMOVE_ART23_EMPLOYEE_DETAIL'; payload: { yearType: '2018' | 'annoRif'; index: number } }
  | { type: 'UPDATE_SIMULATORE_INPUT'; payload: Partial<SimulatoreIncrementoInput> }
  | { type: 'UPDATE_SIMULATORE_RISULTATI'; payload: SimulatoreIncrementoRisultati | undefined } 
  | { type: 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA'; payload: Partial<FondoAccessorioDipendenteData> }
  | { type: 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA'; payload: Partial<FondoElevateQualificazioniData> }
  | { type: 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA'; payload: Partial<FondoSegretarioComunaleData> }
  | { type: 'UPDATE_FONDO_DIRIGENZA_DATA'; payload: Partial<FondoDirigenzaData> }
  | { type: 'UPDATE_CALCOLATO_INCREMENTO_PNRR3'; payload: number | undefined }; 


export interface PageModule {
  id: string;
  name: string;
  icon: React.ReactNode; 
  component: React.FC;
}