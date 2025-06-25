// constants.ts
import { EmployeeCategory, UserRole, TipologiaEnte, SimulatoreIncrementoInput, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData } from './types.js';

export const APP_NAME = "Salario accessorio Funzioni Locali";

export const DEFAULT_CURRENT_YEAR = new Date().getFullYear();

// Valori Pro-capite per incrementi CCNL (da verificare/aggiornare con fonti ufficiali)
export const VALORE_PROCAPITE_ART67_CCNL2018 = 83.20; // Art. 67, c.2, lett. a) e b) CCNL Funzioni Locali 2016-2018
export const VALORE_PROCAPITE_ART79_CCNL2022_B = 84.50; // Art. 79, c.1, lett. b) CCNL Funzioni Locali 2019-2021
// Art. 79, c.1, lett. d) CCNL 2019-2021 (differenziali stipendiali) è più complesso, non solo pro-capite.

// Limiti
export const LIMITE_INCIDENZA_SALARIO_ACCESSORIO = 8; // % sulla spesa del personale (punto 4.2 piano indicatori)
export const LIMITE_INCREMENTO_VIRTUOSI_DL25_2025 = 0.48; // 48% della spesa stipendi tabellari 2023
export const LIMITE_INCREMENTO_PNRR_DL13_2023 = 0.05; // 5% della componente stabile 2016

// Riferimenti normativi (chiavi per una futura localizzazione o gestione più strutturata)
export const RIF_ART23_DLGS75_2017 = "Art. 23, c.2, D.Lgs. 75/2017";
export const RIF_ART33_DL34_2019 = "Art. 33, c.2, D.L. 34/2019";
export const RIF_ART14_DL25_2025 = "Art. 14, c.1-bis, D.L. 25/2025 (ex DL Energia)"; // Riferimento aggiornato
export const RIF_DM_17_03_2020 = "DM 17 Marzo 2020 (Sostenibilità Spesa Personale)";
export const RIF_L296_06_C557 = "Art. 1, c. 557, L. 296/2006 (Tetto Spesa Personale)";
export const RIF_ART67_CCNL2018 = "Art. 67, c.2, CCNL Funzioni Locali 2016-2018";
export const RIF_ART79_CCNL2022 = "Art. 79, CCNL Funzioni Locali 2019-2021";
export const RIF_ART7_C4_U_CCNL2022 = "Art. 7 c. 4 lett. u) CCNL Funzioni Locali 16.11.2022";
export const RIF_ART45_DLGS36_2023 = "Art. 45 D.Lgs. 36/2023 (ex Art. 113 D.Lgs. 50/2016)";
export const RIF_ART208_CDS = "Art. 208 Codice della Strada";
export const RIF_ART8_DL13_2023 = "Art. 8, c.3-4, D.L. 13/2023";
// Riferimenti per Fondo EQ
export const RIF_ART17_CCNL2022 = "Art. 17 CCNL Funzioni Locali 16.11.2022";
export const RIF_ART23_C5_CCNL2022 = "Art. 23 c.5 CCNL Funzioni Locali 16.11.2022";
export const RIF_DELIBERA_ENTE = "Delibera Ente / Disposizione Interna";


// Riferimenti per Fondo Segretario Comunale
export const RIF_CCNL_SEG_01032011_ART3C6 = "Art. 3 c. 6 CCNL Segretari 01.03.2011";
export const RIF_CCNL_SEG_16072024_ART58C1 = "Art. 58 c. 1 CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART60C1 = "Art. 60 c. 1 CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART60C3 = "Art. 60 c. 3 CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART60C5 = "Art. 60 c. 5 CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART56C1G = "Art. 56 c. 1 lett. g) CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART56C1H = "Art. 56 c. 1 lett. h) CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART56C1F = "Art. 56 c. 1 lett. f) CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART56C1I = "Art. 56 c. 1 lett. i) CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART61C2 = "Art. 61 c. 2 CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART61C2BIS = "Art. 61 c. 2-bis CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART61C2TER = "Art. 61 c. 2-ter CCNL Segretari 16.07.2024";
export const RIF_CCNL_SEG_16072024_ART61C3 = "Art. 61 c. 3 CCNL Segretari 16.07.2024";

// Riferimenti per Fondo Dirigenza
export const RIF_CCNL_DIR_17122020_ART57C2A = "Art. 57 c.2 lett. a) CCNL Dirigenza FL 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART56C1 = "Art. 56 c.1 CCNL Dirigenza FL 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART57C2C = "Art. 57 c.2 lett. c) CCNL Dirigenza FL 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART57C2E = "Art. 57 c.2 lett. e) CCNL Dirigenza FL 17.12.2020";
export const RIF_CCNL_DIR_16072024_ART39C1 = "Art. 39 c.1 CCNL Dirigenza FL 16.07.2024";
export const RIF_CCNL_DIR_17122020_ART57C2B = "Art. 57 c.2 lett. b) CCNL Dirigenza FL 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART57C2D = "Art. 57 c.2 lett. d) CCNL Dirigenza FL 17.12.2020";
export const RIF_CCNL_DIR_17122020_ART57C3 = "Art. 57 c.3 CCNL Dirigenza FL 17.12.2020";
export const RIF_CCNL_DIR_16072024_ART39C2 = "Art. 39 c.2 CCNL Dirigenza FL 16.07.2024";
export const RIF_DL16_2014_ART4 = "Art. 4 D.L. 16/2014";
export const RIF_INCREMENTO_DECRETO_PA = "Incremento potenziale da DL PA / Misure Urgenti";


export const INITIAL_HISTORICAL_DATA = {
  fondoSalarioAccessorioPersonaleNonDirEQ2016: undefined,
  fondoElevateQualificazioni2016: undefined,
  fondoDirigenza2016: undefined,
  risorseSegretarioComunale2016: undefined,
  personaleServizio2018: undefined,
  spesaStipendiTabellari2023: undefined,
  includeDifferenzialiStipendiali2023: false,
  // Nuovi campi per Art. 23 c.2, calcolo su base 2018
  fondoPersonaleNonDirEQ2018_Art23: undefined,
  fondoEQ2018_Art23: undefined,
};

export const ALL_TIPOLOGIE_ENTE: { value: TipologiaEnte; label: string }[] = Object.values(TipologiaEnte).map(value => ({ value, label: value }));

export const INITIAL_SIMULATORE_INPUT: SimulatoreIncrementoInput = {
  simStipendiTabellari2023: undefined,
  simFondoStabileUltimoApprovato: undefined,
  simRisorsePOEQUltimoApprovato: undefined,
  simSpesaPersonaleConsuntivo2023: undefined,
  simMediaEntrateCorrenti2021_2023: undefined,
  simTettoSpesaPersonaleL296_06: undefined,
  simCostoAnnuoNuoveAssunzioniPIAO: undefined,
  simPercentualeOneriIncremento: undefined, 
};

export const INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA: FondoAccessorioDipendenteData = {
  st_art79c1_art67c1_unicoImporto2017: undefined,
  st_art79c1_art67c1_alteProfessionalitaNonUtil: undefined,
  st_art79c1_art67c2a_incr8320: undefined,
  st_art79c1_art67c2b_incrStipendialiDiff: undefined,
  st_art79c1_art4c2_art67c2c_integrazioneRIA: undefined,
  st_art79c1_art67c2d_risorseRiassorbite165: undefined,
  st_art79c1_art15c1l_art67c2e_personaleTrasferito: undefined,
  st_art79c1_art15c1i_art67c2f_regioniRiduzioneDirig: undefined,
  st_art79c1_art14c3_art67c2g_riduzioneStraordinario: undefined,
  st_taglioFondoDL78_2010: undefined,
  st_riduzioniPersonaleATA_PO_Esternalizzazioni: undefined,
  st_art67c1_decurtazionePO_AP_EntiDirigenza: undefined,
  st_art79c1b_euro8450: undefined,
  st_art79c1c_incrementoStabileConsistenzaPers: undefined,
  st_art79c1d_differenzialiStipendiali2022: undefined,
  st_art79c1bis_diffStipendialiB3D3: undefined,
  st_incrementoDecretoPA: undefined,
  st_riduzionePerIncrementoEQ: undefined, // NUOVO CAMPO
  vs_art4c3_art15c1k_art67c3c_recuperoEvasione: undefined,
  vs_art4c2_art67c3d_integrazioneRIAMensile: undefined,
  vs_art67c3g_personaleCaseGioco: undefined,
  vs_art79c2b_max1_2MonteSalari1997: undefined,
  vs_art67c3k_integrazioneArt62c2e_personaleTrasferito: undefined,
  vs_art79c2c_risorseScelteOrganizzative: undefined,
  cl_totaleParzialeRisorsePerConfrontoTetto2016: undefined,
  cl_art23c2_decurtazioneIncrementoAnnualeTetto2016: undefined,
  vn_art15c1d_art67c3a_sponsorConvenzioni: undefined,
  vn_art54_art67c3f_rimborsoSpeseNotifica: undefined,
  vn_art15c1k_art16_dl98_art67c3b_pianiRazionalizzazione: undefined,
  vn_art15c1k_art67c3c_incentiviTecniciCondoni: undefined,
  vn_art18h_art67c3c_incentiviSpeseGiudizioCensimenti: undefined,
  vn_art15c1m_art67c3e_risparmiStraordinario: undefined,
  vn_art67c3j_regioniCittaMetro_art23c4_incrPercentuale: undefined,
  vn_art80c1_sommeNonUtilizzateStabiliPrec: undefined,
  vn_l145_art1c1091_incentiviRiscossioneIMUTARI: undefined,
  vn_l178_art1c870_risparmiBuoniPasto2020: undefined,
  vn_dl135_art11c1b_risorseAccessorieAssunzioniDeroga: undefined,
  vn_art79c3_022MonteSalari2018_da2022Proporzionale: undefined,
  vn_art79c1b_euro8450_unaTantum2021_2022: undefined,
  vn_art79c3_022MonteSalari2018_da2022UnaTantum2022: undefined,
  vn_dl13_art8c3_incrementoPNRR_max5stabile2016: undefined,
  fin_art33c2_dl34_incrementoSalarioAccessorioDeroga: undefined,
  fin_art4_dl16_misureMancatoRispettoVincoli: undefined,
};

export const INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA: FondoElevateQualificazioniData = {
  ris_fondoPO2017: undefined,
  ris_incrementoConRiduzioneFondoDipendenti: undefined,
  ris_incrementoLimiteArt23c2_DL34: undefined,
  ris_incremento022MonteSalari2018: undefined, // Spostato e rinominato
  fin_art23c2_adeguamentoTetto2016: undefined,
  
  st_art17c2_retribuzionePosizione: undefined,
  st_art17c3_retribuzionePosizioneArt16c4: undefined,
  st_art17c5_interimEQ: undefined,
  st_art23c5_maggiorazioneSedi: undefined,
  va_art17c4_retribuzioneRisultato: undefined,
};

export const INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA: FondoSegretarioComunaleData = {
  st_art3c6_CCNL2011_retribuzionePosizione: undefined,
  st_art58c1_CCNL2024_differenzialeAumento: undefined,
  st_art60c1_CCNL2024_retribuzionePosizioneClassi: undefined,
  st_art60c3_CCNL2024_maggiorazioneComplessita: undefined,
  st_art60c5_CCNL2024_allineamentoDirigEQ: undefined,
  st_art56c1g_CCNL2024_retribuzioneAggiuntivaConvenzioni: undefined,
  st_art56c1h_CCNL2024_indennitaReggenzaSupplenza: undefined,
  va_art56c1f_CCNL2024_dirittiSegreteria: undefined,
  va_art56c1i_CCNL2024_altriCompensiLegge: undefined,
  va_art8c3_DL13_2023_incrementoPNRR: undefined,
  va_art61c2_CCNL2024_retribuzioneRisultato10: undefined,
  va_art61c2bis_CCNL2024_retribuzioneRisultato15: undefined,
  va_art61c2ter_CCNL2024_superamentoLimiteMetropolitane: undefined,
  va_art61c3_CCNL2024_incremento022MonteSalari2018: undefined,
  fin_totaleRisorseRilevantiLimite: undefined,
  fin_percentualeCoperturaPostoSegretario: 100,
};

export const INITIAL_FONDO_DIRIGENZA_DATA: FondoDirigenzaData = {
  st_art57c2a_CCNL2020_unicoImporto2020: undefined,
  st_art57c2a_CCNL2020_riaPersonaleCessato2020: undefined,
  st_art56c1_CCNL2020_incremento1_53MonteSalari2015: undefined,
  st_art57c2c_CCNL2020_riaCessatidallAnnoSuccessivo: undefined,
  st_art57c2e_CCNL2020_risorseAutonomeStabili: undefined,
  st_art39c1_CCNL2024_incremento2_01MonteSalari2018: undefined,
  va_art57c2b_CCNL2020_risorseLeggeSponsor: undefined,
  va_art57c2d_CCNL2020_sommeOnnicomprensivita: undefined,
  va_art57c2e_CCNL2020_risorseAutonomeVariabili: undefined,
  va_art57c3_CCNL2020_residuiAnnoPrecedente: undefined,
  va_dl13_2023_art8c3_incrementoPNRR: undefined,
  va_art39c1_CCNL2024_recupero0_46MonteSalari2018_2020: undefined,
  va_art39c1_CCNL2024_recupero2_01MonteSalari2018_2021_2023: undefined,
  va_art39c2_CCNL2024_incremento0_22MonteSalari2018_valorizzazione: undefined,
  va_art33c2_DL34_2019_incrementoDeroga: undefined,
  lim_totaleParzialeRisorseConfrontoTetto2016: undefined,
  lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016: undefined,
  lim_art4_DL16_2014_misureMancatoRispettoVincoli: undefined,
};


export const INITIAL_ANNUAL_DATA = {
  annoRiferimento: DEFAULT_CURRENT_YEAR,
  denominazioneEnte: undefined,
  tipologiaEnte: undefined,
  altroTipologiaEnte: undefined,
  numeroAbitanti: undefined,
  isEnteDissestato: undefined,
  isEnteStrutturalmenteDeficitario: undefined,
  isEnteRiequilibrioFinanziario: undefined,
  hasDirigenza: undefined,
  personaleServizioAttuale: Object.values(EmployeeCategory).map(cat => ({ category: cat, count: undefined })),
  rispettoEquilibrioBilancioPrecedente: undefined,
  rispettoDebitoCommercialePrecedente: undefined,
  incidenzaSalarioAccessorioUltimoRendiconto: undefined,
  approvazioneRendicontoPrecedente: undefined,
  proventiSpecifici: [],
  incentiviPNRROpMisureStraordinarie: undefined,
  condizioniVirtuositaFinanziariaSoddisfatte: undefined,
  personale2018PerArt23: [],
  personaleAnnoRifPerArt23: [],
  simulatoreInput: INITIAL_SIMULATORE_INPUT,
  simulatoreRisultati: undefined, 
  fondoStabile2016PNRR: undefined,
  calcolatoIncrementoPNRR3: undefined, 
};

export const DEFAULT_USER = {
  id: 'guest01',
  name: 'Utente Ospite',
  role: UserRole.GUEST,
};

// Testi per UI
export const TEXTS_UI = {
  calculating: "Calcolo in corso...",
  saveChanges: "Salva Modifiche",
  dataSuccessfullySaved: "Dati salvati con successo.",
  errorSavingData: "Errore durante il salvataggio dei dati.",
  errorCalculatingFund: "Errore durante il calcolo del fondo.",
  confirmAction: "Conferma Azione",
  cancel: "Annulla",
  confirm: "Conferma",
  generateReport: "Genera Report",
  noDataAvailable: "Nessun dato disponibile.",
  fieldRequired: "Questo campo è obbligatorio.",
  invalidNumber: "Inserire un numero valido.",
  trueText: "Sì",
  falseText: "No",
  notApplicable: "N/D",
  add: "Aggiungi",
  remove: "Rimuovi",
};