import { createContext, useContext } from 'react';
import { ViewState } from '../types';
import type { RouteParams } from '../router/routes';

interface NavigationContextType {
  params: RouteParams;
  profileEnrollmentId: number | null;
  navigateToProfile: (enrollmentId: number | null) => void;
  navigateBack: () => void;
  navigateTo: (view: ViewState, params?: RouteParams) => void;
}

export const NavigationContext = createContext<NavigationContextType>({
  params: {},
  profileEnrollmentId: null,
  navigateToProfile: () => {},
  navigateBack: () => {},
  navigateTo: () => {},
});

export const useNavigation = () => useContext(NavigationContext);
