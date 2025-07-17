// pages/PersonaleServizioPage.tsx
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { PersonaleServizioDettaglio, LivelloPeo, TipoMaggiorazione, AreaQualifica } from '../types.js';
import { Card } from '../components/shared/Card.js';
import { Input } from '../components/shared/Input.js';
import { Select } from '../components/shared/Select.js';
import { Button } from '../components/shared/Button.js';
import { TEXTS_UI, ALL_AREE_QUALIFICA, PROGRESSION_ECONOMIC_VALUES, INDENNITA_COMPARTO_VALUES, ALL_TIPI_MAGGIORAZIONE } from '../constants.js';

const NESSUNA_PEO_VALUE = ""; // Sentinel value for "Nessuna PEO"

const formatCurrency = (value?: number, defaultText = TEXTS_UI.notApplicable) => {
  if (value === undefined || value === null || isNaN(value)) return defaultText;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getPeoOptionsForArea = (area?: AreaQualifica): { value: string; label: string }[] => {
  const baseOptions = [{ value: NESSUNA_PEO_VALUE, label: "Nessuna PEO" }];
  if (!area) return baseOptions;
  const peoKeys = Object.keys(PROGRESSION_ECONOMIC_VALUES[area] || {});
  return [...baseOptions, ...peoKeys.map(p => ({ value: p, label: p }))];
};

const getDifferenzialiOptionsForArea = (area?: AreaQualifica): { value: number; label: string }[] => {
  let maxDifferenziali = 6;
  if (area === AreaQualifica.OPERATORE || area === AreaQualifica.OPERATORE_ESPERTO || area === AreaQualifica.ISTRUTTORE) {
    maxDifferenziali = 5;
  }
  return Array.from({ length: maxDifferenziali + 1 }, (_, i) => ({ value: i, label: i.toString() }));
};

const getMaggiorazioniOptionsForArea = (area?: AreaQualifica): { value: string; label: string }[] => {
  if (!area || area === AreaQualifica.OPERATORE || area === AreaQualifica.OPERATORE_ESPERTO) {
    return ALL_TIPI_MAGGIORAZIONE.filter(m => m.value === TipoMaggiorazione.NESSUNA);
  }
  if (area === AreaQualifica.ISTRUTTORE) {
    return ALL_TIPI_MAGGIORAZIONE.filter(m => 
      m.value === TipoMaggiorazione.NESSUNA ||
      m.value === TipoMaggiorazione.EDUCATORE ||
      m.value === TipoMaggiorazione.POLIZIA_LOCALE ||
      m.value === TipoMaggiorazione.ISCRITTO_ALBI_ORDINI
    );
  }
  if (area === AreaQualifica.FUNZIONARIO_EQ) {
    return ALL_TIPI_MAGGIORAZIONE.filter(m => 
      m.value === TipoMaggiorazione.NESSUNA ||
      m.value === TipoMaggiorazione.ISCRITTO_ALBI_ORDINI
    );
  }
  return ALL_TIPI_MAGGIORAZIONE;
};

export const PersonaleServizioPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { calculatedFund } = state;
  const { personaleServizioDettagli: employees, personaleAnnoRifPerArt23: art23SourceEmployees, annoRiferimento } = state.fundData.annualData;
  const employeeList = employees || [];

  const handleSyncFromArt23 = () => {
    const sourceList = art23SourceEmployees || [];
    
    if (sourceList.length === 0) {
        alert("Nessun dato del personale trovato nella sezione Art. 23. Inserire i dati lì prima di sincronizzare.");
        return;
    }

    if (employeeList.length > 0 && !window.confirm("Questa operazione sovrascriverà l'elenco corrente con i dati del calcolo Art. 23. Continuare?")) {
        return;
    }
    
    const newTargetList: PersonaleServizioDettaglio[] = sourceList.map(sourceEmp => {
      const isFullYear = (sourceEmp.cedoliniEmessi === undefined || sourceEmp.cedoliniEmessi >= 12);
      return {
          id: crypto.randomUUID(),
          matricola: sourceEmp.matricola,
          partTimePercentage: sourceEmp.partTimePercentage,
          fullYearService: isFullYear,
          assunzioneDate: undefined,
          cessazioneDate: undefined,
          livelloPeoStoriche: undefined,
          numeroDifferenziali: 0,
          tipoMaggiorazione: TipoMaggiorazione.NESSUNA,
          areaQualifica: undefined,
      };
    });

    dispatch({ type: 'SET_PERSONALE_SERVIZIO_DETTAGLI', payload: newTargetList });
    alert("Sincronizzazione completata con successo!");
  };
  
  const handleUpdateEmployee = (index: number, field: keyof PersonaleServizioDettaglio, value: any) => {
    const updatedEmployees = [...employeeList];
    const updatedEmployee = { ...updatedEmployees[index] };

    switch (field) {
      case 'areaQualifica':
          updatedEmployee[field] = (value === '' || value === null || value === undefined) ? undefined : value as AreaQualifica;
          updatedEmployee.livelloPeoStoriche = undefined; 
          updatedEmployee.numeroDifferenziali = 0;
          updatedEmployee.tipoMaggiorazione = TipoMaggiorazione.NESSUNA;
          break;
      case 'partTimePercentage':
          updatedEmployee[field] = (value === '' || value === null || value === undefined) ? undefined : parseFloat(String(value));
          break;
      case 'numeroDifferenziali':
          updatedEmployee[field] = (value === '' || value === null || value === undefined) ? undefined : parseInt(String(value), 10);
          break;
      case 'fullYearService':
          updatedEmployee[field] = Boolean(value);
          if (updatedEmployee[field] === true) {
              updatedEmployee.assunzioneDate = undefined;
              updatedEmployee.cessazioneDate = undefined;
          }
          break;
      case 'livelloPeoStoriche':
          updatedEmployee[field] = (value === NESSUNA_PEO_VALUE || value === '' || value === null || value === undefined) ? undefined : value as LivelloPeo;
          break;
      case 'tipoMaggiorazione':
          updatedEmployee[field] = (value === '' || value === null || value === undefined) ? undefined : value as TipoMaggiorazione;
          break;
      case 'matricola':
      case 'assunzioneDate':
      case 'cessazioneDate':
          updatedEmployee[field] = (value === '' || value === null || value === undefined) ? undefined : String(value);
          break;
      default:
          // 'id' non è modificabile
          break;
    }

    updatedEmployees[index] = updatedEmployee;
    dispatch({ type: 'SET_PERSONALE_SERVIZIO_DETTAGLI', payload: updatedEmployees });
  };
  
  const handleAddEmployee = () => {
    const newEmployee: PersonaleServizioDettaglio = {
      id: crypto.randomUUID(),
      fullYearService: true, 
      partTimePercentage: 100,
      numeroDifferenziali: 0, 
      tipoMaggiorazione: TipoMaggiorazione.NESSUNA, 
      livelloPeoStoriche: undefined, 
    };
    dispatch({ type: 'SET_PERSONALE_SERVIZIO_DETTAGLI', payload: [...employeeList, newEmployee] });
  };

  const handleRemoveEmployee = (idToRemove: string) => {
    if (window.confirm("Sei sicuro di voler rimuovere questo dipendente?")) {
      const updatedEmployees = employeeList.filter(employee => employee.id !== idToRemove);
      dispatch({ type: 'SET_PERSONALE_SERVIZIO_DETTAGLI', payload: updatedEmployees });
    }
  };

  const calculateServiceRatio = (employee: PersonaleServizioDettaglio): number => {
    if (employee.fullYearService) return 1;

    if (!employee.assunzioneDate && !employee.cessazioneDate) return 0;

    const yearStartDate = new Date(annoRiferimento, 0, 1);
    const yearEndDate = new Date(annoRiferimento, 11, 31, 23, 59, 59, 999);

    const startDate = employee.assunzioneDate ? new Date(employee.assunzioneDate) : yearStartDate;
    const endDate = employee.cessazioneDate ? new Date(employee.cessazioneDate) : yearEndDate;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) return 0;

    const effectiveStart = startDate > yearStartDate ? startDate : yearStartDate;
    const effectiveEnd = endDate < yearEndDate ? endDate : yearEndDate;

    if (effectiveEnd < effectiveStart) return 0;

    const diffTime = effectiveEnd.getTime() - effectiveStart.getTime();
    const serviceDaysInYear = (diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const isLeap = new Date(annoRiferimento, 1, 29).getDate() === 29;
    const daysInYear = isLeap ? 366 : 365;
    
    return Math.max(0, Math.min(1, serviceDaysInYear / daysInYear));
  };
  
  const totalAbsorbedProgression = useMemo(() => {
    return (employeeList || []).reduce((sum, employee) => {
      if (employee.areaQualifica && employee.livelloPeoStoriche) {
        const areaValues = PROGRESSION_ECONOMIC_VALUES[employee.areaQualifica];
        const progressionValue = areaValues?.[employee.livelloPeoStoriche];
        if (typeof progressionValue === 'number') {
          const ptPercentage = (employee.partTimePercentage ?? 100) / 100;
          const serviceRatio = calculateServiceRatio(employee);
          return sum + (progressionValue * ptPercentage * serviceRatio);
        }
      }
      return sum;
    }, 0);
  }, [employeeList, annoRiferimento]);

  const totalAbsorbedIndennitaComparto = useMemo(() => {
    return (employeeList || []).reduce((sum, employee) => {
      if (employee.areaQualifica) {
        const indennitaValue = INDENNITA_COMPARTO_VALUES[employee.areaQualifica];
        if (typeof indennitaValue === 'number') {
          const ptPercentage = (employee.partTimePercentage ?? 100) / 100;
          const serviceRatio = calculateServiceRatio(employee);
          return sum + (indennitaValue * ptPercentage * serviceRatio);
        }
      }
      return sum;
    }, 0);
  }, [employeeList, annoRiferimento]);

  const totalAbsorbed = totalAbsorbedProgression + totalAbsorbedIndennitaComparto;
  
  if (!calculatedFund) {
    return (
      <div className="space-y-8">
         <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">
           Personale in servizio nel {annoRiferimento}
         </h2>
        <Card title="Dati Personale Bloccati">
          <p className="text-lg text-[#5f5252] mb-4">
            Per inserire o modificare i dati del personale in servizio per l'anno {annoRiferimento}, è necessario prima eseguire il calcolo generale del fondo.
          </p>
          <p className="text-sm text-[#5f5252] mb-4">
            Vai alla pagina <strong className="text-[#1b0e0e]">"Benvenuto"</strong> o <strong className="text-[#1b0e0e]">"Dati Costituzione Fondo"</strong> e clicca sul pulsante <strong className="text-[#ea2832]">"Aggiorna Calcoli e Conformità"</strong> o <strong className="text-[#ea2832]">"Salva Dati e Calcola Fondo"</strong>.
          </p>
          <Button 
            variant="primary" 
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dataEntry' })}
          >
            Vai a Dati Costituzione Fondo
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24"> {/* Added padding-bottom to avoid overlap with sticky bar */}
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">
        Personale in servizio nel {annoRiferimento}
      </h2>

      <Card title={`Elenco Personale Dipendente Anno ${annoRiferimento}`}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 p-3 bg-[#f3e7e8] rounded-lg">
            <p className="text-sm text-[#5f5252] flex-1 min-w-[200px]">
                Gestisci l'elenco dei dipendenti per l'anno di riferimento. Puoi partire sincronizzando i dati dal calcolo Art. 23.
            </p>
            <Button variant="secondary" onClick={handleSyncFromArt23}>
              Sincronizza con dati Art. 23
            </Button>
        </div>

        {employeeList.map((employee, index) => {
          const peoOptions = getPeoOptionsForArea(employee.areaQualifica);
          const differenzialiOptions = getDifferenzialiOptionsForArea(employee.areaQualifica);
          const maggiorazioniOptions = getMaggiorazioniOptionsForArea(employee.areaQualifica);
          const isMaggiorazioneDisabled = employee.areaQualifica === AreaQualifica.OPERATORE || employee.areaQualifica === AreaQualifica.OPERATORE_ESPERTO;

          return (
            <Card 
              key={employee.id} 
              title={`Dipendente ${index + 1} ${employee.matricola ? `- Matricola: ${employee.matricola}` : ''}`} 
              className="mb-6 bg-white" 
              isCollapsible 
              defaultCollapsed={employeeList.length > 1} // Collapse if more than 1 employee
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0">
                <Input
                  label="Matricola (Opzionale)"
                  id={`matricola_${employee.id}`}
                  value={employee.matricola ?? ''}
                  onChange={(e) => handleUpdateEmployee(index, 'matricola', e.target.value)}
                  containerClassName="mb-3"
                />
                <Select
                  label="Area/Qualifica"
                  id={`area_qualifica_${employee.id}`}
                  options={ALL_AREE_QUALIFICA}
                  value={employee.areaQualifica ?? ''}
                  onChange={(e) => handleUpdateEmployee(index, 'areaQualifica', e.target.value as AreaQualifica)}
                  placeholder="Seleziona area..."
                  containerClassName="mb-3"
                />
                <Input
                  label="% Part-Time"
                  type="number"
                  id={`pt_${employee.id}`}
                  value={employee.partTimePercentage ?? ''}
                  onChange={(e) => handleUpdateEmployee(index, 'partTimePercentage', e.target.value)}
                  min="1" max="100" step="0.01" placeholder="100"
                  containerClassName="mb-3"
                />
                <div className="flex items-center col-span-full md:col-span-1 mb-3 mt-2 md:mt-8"> 
                  <input
                    type="checkbox"
                    id={`fullYear_${employee.id}`}
                    checked={employee.fullYearService}
                    onChange={(e) => handleUpdateEmployee(index, 'fullYearService', e.target.checked)}
                    className="h-5 w-5 text-[#ea2832] border-[#d1c0c1] rounded focus:ring-[#ea2832]/50"
                  />
                  <label htmlFor={`fullYear_${employee.id}`} className="ml-2 text-sm text-[#1b0e0e]">
                    In servizio tutto l'anno?
                  </label>
                </div>

                {!employee.fullYearService && (
                  <>
                    <Input
                      label="Data Assunzione"
                      type="date"
                      id={`assunzione_${employee.id}`}
                      value={employee.assunzioneDate ?? ''}
                      onChange={(e) => handleUpdateEmployee(index, 'assunzioneDate', e.target.value)}
                      containerClassName="mb-3"
                    />
                    <Input
                      label="Data Cessazione"
                      type="date"
                      id={`cessazione_${employee.id}`}
                      value={employee.cessazioneDate ?? ''}
                      onChange={(e) => handleUpdateEmployee(index, 'cessazioneDate', e.target.value)}
                      containerClassName="mb-3"
                    />
                  </>
                )}
              
                <Select
                  label="Livello PEO Storiche"
                  id={`livelloPeo_${employee.id}`}
                  options={peoOptions}
                  value={employee.livelloPeoStoriche ?? NESSUNA_PEO_VALUE}
                  onChange={(e) => handleUpdateEmployee(index, 'livelloPeoStoriche', e.target.value)}
                  placeholder="Seleziona livello..."
                  containerClassName="mb-3 col-span-full sm:col-span-1"
                  disabled={!employee.areaQualifica}
                />
                <Select
                  label="Numero Differenziali"
                  id={`numDiff_${employee.id}`}
                  options={differenzialiOptions}
                  value={employee.numeroDifferenziali ?? '0'}
                  onChange={(e) => handleUpdateEmployee(index, 'numeroDifferenziali', e.target.value)}
                  placeholder="Seleziona n° diff..."
                  containerClassName="mb-3 col-span-full sm:col-span-1"
                  disabled={!employee.areaQualifica}
                />
                <Select
                  label="Tipo Maggiorazione Specifiche"
                  id={`maggiorazione_${employee.id}`}
                  options={maggiorazioniOptions}
                  value={employee.tipoMaggiorazione ?? TipoMaggiorazione.NESSUNA}
                  onChange={(e) => handleUpdateEmployee(index, 'tipoMaggiorazione', e.target.value as TipoMaggiorazione)}
                  placeholder="Seleziona maggiorazione..."
                  containerClassName="mb-3 col-span-full sm:col-span-1"
                  disabled={!employee.areaQualifica || isMaggiorazioneDisabled}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="danger" size="sm" onClick={() => handleRemoveEmployee(employee.id)}>
                  {TEXTS_UI.remove} Dipendente
                </Button>
              </div>
            </Card>
          );
        })}

        <div className="mt-6">
          <Button variant="primary" onClick={handleAddEmployee}>
            {TEXTS_UI.add} Dipendente
          </Button>
        </div>
      </Card>

      <Card title="Riepilogo Risorse Assorbite" className="mt-8">
        <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#5f5252]">Progressioni Economiche Assorbite</span>
              <span className="font-semibold text-[#1b0e0e]">{formatCurrency(totalAbsorbedProgression)}</span>
            </div>
             <div className="flex justify-between items-center">
              <span className="text-sm text-[#5f5252]">Indennità di Comparto Assorbita</span>
              <span className="font-semibold text-[#1b0e0e]">{formatCurrency(totalAbsorbedIndennitaComparto)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-[#f3e7e8]">
              <span className="font-bold text-[#1b0e0e]">TOTALE RISORSE ASSORBITE</span>
              <span className="text-xl font-bold text-[#ea2832]">{formatCurrency(totalAbsorbed)}</span>
            </div>
        </div>
      </Card>
      
    </div>
  );
};
