import React, { useEffect, useRef } from 'react';
import { useTutorial } from '../context/TutorialContext';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';

const TutorialWizard: React.FC = () => {
  // Tente usar o tutorial context, mas não falhe se não estiver disponível
  let tutorialContext;
  try {
    tutorialContext = useTutorial();
  } catch (error) {
    console.error('[TutorialWizard] Erro ao acessar o tutorial context:', error);
    return null; // Não renderiza o wizard se não tiver acesso ao context
  }

  const { 
    isActive, 
    currentStep, 
    totalSteps, 
    steps, 
    nextStep, 
    prevStep, 
    skipTutorial 
  } = tutorialContext;

  const tooltipRef = useRef<HTMLDivElement>(null);
  const offset = 8; // Define o offset para o posicionamento

  useEffect(() => {
    if (!isActive || !tooltipRef.current) {
      // Limpeza adicional quando o tutorial é desativado
      if (!isActive) {
        console.log('[TutorialWizard] O tutorial foi desativado, limpando highlights');
        document.querySelectorAll('.tutorial-highlight, .nav-tutorial-highlight').forEach(el => {
          el.classList.remove('tutorial-highlight', 'nav-tutorial-highlight');
        });
      }
      return;
    }

    console.log(`[TutorialWizard] Ativo: ${isActive}, Passo atual: ${currentStep + 1}/${totalSteps}`);
    console.log(`[TutorialWizard] Elemento alvo: ${steps[currentStep].element}`);

    // Posicionar o tooltip relativo ao elemento destacado
    const positionTooltip = () => {
      const targetElement = document.querySelector(steps[currentStep].element);
      if (!targetElement || !tooltipRef.current) return;

      // Garantir que o elemento tenha a classe tutorial-highlight
      if (!targetElement.classList.contains('tutorial-highlight')) {
        console.log(`[TutorialWizard] Adicionando classe tutorial-highlight ao elemento ${steps[currentStep].element}`);
        targetElement.classList.add('tutorial-highlight');
      }

      const elementRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const position = steps[currentStep].position || 'bottom';

      let top, left;

        // Caso especial para o primeiro passo (boas-vindas) quando o elemento é 'body'
        if (steps[currentStep].element === 'body') {
          // Posicionar no centro da tela
          top = (window.innerHeight / 2) - (tooltipRect.height / 2);
          left = (window.innerWidth / 2) - (tooltipRect.width / 2);
        } else {
          switch (position) {
            case 'top':
              top = elementRect.top - tooltipRect.height - offset;
              left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
              break;
            case 'right':
              top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
              left = elementRect.right + offset;
              break;
            case 'bottom':
              top = elementRect.bottom + offset;
              left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
              break;
            case 'left':
              top = elementRect.top + elementRect.height / 2 - tooltipRect.height / 2;
              left = elementRect.left - tooltipRect.width - offset;
              break;
            default:
              // Para itens de navegação, posicionamento especial
              if (steps[currentStep].element.includes('nav-')) {
                // Posicionamento especial para navegação inferior
                if (elementRect.top > window.innerHeight / 2) {
                  // Para itens no menu inferior
                  top = elementRect.top - tooltipRect.height - 16;
                  left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
                } else {
                  // Para itens no menu superior
                  top = elementRect.bottom + 16;
                  left = elementRect.left + elementRect.width / 2 - tooltipRect.width / 2;
                }
              } else {
                top = elementRect.bottom + 8;
                left = elementRect.left;
              }
          }
        }

      // Ajuste para evitar sair da tela
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < 12) left = 12;
      if (left + tooltipRect.width > viewportWidth - 12) 
        left = viewportWidth - tooltipRect.width - 12;

      if (top < 12) top = 12;
      if (top + tooltipRect.height > viewportHeight - 12) 
        top = viewportHeight - tooltipRect.height - 12;

      tooltipRef.current.style.top = `${top}px`;
      tooltipRef.current.style.left = `${left}px`;
    };

    // Executar inicialmente e em cada resize da janela
    positionTooltip();
    window.addEventListener('resize', positionTooltip);

    return () => {
      window.removeEventListener('resize', positionTooltip);
      
      // Limpar todos os highlights ao desmontar
      if (isActive) {
        console.log('[TutorialWizard] Desmontando componente, limpando todos os highlights');
        steps.forEach(step => {
          const element = document.querySelector(step.element);
          if (element) {
            element.classList.remove('tutorial-highlight', 'nav-tutorial-highlight');
          }
        });
        
        // Limpar qualquer elemento com a classe tutorial-highlight
        document.querySelectorAll('.tutorial-highlight, .nav-tutorial-highlight').forEach(el => {
          el.classList.remove('tutorial-highlight', 'nav-tutorial-highlight');
        });
      }
    };
  }, [isActive, currentStep, steps, offset, totalSteps]);

  if (!isActive) {
    // Quando o tutorial não está ativo, não renderizamos nada
    return null;
  }

  return (
    <>
      {/* Só renderizamos o overlay quando o tutorial está ativo */}
      <div className="tutorial-overlay"></div>
      <div 
        ref={tooltipRef}
        className="tutorial-tooltip fixed z-50 w-72 p-4 rounded-lg text-white pointer-events-auto"
      >
        <button 
          onClick={skipTutorial}
          className="absolute top-2 right-2 text-white/70 hover:text-white"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold mb-1 ghost-text">
          {steps[currentStep].title}
        </h3>

        <p className="mb-4 text-sm text-white/80">
          {steps[currentStep].description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-sm text-white/60">
            {currentStep + 1} de {totalSteps}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="p-2 rounded-full bg-neutral-700/50 hover:bg-neutral-700"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <button
              onClick={nextStep}
              className="p-2 rounded-full bg-primary hover:bg-primary/90 flex items-center gap-1"
            >
              {currentStep === totalSteps - 1 ? (
                <span className="text-sm px-1">Concluir</span>
              ) : (
                <ArrowRight size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialWizard;