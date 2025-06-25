// services/reportService.ts
import jsPDF from 'jspdf'; 
import autoTable, { CellHookData, FontStyle } from 'jspdf-autotable';
import { 
    CalculatedFund, 
    FundData, 
    User, 
    FondoAccessorioDipendenteData, 
    FondoElevateQualificazioniData,
    FondoSegretarioComunaleData,
    FondoDirigenzaData,
    ComplianceCheck,
    SimulatoreIncrementoInput,
    SimulatoreIncrementoRisultati,
    HistoricalData,
    AnnualData,
    Art23EmployeeDetail,
    TipologiaEnte
} from '../types.js';
import { 
    fadFieldDefinitions, 
    getFadEffectiveValueHelper, // Renamed import to avoid conflict
    calculateFadTotals 
} from '../pages/FondoAccessorioDipendentePageHelpers.js';
import { TEXTS_UI, ALL_TIPOLOGIE_ENTE } from '../constants.js'; 
import { calculateSimulazione, getSogliaSpesaPersonale } from '../hooks/useSimulatoreCalculations.js';


// --- PDF Helper Functions ---
const MARGIN = 14;
const LINE_SPACING = 6;
const SECTION_SPACING = 10;
let CURRENT_Y = 0;

const checkYAndAddPage = (doc: jsPDF, spaceNeeded: number) => {
    if (CURRENT_Y + spaceNeeded > doc.internal.pageSize.height - MARGIN) {
        doc.addPage();
        CURRENT_Y = MARGIN;
        return true;
    }
    return false;
};

const addSectionTitle = (doc: jsPDF, title: string, bold: boolean = true) => {
    checkYAndAddPage(doc, LINE_SPACING * 2);
    doc.setFontSize(14);
    if (bold) doc.setFont('helvetica', 'bold');
    doc.text(title, MARGIN, CURRENT_Y);
    if (bold) doc.setFont('helvetica', 'normal');
    CURRENT_Y += LINE_SPACING * 1.5;
};

const addSubTitle = (doc: jsPDF, title: string) => {
    checkYAndAddPage(doc, LINE_SPACING * 1.5);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, MARGIN, CURRENT_Y);
    doc.setFont('helvetica', 'normal');
    CURRENT_Y += LINE_SPACING * 1.2;
};

const addText = (doc: jsPDF, text: string | string[], indent = 0) => {
    const textArray = Array.isArray(text) ? text : [text];
    textArray.forEach(line => {
        const splitText = doc.splitTextToSize(line, doc.internal.pageSize.width - (MARGIN * 2) - indent);
        splitText.forEach((sLine: string) => {
            checkYAndAddPage(doc, LINE_SPACING);
            doc.setFontSize(9);
            doc.text(sLine, MARGIN + indent, CURRENT_Y);
            CURRENT_Y += LINE_SPACING * 0.8;
        });
    });
    CURRENT_Y += LINE_SPACING * 0.4;
};

const addKeyValueTable = (doc: jsPDF, data: Array<{ label: string; value: string | undefined }>, title?: string) => {
    if (title) addSubTitle(doc, title);
    const body = data.map(row => [row.label, row.value || TEXTS_UI.notApplicable]);
    
    checkYAndAddPage(doc, body.length * LINE_SPACING * 1.2); 

    autoTable(doc, {
        startY: CURRENT_Y,
        head: [['Campo', 'Valore']],
        body: body,
        theme: 'grid',
        headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontStyle: 'bold' as FontStyle, fontSize: 9 }, 
        bodyStyles: { fontSize: 8, cellPadding: 1.5 },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 'auto'} },
        didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
    });
    CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;
};

// --- Formatting Helpers ---
const formatCurrency = (value?: number, notApplicableText = TEXTS_UI.notApplicable): string => {
  if (value === undefined || value === null || isNaN(value)) return notApplicableText;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (value?: number, digits = 2, notApplicableText = TEXTS_UI.notApplicable): string => {
    if (value === undefined || value === null || isNaN(value)) return notApplicableText;
    return value.toLocaleString('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const formatBoolean = (value?: boolean, notApplicableText = TEXTS_UI.notApplicable): string => {
    if (value === undefined || value === null) return notApplicableText;
    return value ? TEXTS_UI.trueText : TEXTS_UI.falseText;
};

const formatPercentage = (value?: number): string => {
  if (value === undefined || value === null || isNaN(value)) return TEXTS_UI.notApplicable;
  return `${formatNumber(value)}%`;
};

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Local getFadEffectiveValue for PDF generation, distinct from the one in PageHelpers
const getFadEffectiveValueForPDF = (
    key: keyof FondoAccessorioDipendenteData,
    originalValue: number | undefined,
    isEnteInCondizioniSpeciali: boolean,
    simulatoreRisultati?: SimulatoreIncrementoRisultati,
    incrementoEQconRiduzioneDipendenti?: number
): number => {
    const definition = fadFieldDefinitions.find(def => def.key === key);
    if (definition?.isDisabledByCondizioniSpeciali && isEnteInCondizioniSpeciali) {
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


// Main function for the new report
export const generateFullSummaryPDF = (
    calculatedFund: CalculatedFund,
    fundData: FundData,
    currentUser: User,
    complianceChecks: ComplianceCheck[]
): void => {
    const doc = new jsPDF();
    CURRENT_Y = MARGIN;
    const { annualData, historicalData, fondoAccessorioDipendenteData, fondoElevateQualificazioniData, fondoSegretarioComunaleData, fondoDirigenzaData } = fundData;

    // Report Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Riepilogo Generale Calcoli e Risultanze', doc.internal.pageSize.width / 2, CURRENT_Y, { align: 'center' });
    CURRENT_Y += LINE_SPACING * 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Ente: ${annualData.denominazioneEnte || 'Non specificato'}`, MARGIN, CURRENT_Y);
    doc.text(`Anno Riferimento: ${annualData.annoRiferimento}`, doc.internal.pageSize.width - MARGIN, CURRENT_Y, { align: 'right' });
    CURRENT_Y += LINE_SPACING;
    doc.text(`Generato da: ${currentUser.name} (${currentUser.role})`, MARGIN, CURRENT_Y);
    doc.text(`Data Generazione: ${formatDate(new Date())}`, doc.internal.pageSize.width - MARGIN, CURRENT_Y, { align: 'right' });
    CURRENT_Y += SECTION_SPACING;

    // --- 1. DATI DI INPUT ---
    addSectionTitle(doc, '1. Dati di Input Riepilogati');

    const tipologiaEnteLabel = ALL_TIPOLOGIE_ENTE.find(t => t.value === annualData.tipologiaEnte)?.label || annualData.tipologiaEnte || TEXTS_UI.notApplicable;
    const infoGeneraliData = [
        { label: 'Denominazione Ente', value: annualData.denominazioneEnte },
        { label: 'Tipologia Ente', value: tipologiaEnteLabel },
        { label: 'Altra Tipologia Ente (se specificato)', value: annualData.tipologiaEnte === TipologiaEnte.ALTRO ? annualData.altroTipologiaEnte : TEXTS_UI.notApplicable },
        { label: 'Numero Abitanti (31.12 anno prec.)', value: formatNumber(annualData.numeroAbitanti, 0) },
        { label: 'Ente in Dissesto Finanziario?', value: formatBoolean(annualData.isEnteDissestato) },
        { label: 'Ente Strutturalmente Deficitario?', value: formatBoolean(annualData.isEnteStrutturalmenteDeficitario) },
        { label: 'Ente in Piano di Riequilibrio?', value: formatBoolean(annualData.isEnteRiequilibrioFinanziario) },
        { label: 'Ente con Personale Dirigente?', value: formatBoolean(annualData.hasDirigenza) },
    ];
    addKeyValueTable(doc, infoGeneraliData, '1.1 Informazioni Generali Ente');
    
    const datiStorici2016Data = [
        { label: 'Fondo Salario Accessorio Personale (non Dir/EQ) 2016', value: formatCurrency(historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016) },
        { label: 'Fondo Elevate Qualificazioni (EQ) 2016', value: formatCurrency(historicalData.fondoElevateQualificazioni2016) },
        { label: 'Fondo Dirigenza 2016', value: formatCurrency(historicalData.fondoDirigenza2016) },
        { label: 'Risorse Segretario Comunale 2016', value: formatCurrency(historicalData.risorseSegretarioComunale2016) },
        { label: 'Limite Complessivo Originale 2016', value: formatCurrency(calculatedFund.fondoBase2016) },
    ];
    addKeyValueTable(doc, datiStorici2016Data, '1.2 Dati Storici per Limite Fondo 2016 (Art. 23 c.2)');

    const fondoBase2018_perArt23 = (historicalData.fondoPersonaleNonDirEQ2018_Art23 || 0) + (historicalData.fondoEQ2018_Art23 || 0);
    const datiBase2018Art23 = [
        { label: 'Fondo Personale (non Dir/EQ) 2018 (per Art. 23c2)', value: formatCurrency(historicalData.fondoPersonaleNonDirEQ2018_Art23) },
        { label: 'Fondo Elevate Qualificazioni (EQ) 2018 (per Art. 23c2)', value: formatCurrency(historicalData.fondoEQ2018_Art23) },
        { label: 'Fondo Base 2018 Complessivo (per Art. 23c2)', value: formatCurrency(fondoBase2018_perArt23) },
    ];
    addKeyValueTable(doc, datiBase2018Art23, '1.3 Dati per Adeguamento Limite Fondo (Art. 23 c.2 - Base 2018)');

    addSubTitle(doc, 'Personale in servizio al 31.12.2018 (ai fini Art. 23 c.2)');
    const personale2018Body = annualData.personale2018PerArt23.map((emp, i) => [
        (i + 1).toString(),
        emp.matricola || '-',
        formatPercentage(emp.partTimePercentage) || '100%',
    ]);
    autoTable(doc, {
        startY: CURRENT_Y,
        head: [['#', 'Matricola', '% Part-Time']],
        body: personale2018Body,
        theme: 'grid', headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontSize: 9, fontStyle: 'bold' as FontStyle }, bodyStyles: { fontSize: 8 },
        didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
    });
    CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;

    addSubTitle(doc, `Personale in servizio Anno ${annualData.annoRiferimento} (ai fini Art. 23 c.2)`);
    const personaleAnnoRifBody = annualData.personaleAnnoRifPerArt23.map((emp, i) => [
        (i + 1).toString(),
        emp.matricola || '-',
        formatPercentage(emp.partTimePercentage) || '100%',
        formatNumber(emp.cedoliniEmessi, 0) || '12',
    ]);
    autoTable(doc, {
        startY: CURRENT_Y,
        head: [['#', 'Matricola', '% Part-Time', 'Cedolini Emessi (su 12)']],
        body: personaleAnnoRifBody,
        theme: 'grid', headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontSize: 9, fontStyle: 'bold' as FontStyle }, bodyStyles: { fontSize: 8 },
        didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
    });
    CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;

    const datiPNRR3 = [
        { label: 'Rispetto Equilibrio Bilancio Anno Prec.?', value: formatBoolean(annualData.rispettoEquilibrioBilancioPrecedente) },
        { label: 'Rispetto Parametri Debito Commerciale Anno Prec.?', value: formatBoolean(annualData.rispettoDebitoCommercialePrecedente) },
        { label: 'Incidenza Salario Accessorio (Ultimo Rendiconto %)', value: formatPercentage(annualData.incidenzaSalarioAccessorioUltimoRendiconto) },
        { label: 'Approvazione Rendiconto Anno Prec. nei Termini?', value: formatBoolean(annualData.approvazioneRendicontoPrecedente) },
        { label: 'Fondo Stabile 2016 (per calcolo PNRR3)', value: formatCurrency(annualData.fondoStabile2016PNRR) },
        { label: 'Possibile Incremento PNRR3 (calcolato)', value: formatCurrency(annualData.calcolatoIncrementoPNRR3) },
    ];
    addKeyValueTable(doc, datiPNRR3, '1.4 Dati Annuali per Calcolo PNRR3');

    const si = annualData.simulatoreInput || {} as SimulatoreIncrementoInput;
    const inputSimulatoreData = [
        { label: 'Stipendi tabellari personale 31.12.2023', value: formatCurrency(si.simStipendiTabellari2023) },
        { label: 'Ammontare componente stabile Fondo (ultimo approvato)', value: formatCurrency(si.simFondoStabileUltimoApprovato) },
        { label: 'Ammontare risorse PO/EQ (ultimo approvato)', value: formatCurrency(si.simRisorsePOEQUltimoApprovato) },
        { label: 'Spesa di personale (Consuntivo 2023)', value: formatCurrency(si.simSpesaPersonaleConsuntivo2023) },
        { label: 'Media Entrate Correnti 2021-23 (netto FCDE 2023)', value: formatCurrency(si.simMediaEntrateCorrenti2021_2023) },
        { label: 'Tetto spesa personale L. 296/06 (media 2011-13)', value: formatCurrency(si.simTettoSpesaPersonaleL296_06) },
        { label: 'Costo annuo nuove assunzioni PIAO (a regime)', value: formatCurrency(si.simCostoAnnuoNuoveAssunzioniPIAO) },
        { label: 'Percentuale Oneri su incremento (IRAP e Contributi, %)', value: formatPercentage(si.simPercentualeOneriIncremento) },
    ];
    addKeyValueTable(doc, inputSimulatoreData, '1.5 Input Simulatore Incremento Salario Accessorio');

    addSectionTitle(doc, '2. Calcolo Globale Fondo Risorse Decentrate (Sintesi)');
    const globaleBody = [
        ["Fondo Base Storico (originale 2016)", formatCurrency(calculatedFund.fondoBase2016)],
        ["Totale Incrementi Stabili CCNL (Globale)", formatCurrency(calculatedFund.incrementiStabiliCCNL.reduce((s,c)=>s+c.importo,0))],
        ["Adeguamento Pro-Capite (Globale)", formatCurrency(calculatedFund.adeguamentoProCapite.importo)],
        ["Incremento Art. 23 c.2 (Variazione Personale, Globale)", formatCurrency(calculatedFund.incrementoDeterminatoArt23C2?.importo)],
        ["Incremento Opzionale Enti Virtuosi (Globale)", formatCurrency(calculatedFund.incrementoOpzionaleVirtuosi?.importo)],
        [{content: "Totale Componente Stabile (Globale)", styles: {fontStyle: 'bold' as FontStyle}}, formatCurrency(calculatedFund.totaleComponenteStabile)],
        ["Totale Risorse Variabili (Globale)", formatCurrency(calculatedFund.totaleComponenteVariabile)],
        [{content: "TOTALE FONDO RISORSE DECENTRATE (Globale)", styles: {fontStyle: 'bold' as FontStyle, fillColor: '#dbeafe'}}, formatCurrency(calculatedFund.totaleFondoRisorseDecentrate)],
    ];
    autoTable(doc, {
        startY: CURRENT_Y,
        head: [['Componente', 'Importo (€)']],
        body: globaleBody,
        theme: 'striped', headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontSize: 9, fontStyle: 'bold' as FontStyle }, bodyStyles: { fontSize: 8 },
        didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
    });
    CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;

    addSubTitle(doc, 'Verifica Limite Art. 23 c.2 D.Lgs. 75/2017 (Calcolo Globale)');
    const limiteGlobalData = [
        {label: "Limite Fondo 2016 Originale", value: formatCurrency(calculatedFund.fondoBase2016)},
        {label: "Adeguamento per Variazione Personale", value: formatCurrency(calculatedFund.incrementoDeterminatoArt23C2?.importo || 0)},
        {label: "Limite Fondo 2016 Modificato", value: formatCurrency(calculatedFund.limiteArt23C2Modificato)},
        {label: "Ammontare Soggetto al Limite (Globale)", value: formatCurrency(calculatedFund.ammontareSoggettoLimite2016)},
        {label: "Superamento Limite 2016 (Globale)", value: calculatedFund.superamentoLimite2016 ? formatCurrency(calculatedFund.superamentoLimite2016) : "Nessuno"},
    ];
    addKeyValueTable(doc, limiteGlobalData);

    addSectionTitle(doc, '3. Dettaglio Singoli Fondi');
    const isEnteInCondizioniSpeciali = !!annualData.isEnteDissestato || !!annualData.isEnteStrutturalmenteDeficitario || !!annualData.isEnteRiequilibrioFinanziario;

    if (fondoAccessorioDipendenteData) {
        addSubTitle(doc, '3.1 Fondo Accessorio Personale Dipendente');
        const fad = fondoAccessorioDipendenteData;
        const fadTotals = calculateFadTotals(fad, annualData.simulatoreRisultati, isEnteInCondizioniSpeciali, fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti);
        
        const fadBody: any[][] = [];
        const addFadSectionToBody = (title: string, sectionKey: typeof fadFieldDefinitions[0]['section'], sectionTotal: number, totalLabel: string) => {
            fadBody.push([{ content: title, colSpan: 3, styles: { fontStyle: 'bold' as FontStyle, fillColor: '#eef2ff' } }]); 
            fadFieldDefinitions.filter(def => def.section === sectionKey).forEach(def => {
                 const effectiveVal = getFadEffectiveValueForPDF( // Use the local PDF helper
                    def.key, 
                    fad[def.key], 
                    isEnteInCondizioniSpeciali,
                    annualData.simulatoreRisultati,
                    fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti
                );
                fadBody.push([
                    def.description + (def.isSubtractor ? " (da sottrarre)" : ""),
                    def.riferimento,
                    formatCurrency(effectiveVal)
                ]);
            });
            fadBody.push([{ content: totalLabel, colSpan: 2, styles: { fontStyle: 'bold' as FontStyle, halign: 'right' } }, { content: formatCurrency(sectionTotal), styles: { fontStyle: 'bold' as FontStyle } }]);
        }

        addFadSectionToBody('Risorse Stabili', 'stabili', fadTotals.sommaStabili_Dipendenti, 'Totale Risorse Stabili');
        addFadSectionToBody('Risorse Variabili Soggette al Limite', 'vs_soggette', fadTotals.sommaVariabiliSoggette_Dipendenti, 'Totale Risorse Variabili Soggette');
        addFadSectionToBody('Risorse Variabili Non Soggette al Limite', 'vn_non_soggette', fadTotals.sommaVariabiliNonSoggette_Dipendenti, 'Totale Risorse Variabili Non Soggette');
        addFadSectionToBody('Altre Risorse e Decurtazioni Finali', 'fin_decurtazioni', fadTotals.altreRisorseDecurtazioniFinali_Dipendenti, 'Totale Altre Decurtazioni');
        
        fadBody.push([{ content: 'Decurtazioni per Rispetto Limiti', colSpan: 3, styles: { fontStyle: 'bold' as FontStyle, fillColor: '#eef2ff' } }]);
        const clTotaleParziale = getFadEffectiveValueForPDF('cl_totaleParzialeRisorsePerConfrontoTetto2016', fad.cl_totaleParzialeRisorsePerConfrontoTetto2016,isEnteInCondizioniSpeciali, annualData.simulatoreRisultati, fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti);
        fadBody.push([
            fadFieldDefinitions.find(f=>f.key === 'cl_totaleParzialeRisorsePerConfrontoTetto2016')?.description + " (CALCOLATO)",
            fadFieldDefinitions.find(f=>f.key === 'cl_totaleParzialeRisorsePerConfrontoTetto2016')?.riferimento,
            formatCurrency(clTotaleParziale)
        ]);
        const clDecurtazione = getFadEffectiveValueForPDF('cl_art23c2_decurtazioneIncrementoAnnualeTetto2016', fad.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016, isEnteInCondizioniSpeciali, annualData.simulatoreRisultati, fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti);
        fadBody.push([
            fadFieldDefinitions.find(f=>f.key === 'cl_art23c2_decurtazioneIncrementoAnnualeTetto2016')?.description + " (da sottrarre)",
            fadFieldDefinitions.find(f=>f.key === 'cl_art23c2_decurtazioneIncrementoAnnualeTetto2016')?.riferimento,
            formatCurrency(clDecurtazione)
        ]);

        fadBody.push([{ content: 'TOTALE RISORSE DISPONIBILI (Fondo Personale Dipendente)', colSpan: 2, styles: { fontStyle: 'bold' as FontStyle, halign: 'right', fillColor: '#dbeafe'} }, { content: formatCurrency(fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti), styles: { fontStyle: 'bold' as FontStyle, fillColor: '#dbeafe' } }]);
        
        autoTable(doc, {
            startY: CURRENT_Y,
            head: [['Descrizione Voce', 'Riferimento', 'Importo (€)']],
            body: fadBody,
            theme: 'grid', headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontSize: 9, fontStyle: 'bold' as FontStyle }, bodyStyles: { fontSize: 8, cellPadding: 1.5 },
            columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 50 }, 2: { cellWidth: 'auto', halign: 'right' } },
            didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
        });
        CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;
    }

    if (fondoElevateQualificazioniData) {
        addSubTitle(doc, '3.2 Fondo Elevate Qualificazioni (EQ)');
        const eq = fondoElevateQualificazioniData;
        const eqBody = [
            [{ content: 'Risorse per le EQ', colSpan: 2, styles: { fontStyle: 'bold' as FontStyle, fillColor: '#eef2ff' } }],
            ['Fondo PO 2017', formatCurrency(eq.ris_fondoPO2017)],
            ['Incremento con riduzione fondo dipendenti', formatCurrency(eq.ris_incrementoConRiduzioneFondoDipendenti)],
            ['Incremento limite Art. 23c2 DL34', formatCurrency(eq.ris_incrementoLimiteArt23c2_DL34)],
            ['Incremento 0,22% Monte Salari 2018', formatCurrency(eq.ris_incremento022MonteSalari2018)],
            ['Adeguamento/Decurtazione Tetto 2016 (da sottrarre)', formatCurrency(eq.fin_art23c2_adeguamentoTetto2016)],
            [{ content: 'Totale Risorse Specifiche EQ', styles: { fontStyle: 'bold' as FontStyle } }, formatCurrency(
                (eq.ris_fondoPO2017 || 0) + (eq.ris_incrementoConRiduzioneFondoDipendenti || 0) + (eq.ris_incrementoLimiteArt23c2_DL34 || 0) + (eq.ris_incremento022MonteSalari2018 || 0) - (eq.fin_art23c2_adeguamentoTetto2016 || 0)
            )],
            [{ content: 'Distribuzione Fondo EQ', colSpan: 2, styles: { fontStyle: 'bold' as FontStyle, fillColor: '#eef2ff' } }],
            ['Retribuzione Posizione (Art. 17c2)', formatCurrency(eq.st_art17c2_retribuzionePosizione)],
            ['Retribuzione Posizione (Art. 16c4)', formatCurrency(eq.st_art17c3_retribuzionePosizioneArt16c4)],
            ['Interim EQ (Art. 17c5)', formatCurrency(eq.st_art17c5_interimEQ)],
            ['Maggiorazione Sedi (Art. 23c5)', formatCurrency(eq.st_art23c5_maggiorazioneSedi)],
            ['Retribuzione Risultato (Art. 17c4)', formatCurrency(eq.va_art17c4_retribuzioneRisultato)],
             [{ content: 'Totale Distribuzione Fondo EQ', styles: { fontStyle: 'bold' as FontStyle } }, formatCurrency(
                (eq.st_art17c2_retribuzionePosizione || 0) + (eq.st_art17c3_retribuzionePosizioneArt16c4 || 0) + (eq.st_art17c5_interimEQ || 0) + (eq.st_art23c5_maggiorazioneSedi || 0) + (eq.va_art17c4_retribuzioneRisultato || 0)
            )],
        ];
        autoTable(doc, {
            startY: CURRENT_Y,
            head: [['Descrizione Voce', 'Importo (€)']],
            body: eqBody,
            theme: 'grid', headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontSize: 9, fontStyle: 'bold' as FontStyle }, bodyStyles: { fontSize: 8 },
            columnStyles: { 1: { halign: 'right' } },
            didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
        });
        CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;
    }
    
    const calculateSumExcludingKeys = (obj: Record<string, any>, excludedKeys: string[]): number => {
        let sum = 0;
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && !excludedKeys.includes(key)) {
                const value = obj[key];
                if (typeof value === 'number') {
                    sum += value;
                }
            }
        }
        return sum;
    };
    
    if (fondoSegretarioComunaleData) {
        addSubTitle(doc, '3.3 Risorse Segretario Comunale');
        const seg = fondoSegretarioComunaleData;
        const totaleRisorseLordeSegretarioSum = calculateSumExcludingKeys(seg, ['fin_totaleRisorseRilevantiLimite', 'fin_percentualeCoperturaPostoSegretario']);

        const segBody = [
             [{ content: 'Risorse Stabili Segretario', colSpan: 2, styles: { fontStyle: 'bold' as FontStyle, fillColor: '#eef2ff' } }],
             ['Retribuzione Posizione (CCNL 2011 Art.3c6)', formatCurrency(seg.st_art3c6_CCNL2011_retribuzionePosizione)],
             // Add all other stable items...
             [{ content: 'Risorse Variabili Segretario', colSpan: 2, styles: { fontStyle: 'bold' as FontStyle, fillColor: '#eef2ff' } }],
             ['Diritti Segreteria (CCNL 2024 Art.56c1f)', formatCurrency(seg.va_art56c1f_CCNL2024_dirittiSegreteria)],
             // Add all other variable items...
             [{ content: 'Totale Risorse Lorde Segretario', styles: { fontStyle: 'bold' as FontStyle } }, formatCurrency(totaleRisorseLordeSegretarioSum)],
             ['Percentuale Copertura Posto', formatPercentage(seg.fin_percentualeCoperturaPostoSegretario)],
             [{ content: 'Totale Risorse Effettivamente Disponibili (Segretario)', styles: { fontStyle: 'bold' as FontStyle, fillColor: '#dbeafe' } }, formatCurrency(
                 totaleRisorseLordeSegretarioSum * ((seg.fin_percentualeCoperturaPostoSegretario || 100) / 100)
             )],
             ['Totale Risorse Rilevanti per Limite Art. 23 (calcolato)', formatCurrency(seg.fin_totaleRisorseRilevantiLimite)],
        ];
         autoTable(doc, {
            startY: CURRENT_Y,
            head: [['Descrizione Voce', 'Importo (€)']],
            body: segBody,
            theme: 'grid', headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontSize: 9, fontStyle: 'bold' as FontStyle }, bodyStyles: { fontSize: 8 },
            columnStyles: { 1: { halign: 'right' } },
            didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
        });
        CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;
    }

    if (annualData.hasDirigenza && fondoDirigenzaData) {
        addSubTitle(doc, '3.4 Fondo Dirigenza');
        const dir = fondoDirigenzaData;
        const dirBody = [
            [{ content: 'Risorse Stabili Dirigenza', colSpan: 2, styles: { fontStyle: 'bold' as FontStyle, fillColor: '#eef2ff' } }],
            ['Unico Importo 2020 (CCNL 2020 Art.57c2a)', formatCurrency(dir.st_art57c2a_CCNL2020_unicoImporto2020)],
            // Add all other stable items...
            [{ content: 'Risorse Variabili Dirigenza', colSpan: 2, styles: { fontStyle: 'bold' as FontStyle, fillColor: '#eef2ff' } }],
            ['Risorse Legge/Sponsor (CCNL 2020 Art.57c2b)', formatCurrency(dir.va_art57c2b_CCNL2020_risorseLeggeSponsor)],
            // Add all other variable items...
             [{ content: 'Calcolo Limiti', colSpan: 2, styles: { fontStyle: 'bold' as FontStyle, fillColor: '#eef2ff' } }],
            ['Totale Parziale Risorse per Confronto Tetto 2016 (calcolato)', formatCurrency(dir.lim_totaleParzialeRisorseConfrontoTetto2016)],
            ['Adeguamento Annuale Tetto 2016', formatCurrency(dir.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016)],
            ['Misure Mancato Rispetto Vincoli (da sottrarre)', formatCurrency(dir.lim_art4_DL16_2014_misureMancatoRispettoVincoli)],
            [{ content: 'Totale Risorse Effettivamente Disponibili (Dirigenza)', styles: { fontStyle: 'bold' as FontStyle, fillColor: '#dbeafe' } }, formatCurrency(
                (Object.keys(dir)
                    .filter(k => k.startsWith('st_') || k.startsWith('va_'))
                    .reduce((sum, key) => sum + ((dir as any)[key] || 0), 0)
                ) + (dir.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016 || 0) - (dir.lim_art4_DL16_2014_misureMancatoRispettoVincoli || 0)
            )],
        ];
        autoTable(doc, {
            startY: CURRENT_Y,
            head: [['Descrizione Voce', 'Importo (€)']],
            body: dirBody,
            theme: 'grid', headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontSize: 9, fontStyle: 'bold' as FontStyle }, bodyStyles: { fontSize: 8 },
            columnStyles: { 1: { halign: 'right' } },
            didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
        });
        CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;
    }
    
    addSectionTitle(doc, '4. Riepilogo Risorse Disponibili per Fondo');
    const { 
        totaleRisorseDisponibiliContrattazione_Dipendenti: fadTotal 
    } = calculateFadTotals(fondoAccessorioDipendenteData || {}, annualData.simulatoreRisultati, isEnteInCondizioniSpeciali, fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti);
    
    const eqTotal = ((fondoElevateQualificazioniData?.ris_fondoPO2017 || 0) + (fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti || 0) + (fondoElevateQualificazioniData?.ris_incrementoLimiteArt23c2_DL34 || 0) + (fondoElevateQualificazioniData?.ris_incremento022MonteSalari2018 || 0) - (fondoElevateQualificazioniData?.fin_art23c2_adeguamentoTetto2016 || 0));
    
    const totaleRisorseLordeSegretarioSumRiepilogo = calculateSumExcludingKeys(fondoSegretarioComunaleData || {}, ['fin_totaleRisorseRilevantiLimite', 'fin_percentualeCoperturaPostoSegretario']);
    const segTotalVal = totaleRisorseLordeSegretarioSumRiepilogo * (((fondoSegretarioComunaleData || {}).fin_percentualeCoperturaPostoSegretario || 100) / 100);

    let dirTotal = 0;
    if(annualData.hasDirigenza && fondoDirigenzaData){
         dirTotal = (Object.keys(fondoDirigenzaData)
                    .filter(k => k.startsWith('st_') || k.startsWith('va_'))
                    .reduce((sum, key) => sum + ((fondoDirigenzaData as any)[key] || 0), 0)
                ) + (fondoDirigenzaData.lim_art23c2_DLGS75_2017_adeguamentoAnnualeTetto2016 || 0) - (fondoDirigenzaData.lim_art4_DL16_2014_misureMancatoRispettoVincoli || 0);
    }
    const grandTotal = fadTotal + eqTotal + segTotalVal + dirTotal;
    
    type ReportCellContent = string | number | { content: string | string[]; colSpan?: number; rowSpan?: number; styles?: Partial<import('jspdf-autotable').StylesProps> };

    const riepilogoRisorseBody: ReportCellContent[][] = [
        ['Fondo Accessorio Personale Dipendente', formatCurrency(fadTotal)],
        ['Fondo Elevate Qualificazioni (EQ)', formatCurrency(eqTotal)],
        ['Risorse Segretario Comunale', formatCurrency(segTotalVal)],
    ];
    if(annualData.hasDirigenza) {
        riepilogoRisorseBody.push(['Fondo Dirigenza', formatCurrency(dirTotal)]);
    }
    riepilogoRisorseBody.push([
        {content: 'TOTALE COMPLESSIVO RISORSE DISPONIBILI', styles:{fontStyle:'bold' as FontStyle, fillColor: '#dbeafe'}}, 
        {content: formatCurrency(grandTotal), styles:{fontStyle:'bold' as FontStyle, fillColor: '#dbeafe'}}
    ]);
     autoTable(doc, {
        startY: CURRENT_Y,
        head: [['Tipologia Fondo', 'Totale Disponibile (€)']],
        body: riepilogoRisorseBody,
        theme: 'grid', headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontSize: 9, fontStyle: 'bold' as FontStyle }, bodyStyles: { fontSize: 8 },
        columnStyles: { 1: { halign: 'right' } },
        didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
    });
    CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;

    addSectionTitle(doc, '5. Risultati Simulatore Incremento Salario Accessorio');
    const simRisultati = annualData.simulatoreRisultati;
    if (simRisultati) {
        const simData = [
            {label: "Fase 1: Obiettivo 48% Stipendi Tab. 2023", value: formatCurrency(simRisultati.fase1_obiettivo48)},
            {label: "Fase 1: Fondo Attuale Complessivo (Stabile + PO/EQ)", value: formatCurrency(simRisultati.fase1_fondoAttualeComplessivo)},
            {label: "Fase 1: Incremento Potenziale Lordo (Limite 1)", value: formatCurrency(simRisultati.fase1_incrementoPotenzialeLordo)},
            {label: "Fase 2: Spesa Personale Futura Prevista", value: formatCurrency(simRisultati.fase2_spesaPersonaleAttualePrevista)},
            {label: "Fase 2: Soglia % Spesa Personale / Entrate Correnti (DM 17/03/2020)", value: formatPercentage(simRisultati.fase2_sogliaPercentualeDM17_03_2020)},
            {label: "Fase 2: Limite Spesa Sostenibile", value: formatCurrency(simRisultati.fase2_limiteSostenibileDL34)},
            {label: "Fase 2: Spazio Disponibile Sostenibilità (Limite 2)", value: formatCurrency(simRisultati.fase2_spazioDisponibileDL34)},
            {label: "Fase 3: Margine Disponibile Tetto Storico L.296/06 (Limite 3)", value: formatCurrency(simRisultati.fase3_margineDisponibileL296_06)},
            {label: "Fase 4: Spazio Utilizzabile Lordo (Min dei 3 limiti)", value: formatCurrency(simRisultati.fase4_spazioUtilizzabileLordo)},
            {label: "Fase 5: Incremento Netto Effettivo Fondo (da usare in FAD)", value: formatCurrency(simRisultati.fase5_incrementoNettoEffettivoFondo)},
        ];
        addKeyValueTable(doc, simData);
    } else {
        addText(doc, 'Simulazione non eseguita o dati non disponibili.');
    }
    
    addSectionTitle(doc, '6. Controlli di Conformità Normativa');
    const complianceBody = complianceChecks.map(check => {
        let statusText = check.isCompliant ? 'Conforme' : 'NON CONFORME';
        if (check.gravita === 'warning' && !check.isCompliant) statusText = 'Attenzione';
        return [
            check.descrizione,
            statusText,
            check.messaggio,
            check.riferimentoNormativo,
            check.gravita.toUpperCase(),
        ];
    });
    autoTable(doc, {
        startY: CURRENT_Y,
        head: [['Descrizione Controllo', 'Stato', 'Messaggio', 'Riferimento', 'Gravità']],
        body: complianceBody,
        theme: 'grid',
        headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontStyle: 'bold' as FontStyle, fontSize: 9 },
        bodyStyles: { fontSize: 8, cellPadding: 1.5 },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 20 }, 2: { cellWidth: 'auto'}, 3: {cellWidth: 30}, 4: {cellWidth: 15} },
        didParseCell: function (data: CellHookData) { // Explicitly type data
            if (data.cell && data.cell.styles && (data.column.index === 1 || data.column.index === 4)) { 
                const rawValue = String(data.cell.raw); // Ensure raw is treated as string for comparison
                if (rawValue === 'NON CONFORME' || rawValue === 'ERROR') {
                    data.cell.styles.textColor = '#dc2626'; 
                    data.cell.styles.fontStyle = 'bold' as FontStyle;
                } else if (rawValue === 'Attenzione' || rawValue === 'WARNING') {
                    data.cell.styles.textColor = '#f59e0b'; 
                } else if (rawValue === 'Conforme' || rawValue === 'INFO') {
                     data.cell.styles.textColor = '#16a34a'; 
                }
            }
        },
        didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
    });
    CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING * 0.5;

    doc.save(`Riepilogo_Generale_Fondo_${annualData.annoRiferimento}.pdf`);
};


const padString = (str: string, length: number, align: 'left' | 'right' = 'left'): string => {
  const strLength = str.length;
  if (strLength >= length) return str.substring(0, length);
  const padding = ' '.repeat(length - strLength);
  return align === 'left' ? str + padding : padding + str;
};


export const generateDeterminazioneTXT = (
  calculatedFund: CalculatedFund,
  fundData: FundData,
  currentUser: User
): void => {
  const { annualData, historicalData } = fundData;
  const annoRiferimento = annualData.annoRiferimento;
  const currentDate = new Date().toLocaleDateString('it-IT');

  const fadData = fundData.fondoAccessorioDipendenteData || {} as FondoAccessorioDipendenteData;
  const isEnteInCondizioniSpeciali = !!annualData.isEnteDissestato || !!annualData.isEnteStrutturalmenteDeficitario || !!annualData.isEnteRiequilibrioFinanziario;
  
  const fadTotals = calculateFadTotals(fadData, annualData.simulatoreRisultati, isEnteInCondizioniSpeciali, fundData.fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti);

  let txtContent = "";

  txtContent += `DETERMINAZIONE DIRIGENZIALE N. ____ del ${currentDate}\n`;
  txtContent += `Registro generale n. ____\n\n`;

  txtContent += `Oggetto: Costituzione fondo per il salario accessorio ${annoRiferimento} – personale dipendente – parte stabile e variabile – certificazione rispetto del limite di spesa ex art. 23, comma 2, D.Lgs. n. 75/2017 – allegato tabella costituzione fondo.\n\n`;

  txtContent += `Premesso che:\n`;
  txtContent += `- è stata approvata la programmazione del bilancio ${annoRiferimento}–${annoRiferimento + 2} e il PEG relativo;\n`;
  const ccnlText = annoRiferimento >= 2022 ? 'CCNL Funzioni Locali 2019-2021 (sottoscritto il 16/11/2022)' : 'CCNL Funzioni Locali 2016-2018 (sottoscritto il 21/05/2018)';
  txtContent += `- sono vigenti i ${ccnlText} con successive proroghe e accordi integrativi;\n`;
  txtContent += `- l’art. 23 del D.Lgs. 165/2001 e l’art. 23, comma 2, del D.Lgs. 75/2017 impongono il limite della spesa accessoria rispetto all’anno 2016;\n`;
  txtContent += `- i decreti e le circolari più recenti, la normativa RGS e le pronunce della Corte dei Conti prevedono l’applicazione del valore medio pro-capite e del tetto 2016, nonché le possibili deroghe autorizzate fino a oggi :contentReference[oaicite:1]{index=1};\n\n`;

  txtContent += `Considerato che:\n`;
  txtContent += `- è stata predisposta una tabella comparativa (Allegato A) che riporta la spesa accessoria 2016 e 2018, il numero complessivo del personale, il valore medio pro-capite, l’individuazione dell’eventuale scostamento massimale e il calcolo delle decurtazioni necessarie per rispettare il tetto;\n`;
  txtContent += `- la tabella distingue chiaramente le voci di spesa stabili e variabili, con indicazione delle risorse certe, stabili o vincolate;\n`;
  txtContent += `- tutte le voci di retribuzione accessoria rientrano pienamente nel quadro normativo, inclusi CCNL, circolari RGS e vigilanza Corte dei Conti;\n\n`;

  txtContent += `Visti:\n`;
  txtContent += `- D.Lgs. 267/2000 e D.Lgs. 118/2011 (armonizzazione contabile);\n`;
  txtContent += `- D.Lgs. 165/2001, art. 23, e D.Lgs. 75/2017, art. 23, comma 2;\n`;
  txtContent += `- D.L. 34/2019, art. 33 comma 2, e D.M. 17/3/2020;\n`;
  txtContent += `- CCNL Funzioni Locali 2019-2021, art. 79;\n`;
  txtContent += `- Statuto e Regolamento comunale di contabilità;\n`;
  txtContent += `- Circolari RGS, pronunce Corte dei Conti su valore medio pro-capite e tetti accessori :contentReference[oaicite:2]{index=2};\n\n`;
  
  txtContent += `DETERMINA\n`;
  txtContent += `1. Di costituire per l’anno ${annoRiferimento} il Fondo per il salario accessorio del personale dipendente, articolato in:\n`;
  txtContent += `   a) Parte stabile, composta da voci consolidate derivanti dai CCNL e risorse contrattuali annualmente previste, dettagliate nell'Allegato A;\n`;
  txtContent += `   b) Parte variabile, approvata con apposita delibera di Giunta, anch’essa riportata nell’Allegato A.\n`;
  txtContent += `2. Di attestare il rispetto del limite di spesa sull’intera spesa accessoria, secondo l’art. 23, comma 2, D.Lgs. 75/2017, mediante il confronto con la spesa 2016, la rilevazione del valore medio pro-capite, il numero dei dipendenti e l’applicazione delle eventuali decurtazioni automatiche per il rispetto del tetto.\n`;
  txtContent += `3. Di dichiarare che l’ammontare complessivo del fondo è conforme alla legislazione vigente, inclusi principi contabili, circolari RGS e pareri Corte dei Conti.\n`;
  txtContent += `4. Di impegnare le somme previste sul bilancio ${annoRiferimento}, nei capitoli dedicati al salario accessorio.\n`;
  txtContent += `5. Di vincolare le risorse residue e la definizione finale alla contrattazione decentrata integrativa.\n`;
  txtContent += `6. Di trasmettere la presente determinazione con Allegato A al Collegio dei Revisori per la certificazione formale.\n`;
  txtContent += `7. Di trasmettere copia dell’atto alle Organizzazioni Sindacali e di pubblicarlo all’albo pretorio e sul sito istituzionale ai fini della trasparenza.\n`;
  txtContent += `8. Di riservare eventuali revisioni, in caso di modifiche normative, variazioni organiche, o nuovi pareri RGS/Corte dei Conti.\n\n\n`;
  
  txtContent += `IL DIRIGENTE RESPONSABILE\n`;
  txtContent += `( ${currentUser.name} )\n\n\n`;

  txtContent += `\n\n------------------------------ PAGINA SEPARATA PER ALLEGATO ------------------------------\n\n`;
  txtContent += `Allegato A (Parte integrante e sostanziale): "Tabella di costituzione del fondo ${annoRiferimento} e verifica del limite"\n\n`;

  const fondoPersonaleNonDirEQ2018_Art23_val = historicalData.fondoPersonaleNonDirEQ2018_Art23 || 0;
  const fondoEQ2018_Art23_val = historicalData.fondoEQ2018_Art23 || 0;
  const fondoBase2018_perArt23 = fondoPersonaleNonDirEQ2018_Art23_val + fondoEQ2018_Art23_val;

  let dipendentiEquivalenti2018_Art23 = 0;
  if (annualData.personale2018PerArt23) {
    dipendentiEquivalenti2018_Art23 = annualData.personale2018PerArt23.reduce((sum, emp) => {
      const ptPerc = (typeof emp.partTimePercentage === 'number' && emp.partTimePercentage >=0 && emp.partTimePercentage <=100) ? emp.partTimePercentage / 100 : 0;
      return sum + ptPerc;
    }, 0);
  }
  let dipendentiEquivalentiAnnoRif_Art23 = 0;
  if (annualData.personaleAnnoRifPerArt23) {
    dipendentiEquivalentiAnnoRif_Art23 = annualData.personaleAnnoRifPerArt23.reduce((sum, emp) => {
      const ptPerc = (typeof emp.partTimePercentage === 'number' && emp.partTimePercentage >=0 && emp.partTimePercentage <=100) ? emp.partTimePercentage / 100 : 0;
      const cedolini = (typeof emp.cedoliniEmessi === 'number' && emp.cedoliniEmessi >=0 && emp.cedoliniEmessi <=12) ? emp.cedoliniEmessi : 0;
      const cedoliniRatio = cedolini > 0 ? cedolini / 12 : 0;
      return sum + (ptPerc * cedoliniRatio);
    }, 0);
  }
  let valoreMedioProCapite2018_Art23c2 = 0;
  if (fondoBase2018_perArt23 > 0 && dipendentiEquivalenti2018_Art23 > 0) {
    valoreMedioProCapite2018_Art23c2 = fondoBase2018_perArt23 / dipendentiEquivalenti2018_Art23;
  }
  
  txtContent += `Spesa accessoria di riferimento (2016): ${formatCurrency(calculatedFund.fondoBase2016)}\n`;
  txtContent += `Spesa accessoria di riferimento (2018, per calcolo Art. 23 c.2): ${formatCurrency(fondoBase2018_perArt23)}\n`;
  txtContent += `Numero dipendenti di confronto (31.12.2018): ${formatNumber(dipendentiEquivalenti2018_Art23, 2)}\n`;
  txtContent += `Numero dipendenti di confronto (Anno ${annoRiferimento}): ${formatNumber(dipendentiEquivalentiAnnoRif_Art23, 2)}\n`;
  txtContent += `Valore medio pro-capite (2018, per calcolo Art. 23 c.2): ${formatCurrency(valoreMedioProCapite2018_Art23c2)}\n`;
  txtContent += `Limite Art. 23 c.2 D.Lgs. 75/2017 (originario 2016): ${formatCurrency(calculatedFund.fondoBase2016)}\n`;
  txtContent += `Adeguamento limite per variazione personale (Art. 23 c.2): ${formatCurrency(calculatedFund.incrementoDeterminatoArt23C2?.importo || 0)}\n`;
  txtContent += `NUOVO LIMITE ART. 23 C.2 D.LGS. 75/2017 (MODIFICATO): ${formatCurrency(calculatedFund.limiteArt23C2Modificato)}\n`;
  txtContent += `Decurtazione Fondo Personale Dipendente per rispetto limite (se applicabile): ${formatCurrency(fadData.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016)}\n\n`;

  const colWidthDesc = 70; 
  const colWidthRef = 40;
  const colWidthImporto = 20;
  const lineSeparator = '-'.repeat(colWidthDesc + colWidthRef + colWidthImporto + 6) + '\n';

  const addTxtTableRow = (desc: string, ref: string, imp: string, isHeader = false, isTotal = false) => {
    let row = "";
    if (isHeader) row += lineSeparator;
    row += `${padString(desc, colWidthDesc)} | ${padString(ref, colWidthRef)} | ${padString(imp, colWidthImporto, 'right')}\n`;
    if (isHeader || isTotal) row += lineSeparator;
    return row;
  };
  
  txtContent += addTxtTableRow("Descrizione Voce", "Riferimento Normativo", "Importo (€)", true);

  const createSection = (title: string, items: Array<{key: keyof FondoAccessorioDipendenteData, description: string, riferimento: string, isSubtractor?: boolean, isDisabledByCondizioniSpeciali?: boolean}>, sectionTotal: number, totalLabel: string) => {
    txtContent += `\n${title.toUpperCase()}\n`;
    items.forEach(def => {
        const itemValue = getFadEffectiveValueHelper(
            def.key, 
            fadData[def.key], 
            def.isDisabledByCondizioniSpeciali, 
            isEnteInCondizioniSpeciali,
            annualData.simulatoreRisultati,
            fundData.fondoElevateQualificazioniData?.ris_incrementoConRiduzioneFondoDipendenti
            );
        const displayValue = def.isSubtractor && itemValue > 0 ? `- ${formatCurrency(itemValue, '0.00')}` : formatCurrency(itemValue, '0.00');
        txtContent += addTxtTableRow(def.description, def.riferimento, displayValue);
    });
    txtContent += addTxtTableRow(totalLabel, "", formatCurrency(sectionTotal), false, true);
  };
  
  createSection("Risorse Stabili", fadFieldDefinitions.filter(d => d.section === 'stabili'), fadTotals.sommaStabili_Dipendenti, "Totale Risorse Stabili");
  createSection("Risorse Variabili Soggette al Limite", fadFieldDefinitions.filter(d => d.section === 'vs_soggette'), fadTotals.sommaVariabiliSoggette_Dipendenti, "Totale Risorse Variabili Soggette");
  createSection("Risorse Variabili Non Soggette al Limite", fadFieldDefinitions.filter(d => d.section === 'vn_non_soggette'), fadTotals.sommaVariabiliNonSoggette_Dipendenti, "Totale Risorse Variabili Non Soggette");
  createSection("Altre Risorse e Decurtazioni Finali", fadFieldDefinitions.filter(d => d.section === 'fin_decurtazioni'), fadTotals.altreRisorseDecurtazioniFinali_Dipendenti, "Totale Altre Decurtazioni Finali");
  createSection("Decurtazioni per Rispetto Limiti Salario Accessorio", fadFieldDefinitions.filter(d => d.section === 'cl_limiti'), fadTotals.decurtazioniLimiteSalarioAccessorio_Dipendenti, "Totale Decurtazioni per Limiti");

  txtContent += `\n${lineSeparator.replace(/-/g, '=')}`;
  txtContent += `${padString("TOTALE RISORSE DISPONIBILI PER LA CONTRATTAZIONE (Fondo Personale Dipendente)", colWidthDesc + colWidthRef + 3)} ${padString(formatCurrency(fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti), colWidthImporto, 'right')}\n`;
  txtContent += `${lineSeparator.replace(/-/g, '=')}`;


  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Determinazione_Fondo_ACCESSORIO_${annoRiferimento}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};


// --- XLS Generation for Fondo Accessorio Dipendente ---

const escapeXml = (unsafe: string): string => {
  if (unsafe === undefined || unsafe === null) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const generateFADXLS = (
  fadData: FondoAccessorioDipendenteData,
  annoRiferimento: number,
  simulatoreRisultati?: SimulatoreIncrementoRisultati,
  isEnteInCondizioniSpeciali?: boolean,
  incrementoEQconRiduzioneDipendenti?: number
): void => {
  const fadTotals = calculateFadTotals(fadData, simulatoreRisultati, isEnteInCondizioniSpeciali, incrementoEQconRiduzioneDipendenti);

  let rowsXml = '';

  const addHeaderRow = () => {
    rowsXml += `
    <Row ss:StyleID="sHeader">
      <Cell><Data ss:Type="String">Descrizione Voce</Data></Cell>
      <Cell><Data ss:Type="String">Riferimento Normativo</Data></Cell>
      <Cell><Data ss:Type="String">Importo (€)</Data></Cell>
    </Row>`;
  };
  
  const addSectionTitleRow = (title: string) => {
    rowsXml += `
    <Row ss:StyleID="sSectionTitle">
      <Cell ss:MergeAcross="2"><Data ss:Type="String">${escapeXml(title.toUpperCase())}</Data></Cell>
    </Row>`;
  };

  const addDataRow = (desc: string, ref: string, val?: number, isSubtractor?: boolean) => {
    const effectiveValue = val || 0;
    const displayValue = isSubtractor && effectiveValue > 0 ? -effectiveValue : effectiveValue;
    rowsXml += `
    <Row>
      <Cell><Data ss:Type="String">${escapeXml(desc)} ${isSubtractor ? '(da sottrarre)' : ''}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(ref)}</Data></Cell>
      <Cell ss:StyleID="sCurrency"><Data ss:Type="Number">${displayValue}</Data></Cell>
    </Row>`;
  };
  
  const addTotalRow = (label: string, total?: number) => {
    rowsXml += `
    <Row ss:StyleID="sTotal">
      <Cell ss:Index="2"><Data ss:Type="String">${escapeXml(label)}</Data></Cell>
      <Cell ss:StyleID="sCurrencyBold"><Data ss:Type="Number">${total || 0}</Data></Cell>
    </Row>`;
  };

  const generateSectionRows = (sectionKey: typeof fadFieldDefinitions[0]['section']) => {
    fadFieldDefinitions
      .filter(def => def.section === sectionKey)
      .forEach(def => {
        const effectiveVal = getFadEffectiveValueHelper(
            def.key, 
            fadData[def.key], 
            def.isDisabledByCondizioniSpeciali, 
            isEnteInCondizioniSpeciali,
            simulatoreRisultati,
            incrementoEQconRiduzioneDipendenti
        );
        addDataRow(def.description, def.riferimento, effectiveVal, def.isSubtractor);
    });
  };
  
  // Title row for the sheet
   rowsXml += `
    <Row>
      <Cell ss:MergeAcross="2" ss:StyleID="sSectionTitle"><Data ss:Type="String">Dettaglio Fondo Accessorio Personale Dipendente - Anno ${annoRiferimento}</Data></Cell>
    </Row>
    <Row/>`; // Empty row for spacing

  addHeaderRow();

  // Risorse Stabili
  addSectionTitleRow("Risorse Stabili");
  generateSectionRows('stabili');
  addTotalRow("Totale Risorse Stabili", fadTotals.sommaStabili_Dipendenti);
  rowsXml += `<Row/>`; // Empty row

  // Risorse Variabili Soggette al Limite
  addSectionTitleRow("Risorse Variabili Soggette al Limite");
  generateSectionRows('vs_soggette');
  addTotalRow("Totale Risorse Variabili Soggette al Limite", fadTotals.sommaVariabiliSoggette_Dipendenti);
  rowsXml += `<Row/>`;

  // Risorse Variabili Non Soggette al Limite
  addSectionTitleRow("Risorse Variabili Non Soggette al Limite");
  generateSectionRows('vn_non_soggette');
  addTotalRow("Totale Risorse Variabili Non Soggette al Limite", fadTotals.sommaVariabiliNonSoggette_Dipendenti);
  rowsXml += `<Row/>`;

  // Altre Risorse e Decurtazioni Finali
  addSectionTitleRow("Altre Risorse e Decurtazioni Finali");
  generateSectionRows('fin_decurtazioni');
  addTotalRow("Totale Altre Decurtazioni Finali", fadTotals.altreRisorseDecurtazioniFinali_Dipendenti);
  rowsXml += `<Row/>`;

  // Calcolo del Rispetto dei Limiti del Salario Accessorio
  addSectionTitleRow("Calcolo del Rispetto dei Limiti del Salario Accessorio");
  addDataRow(
    "Totale parziale risorse disponibili per il fondo (CALCOLATO) ai fini del confronto con il tetto complessivo del salario accessorio dell'anno 2016.",
    fadFieldDefinitions.find(f => f.key === 'cl_totaleParzialeRisorsePerConfrontoTetto2016')?.riferimento || '',
    fadData.cl_totaleParzialeRisorsePerConfrontoTetto2016
  );
  addDataRow(
    fadFieldDefinitions.find(f => f.key === 'cl_art23c2_decurtazioneIncrementoAnnualeTetto2016')?.description || '',
    fadFieldDefinitions.find(f => f.key === 'cl_art23c2_decurtazioneIncrementoAnnualeTetto2016')?.riferimento || '',
    fadData.cl_art23c2_decurtazioneIncrementoAnnualeTetto2016,
    true
  );
  rowsXml += `<Row/>`;


  // Grand Total
  rowsXml += `
  <Row ss:StyleID="sSectionTitle">
    <Cell ss:MergeAcross="1"><Data ss:Type="String">TOTALE RISORSE DISPONIBILI PER LA CONTRATTAZIONE</Data></Cell>
    <Cell ss:StyleID="sCurrencyBold"><Data ss:Type="Number">${fadTotals.totaleRisorseDisponibiliContrattazione_Dipendenti || 0}</Data></Cell>
  </Row>`;


  const xmlString = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>Salario Accessorio App</Author>
    <Created>${new Date().toISOString()}</Created>
    <Company>Ente Locale</Company>
    <Version>1.00</Version>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Bottom"/>
      <Borders/>
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="sHeader">
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#000000" ss:Bold="1"/>
      <Interior ss:Color="#EBF1DE" ss:Pattern="Solid"/> {/* Light green header */}
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
      </Borders>
    </Style>
    <Style ss:ID="sTotal">
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#000000" ss:Bold="1"/>
      <Interior ss:Color="#FDE9D9" ss:Pattern="Solid"/> {/* Light orange total */}
       <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
      </Borders>
    </Style>
    <Style ss:ID="sCurrency">
      <NumberFormat ss:Format="&quot;€&quot;\\ #,##0.00"/>
    </Style>
    <Style ss:ID="sCurrencyBold">
      <NumberFormat ss:Format="&quot;€&quot;\\ #,##0.00"/>
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#000000" ss:Bold="1"/>
    </Style>
    <Style ss:ID="sSectionTitle">
      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
      <Interior ss:Color="#DCE6F1" ss:Pattern="Solid"/> {/* Light blue section title */}
       <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="Fondo Personale Dipendente">
    <Table ss:ExpandedColumnCount="3" ss:ExpandedRowCount="${fadFieldDefinitions.length + 20}" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="15">
      <Column ss:AutoFitWidth="0" ss:Width="400"/>
      <Column ss:AutoFitWidth="0" ss:Width="250"/>
      <Column ss:AutoFitWidth="0" ss:Width="120"/>
      ${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlString], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Dettaglio_Fondo_Personale_Dipendente_${annoRiferimento}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
