// src/CompliancePage.tsx
import React from 'react';
import { useAppContext } from './AppContext.js';
import { Card } from './Card.js';
import { TEXTS_UI } from '../constants.js';
import { LoadingSpinner } from './LoadingSpinner.js';

const getIconForGravita = (gravita: 'info' | 'warning' | 'error'): string => {
  if (gravita === 'error') return '❌';
  if (gravita === 'warning') return '⚠️';
  return 'ℹ️';
};

const getBorderColorForGravita = (gravita: 'info' | 'warning' | 'error'): string => {
  if (gravita === 'error') return 'border-red-500';
  if (gravita === 'warning') return 'border-yellow-500';
  return 'border-blue-500';
};

export const CompliancePage: React.FC = () => {
  const { state } = useAppContext();
  const { complianceChecks, isLoading } = state;

  if (isLoading) {
    return <LoadingSpinner text="Caricamento controlli di conformità..." />;
  }

  if (!complianceChecks || complianceChecks.length === 0) {
    return (
      <Card title="Controlli di Conformità Normativa">
        <p className="text-gray-600">{TEXTS_UI.noDataAvailable} Nessun controllo di conformità eseguito o dati non disponibili. Effettuare il calcolo del fondo.</p>
      </Card>
    );
  }

  const criticalIssues = complianceChecks.filter(c => c.gravita === 'error');
  const warnings = complianceChecks.filter(c => c.gravita === 'warning');
  const infos = complianceChecks.filter(c => c.gravita === 'info');


  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Controlli di Conformità Normativa</h2>
      
      {(criticalIssues.length > 0 || warnings.length > 0) && (
        <Card title="Criticità e Avvisi Importanti" className="mb-6 border-l-4 border-red-500">
            {criticalIssues.length > 0 && (
                <>
                <h3 className="text-lg font-semibold text-red-700 mb-2">Criticità (Potenziale Danno Erariale / Non Conformità Grave)</h3>
                {criticalIssues.map(check => (
                    <div key={check.id} className={`p-3 mb-3 border rounded-md bg-red-50 ${getBorderColorForGravita(check.gravita)}`}>
                        <div className="flex items-start">
                        <span className="text-xl mr-3">{getIconForGravita(check.gravita)}</span>
                        <div>
                            <h5 className="font-semibold text-red-700">{check.descrizione}</h5>
                            <p className="text-sm text-gray-700">{check.messaggio}</p>
                            <p className="text-xs text-gray-500 mt-1">Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}</p>
                        </div>
                        </div>
                    </div>
                ))}
                </>
            )}
            {warnings.length > 0 && (
                 <>
                <h3 className="text-lg font-semibold text-yellow-700 mb-2 mt-4">Avvisi (Verifiche Ulteriori Richieste / Non Conformità Lievi)</h3>
                {warnings.map(check => (
                    <div key={check.id} className={`p-3 mb-3 border rounded-md bg-yellow-50 ${getBorderColorForGravita(check.gravita)}`}>
                        <div className="flex items-start">
                        <span className="text-xl mr-3">{getIconForGravita(check.gravita)}</span>
                        <div>
                            <h5 className="font-semibold text-yellow-700">{check.descrizione}</h5>
                            <p className="text-sm text-gray-700">{check.messaggio}</p>
                            <p className="text-xs text-gray-500 mt-1">Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}</p>
                        </div>
                        </div>
                    </div>
                ))}
                </>
            )}
        </Card>
      )}


      <Card title="Tutti i Controlli Eseguiti">
        {infos.length > 0 && (
             <>
                <h3 className="text-lg font-semibold text-blue-700 mb-2 mt-4">Informazioni e Controlli Positivi</h3>
                {infos.map(check => (
                     <div key={check.id} className={`p-3 mb-3 border rounded-md bg-blue-50 ${getBorderColorForGravita(check.gravita)}`}>
                        <div className="flex items-start">
                        <span className="text-xl mr-3">{getIconForGravita(check.gravita)}</span>
                        <div>
                            <h5 className="font-semibold text-blue-700">{check.descrizione}</h5>
                            <p className="text-sm text-gray-700">{check.messaggio}</p>
                            <p className="text-xs text-gray-500 mt-1">Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}</p>
                        </div>
                        </div>
                    </div>
                ))}
            </>
        )}
        {(criticalIssues.length === 0 && warnings.length === 0 && infos.length === 0) && ( // Show this only if all categories are empty in this card
            <p className="text-gray-600">Nessun controllo di questo tipo da mostrare. Controllare le sezioni Criticità/Avvisi se presenti.</p>
        )}
      </Card>
      
      <Card title="Guida al Piano di Recupero (Indicazioni Generali)" className="mt-6">
        <p className="text-sm text-gray-700">In caso di superamento dei limiti di spesa (es. Art. 23, c.2, D.Lgs. 75/2017), l'ente è tenuto ad adottare un piano di recupero formale ai sensi dell'Art. 40, comma 3-quinquies, D.Lgs. 165/2001.</p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
            <li>Il recupero avviene sulle risorse destinate al trattamento accessorio.</li>
            <li>Può essere effettuato con quote annuali (massimo 25% dell'eccedenza) o con proroga fino a cinque anni in casi specifici.</li>
            <li>È necessaria una formale deliberazione dell'ente.</li>
            <li>La mancata adozione del piano di recupero può configurare danno erariale.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">Questa è una guida generica. Consultare la normativa e il proprio Organo di Revisione per l'applicazione specifica.</p>
      </Card>
    </div>
  );
};