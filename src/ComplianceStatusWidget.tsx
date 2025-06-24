// src/ComplianceStatusWidget.tsx
import React from 'react';
import { ComplianceCheck } from '../types.js';
import { Card } from './Card.js';
import { TEXTS_UI } from '../constants.js';
import { useAppContext } from './AppContext.js'; 

interface ComplianceStatusWidgetProps {
  complianceChecks: ComplianceCheck[];
}

const getIconForGravita = (gravita: 'info' | 'warning' | 'error'): string => {
  if (gravita === 'error') return '❌';
  if (gravita === 'warning') return '⚠️';
  return 'ℹ️'; // info
};

const getTextColorForGravita = (gravita: 'info' | 'warning' | 'error'): string => {
  if (gravita === 'error') return 'text-red-700';
  if (gravita === 'warning') return 'text-yellow-700';
  return 'text-blue-700'; // info
};

const getBgColorForGravita = (gravita: 'info' | 'warning' | 'error'): string => {
  if (gravita === 'error') return 'bg-red-50 border-red-200';
  if (gravita === 'warning') return 'bg-yellow-50 border-yellow-200';
  return 'bg-blue-50 border-blue-200'; // info
};


export const ComplianceStatusWidget: React.FC<ComplianceStatusWidgetProps> = ({ complianceChecks }) => {
  const { dispatch } = useAppContext(); // Get dispatch from context
  
  if (!complianceChecks || complianceChecks.length === 0) {
    return (
      <Card title="Stato di Conformità Normativa">
        <p className="text-gray-600">{TEXTS_UI.noDataAvailable} Nessun controllo di conformità eseguito o dati non disponibili.</p>
      </Card>
    );
  }

  const criticalIssues = complianceChecks.filter(c => c.gravita === 'error').length;
  const warnings = complianceChecks.filter(c => c.gravita === 'warning').length;

  return (
    <Card title="Stato di Conformità Normativa" className="mb-6">
      <div className="mb-4 flex space-x-4">
        {criticalIssues > 0 && <p className="text-red-600 font-semibold">{criticalIssues} Criticità Rilevate</p>}
        {warnings > 0 && <p className="text-yellow-600 font-semibold">{warnings} Avvisi da Verificare</p>}
        {criticalIssues === 0 && warnings === 0 && <p className="text-green-600 font-semibold">Nessuna criticità o avviso rilevante.</p>}
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {complianceChecks.map(check => (
          <div key={check.id} className={`p-3 border rounded-md ${getBgColorForGravita(check.gravita)}`}>
            <div className="flex items-start">
              <span className="text-xl mr-3">{getIconForGravita(check.gravita)}</span>
              <div>
                <h5 className={`font-semibold ${getTextColorForGravita(check.gravita)}`}>{check.descrizione}</h5>
                <p className="text-sm text-gray-600">{check.messaggio}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
       <div className="mt-4 text-center">
          <button 
            onClick={() => dispatch({type: 'SET_ACTIVE_TAB', payload: 'compliance'})} 
            className="text-blue-600 hover:underline"
          >
            Vedi dettagli conformità
          </button>
      </div>
    </Card>
  );
};