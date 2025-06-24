// components/dashboard/ComplianceStatusWidget.tsx
import React from 'react';
import { ComplianceCheck } from '../../types.js';
import { Card } from '../shared/Card.js';
import { TEXTS_UI } from '../../constants.js';
import { useAppContext } from '../../contexts/AppContext.js';
import { Button } from '../shared/Button.js'; // Import Button for "Vedi dettagli"

interface ComplianceStatusWidgetProps {
  complianceChecks: ComplianceCheck[];
}

const getIconForGravita = (gravita: 'info' | 'warning' | 'error'): string => {
  if (gravita === 'error') return '❌';
  if (gravita === 'warning') return '⚠️';
  return 'ℹ️'; 
};

// Updated styles to match new theme
const getStylesForGravita = (gravita: 'info' | 'warning' | 'error'): { card: string; title: string; iconText: string } => {
  if (gravita === 'error') return { 
    card: 'bg-[#fef2f2] border-[#fecaca]', // Lighter red, Tailwind red-50, border red-200
    title: 'text-[#991b1b]', // Tailwind red-800
    iconText: 'text-[#ef4444]' // Tailwind red-500
  };
  if (gravita === 'warning') return { 
    card: 'bg-[#fffbeb] border-[#fde68a]', // Lighter yellow, Tailwind amber-50, border amber-200
    title: 'text-[#92400e]', // Tailwind amber-800
    iconText: 'text-[#f59e0b]' // Tailwind amber-500
  };
  return { // info
    card: 'bg-[#eff6ff] border-[#bfdbfe]', // Lighter blue, Tailwind blue-50, border blue-200
    title: 'text-[#1e40af]', // Tailwind blue-800
    iconText: 'text-[#3b82f6]' // Tailwind blue-500
  };
};


export const ComplianceStatusWidget: React.FC<ComplianceStatusWidgetProps> = ({ complianceChecks }) => {
  const { dispatch } = useAppContext(); 
  
  if (!complianceChecks || complianceChecks.length === 0) {
    return (
      <Card title="Stato di Conformità Normativa">
        <p className="text-[#1b0e0e]">{TEXTS_UI.noDataAvailable} Nessun controllo di conformità eseguito o dati non disponibili.</p>
      </Card>
    );
  }

  const criticalIssues = complianceChecks.filter(c => c.gravita === 'error').length;
  const warnings = complianceChecks.filter(c => c.gravita === 'warning').length;

  return (
    <Card title="Stato di Conformità Normativa" className="mb-8">
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {criticalIssues > 0 && <p className={`font-semibold ${getStylesForGravita('error').title}`}>{criticalIssues} Criticità Rilevate</p>}
        {warnings > 0 && <p className={`font-semibold ${getStylesForGravita('warning').title}`}>{warnings} Avvisi da Verificare</p>}
        {criticalIssues === 0 && warnings === 0 && <p className="font-semibold text-green-700">Nessuna criticità o avviso rilevante.</p>}
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar space */}
        {complianceChecks.map(check => {
          const styles = getStylesForGravita(check.gravita);
          return (
            <div key={check.id} className={`p-3 border rounded-lg ${styles.card}`}>
              <div className="flex items-start">
                <span className={`text-xl mr-3 ${styles.iconText}`}>{getIconForGravita(check.gravita)}</span>
                <div>
                  <h5 className={`font-semibold ${styles.title}`}>{check.descrizione}</h5>
                  <p className="text-sm text-[#1b0e0e]">{check.messaggio}</p>
                  <p className="text-xs text-[#5f5252] mt-1">
                    Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
       <div className="mt-6 text-center">
          <Button 
            variant="link" 
            onClick={() => dispatch({type: 'SET_ACTIVE_TAB', payload: 'compliance'})} 
          >
            Vedi dettagli conformità
          </Button>
      </div>
    </Card>
  );
};