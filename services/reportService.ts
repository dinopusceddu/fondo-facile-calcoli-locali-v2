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
    getFadEffectiveValueHelper,
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

// --- Main PDF Generation Functions ---

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
        { label: 'Comp. stabile Fondo anno applicazione (€)', value: formatCurrency(si.simFondoStabileAnnoApplicazione) },
        { label: 'Risorse EQ anno applicazione (€)', value: formatCurrency(si.simRisorsePOEQAnnoApplicazione) },
        { label: 'Spesa di personale (Consuntivo 2023)', value: formatCurrency(si.simSpesaPersonaleConsuntivo2023) },
        { label: 'Media Entrate Correnti 2021-23 (netto FCDE 2023)', value: formatCurrency(si.simMediaEntrateCorrenti2021_2023) },
        { label: 'Tetto di spesa personale art. 1 c. 557 o c. 562 L. 296/06', value: formatCurrency(si.simTettoSpesaPersonaleL296_06) },
        { label: 'Costo annuo nuove assunzioni PIAO (€)', value: formatCurrency(si.simCostoAnnuoNuoveAssunzioniPIAO) },
        { label: 'Percentuale oneri sull\'incremento (%)', value: formatPercentage(si.simPercentualeOneriIncremento) },
    ];
    addKeyValueTable(doc, inputSimulatoreData, '1.5 Dati per Simulatore Incremento Potenziale');

    // --- 2. RISULTATI ---
    // (Aggiungere altre sezioni di output qui, es. Risultati Simulatore, Dettaglio Fondi, Compliance)
    
    // Esempio: Risultati Simulatore
    if (annualData.simulatoreRisultati) {
        addSectionTitle(doc, '2. Risultati Simulatore Incremento');
        const sr = annualData.simulatoreRisultati;
        const risultatiSimulatoreData = [
            { label: 'Fase 1: Incremento Potenziale Lordo (Target 48%)', value: formatCurrency(sr.fase1_incrementoPotenzialeLordo) },
            { label: 'Fase 2: Spazio Disponibile (Limite Sostenibilità)', value: formatCurrency(sr.fase2_spazioDisponibileDL34) },
            { label: 'Fase 3: Margine Disponibile (Tetto Storico)', value: formatCurrency(sr.fase3_margineDisponibileL296_06) },
            { label: 'Fase 4: Spazio Utilizzabile Lordo (minore dei 3)', value: formatCurrency(sr.fase4_spazioUtilizzabileLordo) },
            { label: 'Fase 5: Incremento Netto Effettivo del Fondo', value: formatCurrency(sr.fase5_incrementoNettoEffettivoFondo) },
        ];
        addKeyValueTable(doc, risultatiSimulatoreData, 'Riepilogo Fasi Simulatore');
    }

    // --- 3. CONTROLLI DI CONFORMITÀ ---
    addSectionTitle(doc, '3. Controlli di Conformità');
    const complianceBody = complianceChecks.map(c => [
        c.descrizione,
        c.isCompliant ? 'Conforme' : 'NON Conforme',
        c.valoreAttuale || '-',
        c.limite || '-',
        c.messaggio
    ]);
     autoTable(doc, {
        startY: CURRENT_Y,
        head: [['Controllo', 'Stato', 'Valore', 'Limite', 'Messaggio']],
        body: complianceBody,
        theme: 'striped',
        headStyles: { fillColor: '#e0e7ff', textColor: '#1e3a8a', fontSize: 9, fontStyle: 'bold' as FontStyle }, 
        bodyStyles: { fontSize: 8 },
        columnStyles: { 4: { cellWidth: 60 } },
        didDrawPage: (data) => { CURRENT_Y = data.cursor?.y ? data.cursor.y + LINE_SPACING : MARGIN; }
    });
    CURRENT_Y = (doc as any).lastAutoTable.finalY + SECTION_SPACING;

    // Save the PDF
    doc.save(`Riepilogo_Generale_${annualData.denominazioneEnte || 'Ente'}_${annualData.annoRiferimento}.pdf`);
};


export const generateDeterminazioneTXT = (
    calculatedFund: CalculatedFund,
    fundData: FundData,
    currentUser: User
): void => {
    const { annualData } = fundData;
    const annoRiferimento = annualData.annoRiferimento;
    
    let content = `DETERMINAZIONE DIRIGENZIALE N.____ DEL __/__/${annoRiferimento}\n\n`;
    content += `OGGETTO: Costituzione del Fondo delle Risorse Decentrate per l'anno ${annoRiferimento}\n\n`;
    content += `IL DIRIGENTE RESPONSABILE\n\n`;
    content += `VISTI:\n`;
    content += `- Il D.Lgs. 30 marzo 2001, n. 165;\n`;
    content += `- Il CCNL Funzioni Locali 2019-2021, sottoscritto il 16/11/2022;\n`;
    content += `- L'Art. 23, comma 2, del D.Lgs. 25 maggio 2017, n. 75;\n\n`;
    content += `DATO ATTO che le risorse destinate al finanziamento del Fondo sono state quantificate come segue:\n\n`;

    content += `PARTE STABILE\n`;
    content += ` - Fondo Storico Base 2016: ${formatCurrency(calculatedFund.fondoBase2016)}\n`;
    calculatedFund.incrementiStabiliCCNL.forEach(item => {
        content += ` - ${item.descrizione} (${item.riferimento}): ${formatCurrency(item.importo)}\n`;
    });
    if (calculatedFund.incrementoDeterminatoArt23C2) {
         content += ` - ${calculatedFund.incrementoDeterminatoArt23C2.descrizione} (${calculatedFund.incrementoDeterminatoArt23C2.riferimento}): ${formatCurrency(calculatedFund.incrementoDeterminatoArt23C2.importo)}\n`;
    }
    content += `TOTALE PARTE STABILE: ${formatCurrency(calculatedFund.totaleComponenteStabile)}\n\n`;

    if (calculatedFund.risorseVariabili.length > 0) {
        content += `PARTE VARIABILE\n`;
        calculatedFund.risorseVariabili.forEach(item => {
            content += ` - ${item.descrizione} (${item.riferimento}): ${formatCurrency(item.importo)}\n`;
        });
        content += `TOTALE PARTE VARIABILE: ${formatCurrency(calculatedFund.totaleComponenteVariabile)}\n\n`;
    }
    
    content += `TOTALE FONDO RISORSE DECENTRATE ANNO ${annoRiferimento}: ${formatCurrency(calculatedFund.totaleFondoRisorseDecentrate)}\n\n`;
    content += `D E T E R M I N A\n\n`;
    content += `1. Di costituire il Fondo delle Risorse Decentrate per l'anno ${annoRiferimento}, quantificato in complessivi ${formatCurrency(calculatedFund.totaleFondoRisorseDecentrate)}.\n`;
    content += `2. Di dare atto che il presente provvedimento sarà trasmesso all'Organo di Revisione.\n\n`;
    content += `IL DIRIGENTE\n(${currentUser.name})\n`;


    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Determinazione_Fondo_${annoRiferimento}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const generateFADXLS = (
    fadData: FondoAccessorioDipendenteData,
    annoRiferimento: number,
    simulatoreRisultati: SimulatoreIncrementoRisultati | undefined,
    isEnteInCondizioniSpeciali: boolean,
    incrementoEQconRiduzioneDipendenti: number | undefined
): void => {
    const headers = ["Sezione", "Descrizione", "Riferimento Normativo", "Importo (€)", "Rileva per Limite Art. 23?"];
    
    const rows: (string|number)[][] = [];

    fadFieldDefinitions.forEach(def => {
        const effectiveValue = getFadEffectiveValueHelper(
            def.key,
            fadData[def.key],
            def.isDisabledByCondizioniSpeciali,
            isEnteInCondizioniSpeciali,
            simulatoreRisultati,
            incrementoEQconRiduzioneDipendenti
        );
        
        const row = [
            def.section.replace(/_/g, ' ').toUpperCase(),
            def.description,
            def.riferimento,
            def.isSubtractor ? -effectiveValue : effectiveValue,
            def.isRelevantToArt23Limit ? 'Sì' : 'No'
        ];
        rows.push(row);
    });

    const escapeCsvCell = (cell: any) => {
        if (cell === undefined || cell === null) return '';
        let cellString = String(cell);
        if (cellString.includes('"') || cellString.includes(',') || cellString.includes('\n')) {
            cellString = '"' + cellString.replace(/"/g, '""') + '"';
        }
        return cellString;
    };


    let csvContent = headers.join(",") + "\n" 
        + rows.map(row => row.map(escapeCsvCell).join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Dettaglio_Fondo_Dipendente_${annoRiferimento}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
