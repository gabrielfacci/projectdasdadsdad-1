import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface OnboardingContextType {
  currentStep: number;
  isCompleted: boolean;
  quizData: Record<string, any>;
  isLoading: boolean;
  setStep: (step: number) => void;
  updateQuizData: (data: Record<string, any>) => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboardingFlow() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingFlow must be used within an OnboardingProvider');
  }
  return context;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [quizData, setQuizData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { user } = useAuth();

  // Check if onboarding is completed when user changes
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Check database first
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, onboarding_completed, onboarding_step, onboarding_data')
          .eq('email', user.email)
          .maybeSingle();

        if (error) throw error;

        // If we have data from the database, prioritize it
        if (data) {
          // If user has a name, update quiz data
          if (data.name) {
            setQuizData(prev => ({ ...prev, name: data.name }));
          }
          
          // Check if onboarding is completed in DB
          if (data.onboarding_completed) {
            setIsCompleted(true);
            localStorage.setItem('ghostwallet_onboarding_completed', 'true');
          } else {
            // If not completed but has saved progress in DB
            if (data.onboarding_step !== null && data.onboarding_step >= 0) {
              setCurrentStep(data.onboarding_step);
              localStorage.setItem('ghostwallet_onboarding_step', data.onboarding_step.toString());

              // If we have saved quiz data in DB
              if (data.onboarding_data) {
                try {
                  const dbQuizData = typeof data.onboarding_data === 'string' 
                    ? JSON.parse(data.onboarding_data)
                    : data.onboarding_data;

                  setQuizData(prev => ({ ...prev, ...dbQuizData }));
                  localStorage.setItem('ghostwallet_onboarding_data', JSON.stringify(dbQuizData));
                } catch (err) {
                  console.error('Error parsing onboarding data from DB:', err);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      }
      
      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, [user]);

  // Update step in localStorage
  const setStep = (step: number) => {
    // Validate step range
    if (step < 0 || step > 14) {
      console.error('Invalid step number:', step);
      return;
    }

    setCurrentStep(step);
    localStorage.setItem('ghostwallet_onboarding_step', step.toString());
    
    // Update in database if user is available
    if (user?.email) {
      updateOnboardingInDB(user.email, { onboarding_step: step });
    }
  };

  // Update quiz data with automatic save
  const updateQuizData = (newData: Record<string, any>) => {
    const updatedData = { ...quizData, ...newData };
    setQuizData(updatedData);
    
    // Save to local storage
    localStorage.setItem('ghostwallet_onboarding_data', JSON.stringify(updatedData));
    
    // Save to database if user is available
    if (user?.email) {
      updateOnboardingInDB(user.email, { 
        onboarding_data: updatedData 
      });
    }
  };

  // Complete onboarding
  const completeOnboarding = () => {
    setIsCompleted(true);
    localStorage.setItem('ghostwallet_onboarding_completed', 'true');
    
    // Update in database if user is available
    if (user?.email) {
      updateOnboardingInDB(user.email, { 
        onboarding_completed: true,
        onboarding_step: 14 // Final step
      });
    }
  };

  // Utility function to update onboarding data in database
  const updateOnboardingInDB = async (email: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('email', email);
      
      if (error) throw error;
    } catch (err) {
      console.error('Error updating onboarding in DB:', err);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        isCompleted,
        quizData,
        isLoading,
        setStep,
        updateQuizData,
        completeOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}