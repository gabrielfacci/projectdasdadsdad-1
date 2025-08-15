import React, { createContext, useState, useContext, useEffect } from 'react';

interface TutorialStep {
  element: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  steps: TutorialStep[];
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  startTutorial: () => void;
  hasSeenTutorial: boolean;
  updateWelcomeMessage: (userName: string) => void;
}

const defaultSteps: TutorialStep[] = [
  {
    element: 'body',
    title: 'Bem-vindo(a)!',
    description: 'Olá! Bem-vindo(a) ao seu dashboard. Vamos conhecer as principais funcionalidades?',
    position: 'bottom'
  },
  {
    element: '.nav-dashboard',
    title: 'Dashboard',
    description: 'Página principal com visão geral do seu saldo e estatísticas.',
    position: 'top'
  },
  {
    element: '.nav-mineracao',
    title: 'Mineração',
    description: 'Aqui você pode iniciar e controlar suas operações de mineração.',
    position: 'top'
  },
  {
    element: '.nav-referencias',
    title: 'Referências',
    description: 'Convide amigos e ganhe recompensas por cada novo usuário.',
    position: 'top'
  },
  {
    element: '.nav-configuracoes',
    title: 'Configurações',
    description: 'Ajuste suas preferências e configurações da conta.',
    position: 'top'
  },
  {
    element: '.balance-card',
    title: 'Saldo Estimado',
    description: 'Aqui você pode acompanhar o saldo total de suas carteiras encontradas.',
    position: 'bottom'
  },
  {
    element: '.trending-card',
    title: 'Blockchains em Tendência',
    description: 'Explore diferentes blockchains para minerar carteiras.',
    position: 'top'
  },
  {
    element: '.stat-card:nth-child(1)',
    title: 'Taxa de Hash',
    description: 'Acompanhe a velocidade da sua mineração em tempo real.',
    position: 'bottom'
  },
  {
    element: '.stat-card:nth-child(3)',
    title: 'Carteiras Encontradas',
    description: 'Veja quantas carteiras sua mineração já encontrou.',
    position: 'bottom'
  },
  {
    element: '.status-da-rede',
    title: 'Status da Rede',
    description: 'Acompanhe as estatísticas gerais da sua mineração.',
    position: 'top'
  }
];

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>(defaultSteps);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    const seen = localStorage.getItem('hasSeenTutorial') === 'true';
    console.log(`[TutorialContext] Inicializado. Tutorial já visto antes: ${seen}`);
    return seen;
  });
  
  const updateWelcomeMessage = (userName: string) => {
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      if (newSteps.length > 0) {
        newSteps[0] = {
          ...newSteps[0],
          description: `Olá ${userName}! Bem-vindo(a) ao seu dashboard. Vamos conhecer as principais funcionalidades?`
        };
      }
      return newSteps;
    });
  };

  // Log dos passos do tutorial ao inicializar
  useEffect(() => {
    console.log(`[TutorialContext] ${steps.length} passos definidos no tutorial:`);
    steps.forEach((step, index) => {
      console.log(`[TutorialContext] Passo ${index + 1}: ${step.title} (${step.element})`);
    });
  }, [steps]);

  useEffect(() => {
    if (!isActive) {
      // Limpar todos os highlights quando o tutorial é desativado
      clearAllHighlights();
      
      // Garantir que não haja overlay residual
      const overlayElements = document.querySelectorAll('.tutorial-overlay');
      overlayElements.forEach(el => {
        document.body.removeChild(el);
      });
      
      // Limpar qualquer estado visual residual no body
      document.body.style.backgroundColor = '#0d0a14';
      document.body.style.opacity = '1';
      
      return;
    }

    // Destacar o elemento atual
    const currentElement = document.querySelector(steps[currentStep].element);
    if (currentElement) {
      console.log(`[Tutorial] Adicionando highlight ao elemento: ${steps[currentStep].element}`);
      
      // Adiciona classes específicas para itens de navegação
      if (steps[currentStep].element.includes('nav-')) {
        currentElement.classList.add('tutorial-highlight', 'nav-tutorial-highlight');
        
        // Adiciona um efeito visual mais destacado para elementos de navegação
        document.body.classList.add('highlighting-nav');
        
        // Scroll para o elemento com um pequeno offset quando for item de navegação
        setTimeout(() => {
          currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        currentElement.classList.add('tutorial-highlight');
      }
      
      // Garantir que o elemento esteja visível na tela
      setTimeout(() => {
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      console.warn(`[Tutorial] Elemento não encontrado para highlight: ${steps[currentStep].element}`);
    }

    return () => {
      // Limpar highlight ao desmontar
      if (currentElement) {
        console.log(`[Tutorial] Removendo highlight do elemento: ${steps[currentStep].element}`);
        currentElement.classList.remove('tutorial-highlight', 'nav-tutorial-highlight');
        
        // Remover a classe do body se estávamos destacando um elemento de navegação
        if (steps[currentStep].element.includes('nav-')) {
          document.body.classList.remove('highlighting-nav');
        }
      }
    };
  }, [isActive, currentStep, steps]);

  const nextStep = () => {
    // Remover highlight do elemento atual
    const currentElement = document.querySelector(steps[currentStep].element);
    if (currentElement) {
      currentElement.classList.remove('tutorial-highlight');
      console.log(`[Tutorial] Removido highlight do elemento: ${steps[currentStep].element}`);
    } else {
      console.warn(`[Tutorial] Elemento não encontrado: ${steps[currentStep].element}`);
    }

    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      console.log(`[Tutorial] Avançando para o passo ${nextStepIndex + 1}/${steps.length}: ${steps[nextStepIndex].title}`);
      setCurrentStep(nextStepIndex);
      
      // Não adiciona highlight aqui, pois o useEffect vai cuidar disso
    } else {
      console.log('[Tutorial] Tutorial concluído! Salvando no localStorage.');
      
      // Limpar todos os highlights antes de desativar
      steps.forEach(step => {
        const element = document.querySelector(step.element);
        if (element) {
          element.classList.remove('tutorial-highlight', 'nav-tutorial-highlight');
          console.log(`[Tutorial] Removendo highlight do elemento: ${step.element} ao concluir`);
        }
      });
      
      // Limpar qualquer elemento com a classe tutorial-highlight
      document.querySelectorAll('.tutorial-highlight, .nav-tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight', 'nav-tutorial-highlight');
        console.log('[Tutorial] Removido highlight de elemento residual');
      });
      
      // Só desativa após o usuário clicar em "Concluir" no último passo
      setIsActive(false);
      setHasSeenTutorial(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  };

  const prevStep = () => {
    // Remover highlight do elemento atual
    const currentElement = document.querySelector(steps[currentStep].element);
    if (currentElement) {
      currentElement.classList.remove('tutorial-highlight');
      console.log(`[Tutorial] Removido highlight do elemento: ${steps[currentStep].element}`);
    } else {
      console.warn(`[Tutorial] Elemento não encontrado: ${steps[currentStep].element}`);
    }

    if (currentStep > 0) {
      const previousStepIndex = currentStep - 1;
      console.log(`[Tutorial] Voltando para o passo ${previousStepIndex + 1}/${steps.length}: ${steps[previousStepIndex].title}`);
      setCurrentStep(previousStepIndex);
      
      // Não adiciona highlight aqui, pois o useEffect vai cuidar disso
    }
  };

  const skipTutorial = () => {
    console.log('[Tutorial] Tutorial pulado pelo usuário. Salvando preferência.');
    
    // Primeiro desativar o tutorial para parar as animações
    setIsActive(false);
    
    // Agora limpamos todos os highlights
    clearAllHighlights();
    
    // Garantir uma segunda limpeza após um pequeno delay para casos persistentes
    setTimeout(() => {
      document.querySelectorAll('.tutorial-highlight, .nav-tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight', 'nav-tutorial-highlight');
        console.log('[Tutorial] Removido highlight de elemento residual (segunda passagem)');
      });
    }, 200);
    setCurrentStep(0);
    setHasSeenTutorial(true);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  // Função auxiliar para limpar todos os highlights
  const clearAllHighlights = () => {
    console.log('[Tutorial] Limpando todos os highlights...');
    
    // Limpar highlights baseados nos passos
    steps.forEach(step => {
      const element = document.querySelector(step.element);
      if (element) {
        element.classList.remove('tutorial-highlight', 'nav-tutorial-highlight');
        element.classList.add('tutorial-highlight-clear');
        setTimeout(() => {
          element.classList.remove('tutorial-highlight-clear');
        }, 100);
      }
    });
    
    // Garantir que todos os elementos destacados sejam limpos
    document.querySelectorAll('.tutorial-highlight, .nav-tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight', 'nav-tutorial-highlight');
      el.classList.add('tutorial-highlight-clear');
      setTimeout(() => {
        el.classList.remove('tutorial-highlight-clear');
      }, 100);
    });
  };

  const startTutorial = () => {
    console.log('[Tutorial] Iniciando tutorial...');
    setIsActive(true);
    setCurrentStep(0);

    // Permite que o tutorial seja reiniciado mesmo se já foi visto antes
    if (hasSeenTutorial) {
      console.log('[Tutorial] Tutorial já foi visto, mas será exibido novamente a pedido do usuário');
    }
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: steps.length,
        steps,
        nextStep,
        prevStep,
        skipTutorial,
        startTutorial,
        hasSeenTutorial,
        updateWelcomeMessage
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export function useTutorial(): TutorialContextType {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}