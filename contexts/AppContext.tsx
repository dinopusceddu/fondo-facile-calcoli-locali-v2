// contexts/AppContext.tsx
import React, { createContext, useReducer, Dispatch, useContext, useCallback, useEffect } from 'react';
import { AppState, AppAction, UserRole, FundData, CalculatedFund, ComplianceCheck, ProventoSpecifico, EmployeeCategory, Art23EmployeeDetail, SimulatoreIncrementoInput, FondoAccessorioDipendenteData, FondoElevateQualificazioniData, FondoSegretarioComunaleData, FondoDirigenzaData, SimulatoreIncrementoRisultati, PersonaleServizioDettaglio } from '../types.js';
import { DEFAULT_CURRENT_YEAR, INITIAL_HISTORICAL_DATA, INITIAL_ANNUAL_DATA, DEFAULT_USER, INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA, INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA, INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA, INITIAL_FONDO_DIRIGENZA_DATA } from '../constants.js';
import { calculateFundCompletely } from '../hooks/useFundCalculations.js';
import { runAllComplianceChecks } from '../hooks/useComplianceChecks.js';

const initialState: AppState = {
  currentUser: DEFAULT_USER,
  currentYear: DEFAULT_CURRENT_YEAR,
  fundData: {
    historicalData: INITIAL_HISTORICAL_DATA,
    annualData: {
      ...INITIAL_ANNUAL_DATA,
      personaleServizioDettagli: [], // Assicura che sia inizializzato
    },
    fondoAccessorioDipendenteData: INITIAL_FONDO_ACCESSORIO_DIPENDENTE_DATA,
    fondoElevateQualificazioniData: INITIAL_FONDO_ELEVATE_QUALIFICAZIONI_DATA,
    fondoSegretarioComunaleData: INITIAL_FONDO_SEGRETARIO_COMUNALE_DATA,
    fondoDirigenzaData: INITIAL_FONDO_DIRIGENZA_DATA,
  },
  calculatedFund: undefined,
  complianceChecks: [],
  isLoading: false,
  error: undefined,
  activeTab: 'benvenuto',
};

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
  performFundCalculation: () => Promise<void>;
}>({
  state: initialState,
  dispatch: () => null,
  performFundCalculation: async () => {},
});

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_CURRENT_YEAR':
      return { ...state, currentYear: action.payload, fundData: {...state.fundData, annualData: {...state.fundData.annualData, annoRiferimento: action.payload}} };
    case 'UPDATE_HISTORICAL_DATA':
      return { ...state, fundData: { ...state.fundData, historicalData: { ...state.fundData.historicalData, ...action.payload } } };
    case 'UPDATE_ANNUAL_DATA':
      return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, ...action.payload } } };
    case 'UPDATE_SIMULATORE_INPUT':
      return { 
        ...state, 
        fundData: { 
          ...state.fundData, 
          annualData: { 
            ...state.fundData.annualData, 
            simulatoreInput: {
              ...state.fundData.annualData.simulatoreInput,
              ...action.payload,
            } as SimulatoreIncrementoInput 
          } 
        } 
      };
    case 'UPDATE_SIMULATORE_RISULTATI': 
      return {
        ...state,
        fundData: {
          ...state.fundData,
          annualData: {
            ...state.fundData.annualData,
            simulatoreRisultati: action.payload,
          }
        }
      };
    case 'UPDATE_CALCOLATO_INCREMENTO_PNRR3': 
      return {
        ...state,
        fundData: {
          ...state.fundData,
          annualData: {
            ...state.fundData.annualData,
            calcolatoIncrementoPNRR3: action.payload,
          }
        }
      };
    case 'UPDATE_FONDO_ACCESSORIO_DIPENDENTE_DATA': 
      return {
        ...state,
        fundData: {
          ...state.fundData,
          fondoAccessorioDipendenteData: {
            ...state.fundData.fondoAccessorioDipendenteData,
            ...action.payload,
          } as FondoAccessorioDipendenteData
        }
      };
    case 'UPDATE_FONDO_ELEVATE_QUALIFICAZIONI_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          fondoElevateQualificazioniData: {
            ...state.fundData.fondoElevateQualificazioniData,
            ...action.payload,
          } as FondoElevateQualificazioniData
        }
      };
    case 'UPDATE_FONDO_SEGRETARIO_COMUNALE_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          fondoSegretarioComunaleData: {
            ...state.fundData.fondoSegretarioComunaleData,
            ...action.payload,
          } as FondoSegretarioComunaleData
        }
      };
    case 'UPDATE_FONDO_DIRIGENZA_DATA':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          fondoDirigenzaData: {
            ...state.fundData.fondoDirigenzaData,
            ...action.payload,
          } as FondoDirigenzaData
        }
      };
    case 'UPDATE_EMPLOYEE_COUNT': 
      {
        const newCounts = state.fundData.annualData.personaleServizioAttuale.map(emp =>
          emp.category === action.payload.category ? { ...emp, count: action.payload.count } : emp
        );
        return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, personaleServizioAttuale: newCounts }}};
      }
    case 'ADD_PROVENTO_SPECIFICO':
      return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, proventiSpecifici: [...state.fundData.annualData.proventiSpecifici, action.payload] }}};
    case 'UPDATE_PROVENTO_SPECIFICO':
      {
        const updatedProventi = [...state.fundData.annualData.proventiSpecifici];
        updatedProventi[action.payload.index] = action.payload.provento;
        return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, proventiSpecifici: updatedProventi }}};
      }
    case 'REMOVE_PROVENTO_SPECIFICO':
      {
        const filteredProventi = state.fundData.annualData.proventiSpecifici.filter((_, index) => index !== action.payload);
        return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, proventiSpecifici: filteredProventi }}};
      }
    case 'ADD_ART23_EMPLOYEE_DETAIL':
      {
        const { yearType, detail } = action.payload;
        const key = yearType === '2018' ? 'personale2018PerArt23' : 'personaleAnnoRifPerArt23';
        const currentList = state.fundData.annualData[key] || [];
        return { 
            ...state, 
            fundData: { 
                ...state.fundData, 
                annualData: { 
                    ...state.fundData.annualData, 
                    [key]: [...currentList, detail] 
                }
            }
        };
      }
    case 'UPDATE_ART23_EMPLOYEE_DETAIL':
      {
        const { yearType, detail } = action.payload;
        const key = yearType === '2018' ? 'personale2018PerArt23' : 'personaleAnnoRifPerArt23';
        const currentList = [...(state.fundData.annualData[key] || [])];
        const index = currentList.findIndex(emp => emp.id === detail.id);
        if (index !== -1) {
            currentList[index] = detail;
        }
        return { 
            ...state, 
            fundData: { 
                ...state.fundData, 
                annualData: { 
                    ...state.fundData.annualData, 
                    [key]: currentList 
                }
            }
        };
      }
    case 'REMOVE_ART23_EMPLOYEE_DETAIL':
      {
        const { yearType, id } = action.payload;
        const key = yearType === '2018' ? 'personale2018PerArt23' : 'personaleAnnoRifPerArt23';
        const currentList = state.fundData.annualData[key] || [];
        const filteredList = currentList.filter((emp) => emp.id !== id);
        return { 
            ...state, 
            fundData: { 
                ...state.fundData, 
                annualData: { 
                    ...state.fundData.annualData, 
                    [key]: filteredList 
                }
            }
        };
      }
    case 'ADD_PERSONALE_SERVIZIO_DETTAGLIO': {
      console.log('Reducer: Action received:', action);
      console.log('Reducer: State BEFORE:', state.fundData.annualData.personaleServizioDettagli);
      const newList = [...(state.fundData.annualData.personaleServizioDettagli || []), action.payload];
      const newState = {
        ...state,
        fundData: {
          ...state.fundData,
          annualData: {
            ...state.fundData.annualData,
            personaleServizioDettagli: newList,
          },
        },
      };
      console.log('Reducer: State AFTER:', newState.fundData.annualData.personaleServizioDettagli);
      return newState;
    }
    case 'UPDATE_PERSONALE_SERVIZIO_DETTAGLIO': {
      console.log('Reducer: Action received:', action);
      console.log('Reducer: State BEFORE:', state.fundData.annualData.personaleServizioDettagli);
      const currentList = state.fundData.annualData.personaleServizioDettagli || [];
      const updatedList = currentList.map(emp => 
        emp.id === action.payload.detail.id ? action.payload.detail : emp
      );
      const newState = {
        ...state,
        fundData: {
          ...state.fundData,
          annualData: {
            ...state.fundData.annualData,
            personaleServizioDettagli: updatedList,
          },
        },
      };
      console.log('Reducer: State AFTER:', newState.fundData.annualData.personaleServizioDettagli);
      return newState;
    }
    case 'REMOVE_PERSONALE_SERVIZIO_DETTAGLIO': {
      console.log('Reducer: Action received:', action);
      console.log('Reducer: State BEFORE:', state.fundData.annualData.personaleServizioDettagli);
      const currentList = state.fundData.annualData.personaleServizioDettagli || [];
      const filteredList = currentList.filter(emp => emp.id !== action.payload.id);
      const newState = {
        ...state,
        fundData: {
          ...state.fundData,
          annualData: {
            ...state.fundData.annualData,
            personaleServizioDettagli: filteredList,
          },
        },
      };
      console.log('Reducer: State AFTER:', newState.fundData.annualData.personaleServizioDettagli);
      return newState;
    }
    case 'SET_PERSONALE_SERVIZIO_DETTAGLI':
      return {
        ...state,
        fundData: {
          ...state.fundData,
          annualData: {
            ...state.fundData.annualData,
            personaleServizioDettagli: action.payload,
          },
        },
      };
    case 'CALCULATE_FUND_START':
      return { ...state, isLoading: true, error: undefined };
    case 'CALCULATE_FUND_SUCCESS':
      return { ...state, isLoading: false, calculatedFund: action.payload.fund, complianceChecks: action.payload.checks };
    case 'CALCULATE_FUND_ERROR':
      return { ...state, isLoading: false, error: action.payload, calculatedFund: undefined, complianceChecks: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
};

const useAutoSave = (state: AppState) => {
  useEffect(() => {
    try {
      localStorage.setItem('appState', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [state]);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(savedState) });
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  useAutoSave(state);

  const performFundCalculation = useCallback(async () => {
    dispatch({ type: 'CALCULATE_FUND_START' });
    try {
      const calculatedFund = calculateFundCompletely(state.fundData);
      const complianceChecks = runAllComplianceChecks(calculatedFund, state.fundData);
      dispatch({ type: 'CALCULATE_FUND_SUCCESS', payload: { fund: calculatedFund, checks: complianceChecks } });
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      dispatch({ type: 'CALCULATE_FUND_ERROR', payload: `Errore nel calcolo: ${error}` });
      console.error("Calculation error:", e);
    }
  }, [state.fundData]);

  return (
    <AppContext.Provider value={{ state, dispatch, performFundCalculation }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);