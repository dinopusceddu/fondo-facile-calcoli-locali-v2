// src/reportService.ts
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // This import augments the jsPDF prototype and its TypeScript definition
import { CalculatedFund, FundData, User } from '../types.js';

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return 'N/D';
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const generateDeterminazionePDF = (
  calculatedFund: CalculatedFund,
  fundData: FundData,
  currentUser: User
): void => {
  const doc = new jsPDF(); // doc will be of type jsPDF, augmented by jspdf-autotable
  const { annualData } = fundData;
  const annoRiferimento = annualData.annoRiferimento;

  doc.setFontSize(18);
  doc.text(`Comune di [NOME ENTE]`, 14, 20); // Placeholder
  doc.setFontSize(12);
  doc.text(`Area Gestione Risorse Umane`, 14, 28); // Placeholder
  
  doc.setFontSize(16);
  doc.text(`Determinazione Dirigenziale n. ____ del __/__/${annoRiferimento}`, 14, 40); // Placeholder

  doc.setFontSize(14);
  doc.text(`Oggetto: Costituzione del Fondo delle Risorse Decentrate per l'anno ${annoRiferimento}`, 14, 50);

  let yPos = 65;
  const lineSpacing = 7;
  const leftMargin = 14;
  const contentWidth = doc.internal.pageSize.width - leftMargin * 2;

  doc.setFontSize(10);

  const addWrappedText = (text: string, indent = 0) => {
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    lines.forEach((line: string) => {
      if (yPos > 270) { // Check for page break
          doc.addPage();
          yPos = 20;
      }
      doc.text(line, leftMargin + indent, yPos);
      yPos += lineSpacing * 0.7; // Smaller spacing for wrapped lines
    });
    yPos += lineSpacing * 0.3; // Restore some spacing after block
  };
  
  addWrappedText(`IL DIRIGENTE RESPONSABILE`); // Placeholder
  yPos += lineSpacing;

  addWrappedText(`VISTI:`);
  addWrappedText(`- Il D.Lgs. 30 marzo 2001, n. 165 e ss.mm.ii.;`);
  addWrappedText(`- Il CCNL Funzioni Locali vigente (attualmente 2019-2021, sottoscritto il 16/11/2022);`);
  addWrappedText(`- L'Art. 23, comma 2, del D.Lgs. 25 maggio 2017, n. 75;`);
  addWrappedText(`- L'Art. 33, comma 2, del D.L. 30 aprile 2019, n. 34, convertito con L. 58/2019;`);
  addWrappedText(`- L'Art. 14, comma 1-bis, del D.L. 21 marzo 2022, n. 25 (c.d. Decreto Energia, per incremento 48% dal 2025);`);
  // ... altri riferimenti normativi rilevanti ...
  yPos += lineSpacing;

  addWrappedText(`CONSIDERATO che occorre procedere alla costituzione del Fondo delle Risorse Decentrate per l'anno ${annoRiferimento};`);
  yPos += lineSpacing;

  addWrappedText(`DATO ATTO che le risorse destinate al finanziamento del Fondo sono state quantificate come segue:`);
  yPos += lineSpacing;

  const tableData: any[][] = []; // Changed to any[][] to accommodate complex cell objects
  tableData.push(["Voce di Finanziamento", "Riferimento Normativo", "Importo"]);
  
  // Parte Stabile
  tableData.push([{content: "PARTE STABILE", colSpan: 3, styles: { fontStyle: 'bold', fillColor: [230, 230, 230]}}]);
  tableData.push(["Fondo risorse decentrate anno precedente (consolidato storico 2016)", calculatedFund.fondoBase2016 > 0 ? "Art. 23, c.2, D.Lgs. 75/2017" : "N/A", formatCurrency(calculatedFund.fondoBase2016)]);
  
  calculatedFund.incrementiStabiliCCNL.forEach(item => {
    tableData.push([item.descrizione, item.riferimento, formatCurrency(item.importo)]);
  });
  
  tableData.push([calculatedFund.adeguamentoProCapite.descrizione, calculatedFund.adeguamentoProCapite.riferimento, formatCurrency(calculatedFund.adeguamentoProCapite.importo)]);
  
  if (calculatedFund.incrementoOpzionaleVirtuosi) {
    tableData.push([calculatedFund.incrementoOpzionaleVirtuosi.descrizione, calculatedFund.incrementoOpzionaleVirtuosi.riferimento, formatCurrency(calculatedFund.incrementoOpzionaleVirtuosi.importo)]);
  }
  tableData.push([{content: "Totale Parte Stabile", styles: { fontStyle: 'bold'}}, "", formatCurrency(calculatedFund.totaleComponenteStabile)]);

  // Parte Variabile
  if (calculatedFund.risorseVariabili.length > 0) {
    tableData.push([{content: "PARTE VARIABILE", colSpan: 3, styles: { fontStyle: 'bold', fillColor: [230, 230, 230]}}]);
    calculatedFund.risorseVariabili.forEach(item => {
      tableData.push([item.descrizione, item.riferimento, formatCurrency(item.importo)]);
    });
    tableData.push([{content: "Totale Parte Variabile", styles: { fontStyle: 'bold'}}, "", formatCurrency(calculatedFund.totaleComponenteVariabile)]);
  }

  // Totale Generale
  tableData.push([{content: "TOTALE FONDO RISORSE DECENTRATE ANNO " + annoRiferimento, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [200, 200, 200]}}, formatCurrency(calculatedFund.totaleFondoRisorseDecentrate)]);

  (doc as any).autoTable({
    startY: yPos,
    head: [["Voce di Finanziamento", "Riferimento Normativo", "Importo (€)"]], 
    body: tableData.slice(1), 
    theme: 'grid',
    headStyles: { fillColor: [22, 160, 133], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35, halign: 'right' }
    },
    didParseCell: function (data: any) { // data type explicitly set to any for simplicity
        // For merged cells (like PARTE STABILE title)
        if (data.cell.raw && typeof data.cell.raw === 'object' && (data.cell.raw as any).colSpan) {
            data.cell.styles.halign = 'center';
        }
    }
  });
  if ((doc as any).lastAutoTable) { // Check if lastAutoTable is defined
    yPos = (doc as any).lastAutoTable.finalY + lineSpacing * 2;
  } else {
    yPos += lineSpacing * 10; // Fallback if lastAutoTable is not available
  }


  if (yPos > 250) { doc.addPage(); yPos = 20; }
  addWrappedText(`D E T E R M I N A`);
  yPos += lineSpacing;
  addWrappedText(`1. Di costituire il Fondo delle Risorse Decentrate per il personale non dirigente per l'anno ${annoRiferimento}, quantificato in complessivi ${formatCurrency(calculatedFund.totaleFondoRisorseDecentrate)}, come dettagliato nella tabella sopra riportata.`);
  addWrappedText(`2. Di dare atto che il presente provvedimento sarà trasmesso all'Organo di Revisione per la prescritta certificazione.`);
  addWrappedText(`3. Di dare atto che le risorse stanziate trovano copertura nel Bilancio di Previsione ${annoRiferimento} - ${annoRiferimento+2}.`); // Placeholder
  // ... altre clausole ...
  yPos += lineSpacing * 2;

  if (yPos > 260) { doc.addPage(); yPos = 20; }
  doc.text(`Luogo, ${new Date().toLocaleDateString('it-IT')}`, leftMargin, yPos);
  yPos += lineSpacing * 2;
  doc.text(`Il Dirigente Responsabile`, doc.internal.pageSize.width - leftMargin - 60, yPos);
  yPos += lineSpacing;
  doc.text(`( ${currentUser.name} )`, doc.internal.pageSize.width - leftMargin - 60, yPos); // Placeholder
  

  doc.save(`Determinazione_Fondo_${annoRiferimento}.pdf`);
};