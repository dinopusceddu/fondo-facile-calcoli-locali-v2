// pages/PersonaleServizioPage.tsx
import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { PersonaleServizioDettaglio, LivelloPeo, TipoMaggiorazione, AreaQualifica } from '../types.js';
import { Card } from '../components/shared/Card.js';
import { Input } from '../components/shared/Input.js';
import { Select } from '../components/shared/Select.js';
import { Button } from '../components/shared/Button.js';
import { TEXTS_UI, ALL_LIVELLI_PEO, ALL_AREE_QUALIFICA, ALL_TIPI_MAGGIORAZIONE, PROGRESSION_ECONOMIC_VALUES } from '../constants.js';

const NESSUNA_PEO_VALUE = ""; // Sentinel value for "Nessuna PEO"

const formatCurrency = (value?: number, defaultText = TEXTS_UI.notApplicable) => {
  if (value === undefined || value === null || isNaN(value)) return defaultText;
  return `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getPeoOptionsForArea = (area?: AreaQualifica): { value: string; label: string }[] => {
  const baseOptions = [{ value: NESSUNA_PEO_VALUE, label: "Nessuna PEO" }];
  if (!area) {
    return [...baseOptions, ...ALL_LIVELLI_PEO];
  }

  let filteredPeo: LivelloPeo[] = [];
  switch (area) {
    case AreaQualifica.OPERATORE:
      filteredPeo = [LivelloPeo.A1, LivelloPeo.A2, LivelloPeo.A3, LivelloPeo.A4, LivelloPeo.A5, LivelloPeo.A6];
      break;
    case AreaQualifica.OPERATORE_ESPERTO:
      filteredPeo = [LivelloPeo.B1, LivelloPeo.B2, LivelloPeo.B3, LivelloPeo.B4, LivelloPeo.B5, LivelloPeo.B6, LivelloPeo.B7, LivelloPeo.B8];
      break;
    case AreaQualifica.ISTRUTTORE:
      filteredPeo = [LivelloPeo.C1, LivelloPeo.C2, LivelloPeo.C3, LivelloPeo.C4, LivelloPeo.C5, LivelloPeo.C6];
      break;
    case AreaQualifica.FUNZIONARIO_EQ:
      filteredPeo = [LivelloPeo.D1, LivelloPeo.D2, LivelloPeo.D3, LivelloPeo.D4, LivelloPeo.D5, LivelloPeo.D6, LivelloPeo.D7];
      break;
    default:
      return [...baseOptions, ...ALL_LIVELLI_PEO];
  }
  return [...baseOptions, ...filteredPeo.map(p => ({ value: p, label: p }))];
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
  const personaleServizioDettagli = state.fundData.annualData.personaleServizioDettagli || [];
  const annoRiferimento = state.fundData.annualData.annoRiferimento;
  const { calculatedFund } = state;

  const totalAbsorbedProgression = React.useMemo(() => {
    return (personaleServizioDettagli || []).reduce((sum, employee) => {
      if (employee.areaQualifica && employee.livelloPeoStoriche) {
        const areaValues = PROGRESSION_ECONOMIC_VALUES[employee.areaQualifica];
        if (areaValues) {
          const progressionValue = areaValues[employee.livelloPeoStoriche];
          if (typeof progressionValue === 'number') {
            const ptPercentage = (employee.partTimePercentage ?? 100) / 100;
            let serviceRatio = 1;

            if (employee.fullYearService === false) {
              if (!employee.assunzioneDate && !employee.cessazioneDate) {
                serviceRatio = 0;
              } else {
                const yearStartDate = new Date(annoRiferimento, 0, 1);
                const yearEndDate = new Date(annoRiferimento, 11, 31, 23, 59, 59, 999);

                const startDate = employee.assunzioneDate ? new Date(employee.assunzioneDate) : yearStartDate;
                const endDate = employee.cessazioneDate ? new Date(employee.cessazioneDate) : yearEndDate;

                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate) {
                    const effectiveStart = startDate > yearStartDate ? startDate : yearStartDate;
                    const effectiveEnd = endDate < yearEndDate ? endDate : yearEndDate;

                    if (effectiveEnd >= effectiveStart) {
                        const diffTime = effectiveEnd.getTime() - effectiveStart.getTime();
                        const serviceDaysInYear = (diffTime / (1000 * 60 * 60 * 24)) + 1;
                        
                        const isLeap = new Date(annoRiferimento, 1, 29).getDate() === 29;
                        const daysInYear = isLeap ? 366 : 365;
                        
                        serviceRatio = serviceDaysInYear / daysInYear;
                    } else {
                        serviceRatio = 0;
                    }
                } else {
                    serviceRatio = 0;
                }
              }
            }
            serviceRatio = Math.max(0, Math.min(1, serviceRatio));
            return sum + (progressionValue * ptPercentage * serviceRatio);
          }
        }
      }
      return sum;
    }, 0);
  }, [personaleServizioDettagli, annoRiferimento]);

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

  const handleAddEmployee = () => {
    const newEmployee: PersonaleServizioDettaglio = {
      id: Date.now().toString(),
      fullYearService: true, 
      partTimePercentage: 100,
      numeroDifferenziali: 0, 
      tipoMaggiorazione: TipoMaggiorazione.NESSUNA, 
      livelloPeoStoriche: undefined, 
    };
    dispatch({ type: 'ADD_PERSONALE_SERVIZIO_DETTAGLIO', payload: newEmployee });
  };

  const handleUpdateEmployee = (index: number, field: keyof PersonaleServizioDettaglio, value: any) => {
    const currentEmployee = personaleServizioDettagli[index];
    if (!currentEmployee) {
        console.error(`PersonaleServizioPage: Tentativo di aggiornare dipendente non esistente all'indice ${index}`);
        return;
    }

    const updatedEmployee: PersonaleServizioDettaglio = { ...currentEmployee };
    
    switch (field) {
        case 'areaQualifica':
            updatedEmployee[field] = (value === '' || value === null || value === undefined) ? undefined : value as AreaQualifica;
            updatedEmployee.livelloPeoStoriche = undefined; 
            updatedEmployee.numeroDifferenziali = 0;
            updatedEmployee.tipoMaggiorazione = TipoMaggiorazione.NESSUNA;
            const newDiffOptions = getDifferenzialiOptionsForArea(updatedEmployee.areaQualifica);
            if (!newDiffOptions.find(opt => opt.value === updatedEmployee.numeroDifferenziali)) {
                updatedEmployee.numeroDifferenziali = newDiffOptions[0]?.value ?? 0;
            }
            break;
        case 'partTimePercentage':
            updatedEmployee[field] = (value === '' || value === null || value === undefined) ? undefined : parseFloat(String(value));
            break;
        case 'numeroDifferenziali':
            const numValue = (value === '' || value === null || value === undefined) ? undefined : parseInt(String(value), 10);
            updatedEmployee[field] = numValue;
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
        case 'id':
            updatedEmployee.id = String(value);
            break;
        case 'matricola':
        case 'assunzioneDate':
        case 'cessazioneDate':
            updatedEmployee[field] = (value === '' || value === null || value === undefined) ? undefined : String(value);
            break;
        default:
            break;
    }
    
    dispatch({ type: 'UPDATE_PERSONALE_SERVIZIO_DETTAGLIO', payload: { index, detail: updatedEmployee } });
  };

  const handleRemoveEmployee = (index: number) => {
    dispatch({ type: 'REMOVE_PERSONALE_SERVIZIO_DETTAGLIO', payload: { index } });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">
        Personale in servizio nel {annoRiferimento}
      </h2>

      <Card title={`Elenco Personale Dipendente Anno ${annoRiferimento}`}>
        <p className="text-sm text-[#5f5252] mb-4">
          Inserire i dati per ciascun dipendente in servizio (o previsto) nell'anno {annoRiferimento}.
          Questi dati saranno utilizzati per futuri calcoli relativi all'assorbimento delle risorse stabili.
        </p>

        {personaleServizioDettagli.map((employee, index) => {
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
              defaultCollapsed={personaleServizioDettagli.length > 1 && index > 0}
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
                <Button variant="danger" size="sm" onClick={() => handleRemoveEmployee(index)}>
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

      <Card title="Riepilogo Progressioni Assorbite" className="mt-8">
        <div className="p-4 text-center">
          <p className="text-sm text-[#5f5252] mb-1">Importo Totale Progressioni Economiche Assorbite dal Personale</p>
          <p className="text-2xl font-bold text-[#ea2832]">
            {formatCurrency(totalAbsorbedProgression)}
          </p>
          <p className="text-xs text-[#5f5252] mt-2">
            Il calcolo considera la percentuale di part-time e i periodi di servizio effettivo nell'anno di riferimento.
          </p>
        </div>
      </Card>

    </div>
  );
};