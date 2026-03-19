import React, { createContext, useContext } from 'react';
import { ViewState } from '../types';

interface NavigationContextType {
  profileEnrollmentId: number | null;
  navigateToProfile: (enrollmentId: number | null) => void;
  navigateBack: () => void;
  navigateTo: (view: ViewState) => void;
}

export const NavigationContext = createContext<NavigationContextType>({
  profileEnrollmentId: null,
  navigateToProfile: () => {},
  navigateBack: () => {},
  navigateTo: () => {},
});

export const useNavigation = () => useContext(NavigationContext);
