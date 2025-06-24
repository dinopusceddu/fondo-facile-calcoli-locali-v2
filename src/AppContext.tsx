// src/AppContext.tsx
import React, { createContext, useReducer, Dispatch, useContext, useCallback } from 'react';
import { AppState, AppAction, UserRole, FundData, CalculatedFund, ComplianceCheck, ProventoSpecifico, EmployeeCategory } from '../types.js';
import { DEFAULT_CURRENT_YEAR, INITIAL_HISTORICAL_DATA, INITIAL_ANNUAL_DATA, DEFAULT_USER } from '../constants.js';
import { calculateFundCompletely } from './useFundCalculations.js'; 
import { runAllComplianceChecks } from './useComplianceChecks.js'; 

const initialState: AppState = {
  currentUser: DEFAULT_USER,
  currentYear: DEFAULT_CURRENT_YEAR,
  fundData: {
    historicalData: INITIAL_HISTORICAL_DATA,
    annualData: INITIAL_ANNUAL_DATA,
  },
  calculatedFund: undefined,
  complianceChecks: [],
  isLoading: false,
  error: undefined,
  activeTab: 'dashboard',
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
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_CURRENT_YEAR':
      return { ...state, currentYear: action.payload, fundData: {...state.fundData, annualData: {...state.fundData.annualData, annoRiferimento: action.payload}} };
    case 'UPDATE_HISTORICAL_DATA':
      return { ...state, fundData: { ...state.fundData, historicalData: { ...state.fundData.historicalData, ...action.payload } } };
    case 'UPDATE_ANNUAL_DATA':
      return { ...state, fundData: { ...state.fundData, annualData: { ...state.fundData.annualData, ...action.payload } } };
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const performFundCalculation = useCallback(async () => {
    dispatch({ type: 'CALCULATE_FUND_START' });
    try {
      // Simulate API call or complex calculation
      // await new Promise(resolve => setTimeout(resolve, 1000)); 
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