import React, { createContext, useContext } from 'react';

interface NavigationContextType {
  profileEnrollmentId: number | null;
  navigateToProfile: (enrollmentId: number | null) => void;
  navigateBack: () => void;
}

export const NavigationContext = createContext<NavigationContextType>({
  profileEnrollmentId: null,
  navigateToProfile: () => {},
  navigateBack: () => {},
});

export const useNavigation = () => useContext(NavigationContext);
