// pages/CompliancePage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Card } from '../components/shared/Card.js';
import { TEXTS_UI } from '../constants.js';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.js';

const getIconForGravita = (gravita: 'info' | 'warning' | 'error'): string => {
  if (gravita === 'error') return '❌';
  if (gravita === 'warning') return '⚠️';
  return 'ℹ️';
};

// Adjusted colors to fit the new theme
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

export const CompliancePage: React.FC = () => {
  const { state } = useAppContext();
  const { complianceChecks, isLoading } = state;

  if (isLoading && (!complianceChecks || complianceChecks.length === 0)) {
    return <LoadingSpinner text="Caricamento controlli di conformità..." />;
  }

  if (!complianceChecks || complianceChecks.length === 0) {
    return (
      <Card title="Controllo dei limiti">
        <p className="text-[#1b0e0e]">{TEXTS_UI.noDataAvailable} Nessun controllo di conformità eseguito o dati non disponibili. Effettuare il calcolo del fondo.</p>
      </Card>
    );
  }

  const incrementoConsistenzaCheck = complianceChecks.find(c => c.id === 'verifica_incremento_consistenza');
  const criticalIssues = complianceChecks.filter(c => c.gravita === 'error');
  const warnings = complianceChecks.filter(c => c.gravita === 'warning' && c.id !== 'verifica_incremento_consistenza');
  const infos = complianceChecks.filter(c => c.gravita === 'info' && c.id !== 'verifica_incremento_consistenza');


  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Controllo dei limiti</h2>
      
      {incrementoConsistenzaCheck && (
        <Card title="Verifica del fondo del salario accessorio" className="mb-6">
          <div className={`p-4 mb-3 border rounded-lg ${getStylesForGravita(incrementoConsistenzaCheck.gravita).card}`}>
            <div className="flex items-start">
              <span className={`text-2xl mr-3 ${getStylesForGravita(incrementoConsistenzaCheck.gravita).iconText}`}>
                {getIconForGravita(incrementoConsistenzaCheck.gravita)}
              </span>
              <div>
                <h5 className={`font-semibold ${getStylesForGravita(incrementoConsistenzaCheck.gravita).title}`}>
                  {incrementoConsistenzaCheck.descrizione}
                </h5>
                <p className="text-sm text-[#1b0e0e]">{incrementoConsistenzaCheck.messaggio}</p>
                <p className="text-xs text-[#5f5252] mt-1">
                  Valore: {incrementoConsistenzaCheck.valoreAttuale ?? TEXTS_UI.notApplicable} {incrementoConsistenzaCheck.limite ? `(Limite: ${incrementoConsistenzaCheck.limite})` : ''} - Rif: {incrementoConsistenzaCheck.riferimentoNormativo}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {(criticalIssues.length > 0 || warnings.length > 0) && (
        <Card title="Criticità e Avvisi Importanti" className="border-l-4 border-[#ea2832]">
            {criticalIssues.length > 0 && (
                <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-3 ${getStylesForGravita('error').title}`}>Criticità Rilevate</h3>
                {criticalIssues.map(check => (
                    <div key={check.id} className={`p-4 mb-3 border rounded-lg ${getStylesForGravita(check.gravita).card}`}>
                        <div className="flex items-start">
                        <span className={`text-2xl mr-3 ${getStylesForGravita(check.gravita).iconText}`}>{getIconForGravita(check.gravita)}</span>
                        <div>
                            <h5 className={`font-semibold ${getStylesForGravita(check.gravita).title}`}>{check.descrizione}</h5>
                            <p className="text-sm text-[#1b0e0e]">{check.messaggio}</p>
                            <p className="text-xs text-[#5f5252] mt-1">Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}</p>
                        </div>
                        </div>
                    </div>
                ))}
                </div>
            )}
            {warnings.length > 0 && (
                 <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-3 ${getStylesForGravita('warning').title}`}>Avvisi da Verificare</h3>
                {warnings.map(check => (
                    <div key={check.id} className={`p-4 mb-3 border rounded-lg ${getStylesForGravita(check.gravita).card}`}>
                        <div className="flex items-start">
                        <span className={`text-2xl mr-3 ${getStylesForGravita(check.gravita).iconText}`}>{getIconForGravita(check.gravita)}</span>
                        <div>
                            <h5 className={`font-semibold ${getStylesForGravita(check.gravita).title}`}>{check.descrizione}</h5>
                            <p className="text-sm text-[#1b0e0e]">{check.messaggio}</p>
                            <p className="text-xs text-[#5f5252] mt-1">Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}</p>
                        </div>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </Card>
      )}


      <Card title="Tutti i Controlli Eseguiti">
        {infos.length > 0 && (
             <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-3 ${getStylesForGravita('info').title}`}>Informazioni e Controlli Positivi</h3>
                {infos.map(check => (
                     <div key={check.id} className={`p-4 mb-3 border rounded-lg ${getStylesForGravita(check.gravita).card}`}>
                        <div className="flex items-start">
                        <span className={`text-2xl mr-3 ${getStylesForGravita(check.gravita).iconText}`}>{getIconForGravita(check.gravita)}</span>
                        <div>
                            <h5 className={`font-semibold ${getStylesForGravita(check.gravita).title}`}>{check.descrizione}</h5>
                            <p className="text-sm text-[#1b0e0e]">{check.messaggio}</p>
                            <p className="text-xs text-[#5f5252] mt-1">Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}</p>
                        </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
        {(criticalIssues.length === 0 && warnings.length === 0 && infos.length === 0 && complianceChecks.length > 0) && (
            <p className="text-[#1b0e0e]">Tutti i controlli eseguiti non hanno rilevato criticità o avvisi particolari.</p>
        )}
         {complianceChecks.length === 0 && (
            <p className="text-[#1b0e0e]">Nessun controllo disponibile.</p>
        )}
      </Card>
      
      <Card title="Guida al Piano di Recupero (Indicazioni Generali)" className="mt-6">
        <p className="text-sm text-[#1b0e0e]">In caso di superamento dei limiti di spesa (es. Art. 23, c.2, D.Lgs. 75/2017), l'ente è tenuto ad adottare un piano di recupero formale ai sensi dell'Art. 40, comma 3-quinquies, D.Lgs. 165/2001.</p>
        <ul className="list-disc list-inside text-sm text-[#1b0e0e] mt-2 space-y-1">
            <li>Il recupero avviene sulle risorse destinate al trattamento accessorio.</li>
            <li>Può essere effettuato con quote annuali (massimo 25% dell'eccedenza) o con proroga fino a cinque anni in casi specifici.</li>
            <li>È necessaria una formale deliberazione dell'ente.</li>
            <li>La mancata adozione del piano di recupero può configurare danno erariale.</li>
        </ul>
        <p className="text-xs text-[#5f5252] mt-3">Questa è una guida generica. Consultare la normativa e il proprio Organo di Revisione per l'applicazione specifica.</p>
      </Card>
    </div>
  );
};
