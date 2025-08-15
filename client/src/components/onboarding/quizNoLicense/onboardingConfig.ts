// Etapas do onboarding
export enum ONBOARDING_STEPS {
  NAME_ENTRY = 0,
  PROFILE_ANALYSIS = 1,
  CRYPTO_LEVEL = 2, 
  RETURN_PREFERENCE = 3,
  CRYPTO_INTEREST = 4,
  WALLET_EXPERIENCE = 5,
  OPPORTUNITY_APPROACH = 6,
  MINING_EXPERIENCE = 7,
  GHOST_TEST = 8,
  PROFILE_APPROVAL = 9,
  MINING_SIMULATION = 10,
  SYSTEM_UNLOCKED = 11,
  MINING_RESULTS = 12,
  WALLET_FOUND = 13,
  TEST_COMPLETED = 14
}

// Animações compartilhadas
export const animations = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  },
  itemVariants: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }
};

// Estilos compartilhados
const commonStyles = {
  cardBase: "p-4 bg-background-light/10 border border-white/10 rounded-xl shadow-lg",
  button: "w-full h-12 rounded-xl bg-primary text-white font-medium shadow-md hover:bg-primary/90 disabled:bg-neutral-700 disabled:text-neutral-400 transition-all duration-300",
  secondaryButton: "w-full h-12 rounded-xl bg-white/10 text-white font-medium shadow-md hover:bg-white/20 transition-all duration-300",
  inputBase: "w-full h-12 px-4 rounded-xl bg-background-light/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all",
  heading: "text-xl font-bold text-white text-center mb-6",
  subHeading: "text-neutral-300 text-sm text-center mb-6",
  label: "block text-sm font-medium text-white mb-2",
  select: "w-full h-12 px-4 rounded-xl bg-background-light/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none",
  selectArrow: "absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none",
  checkbox: "h-5 w-5 rounded border-white/30 bg-background-light/20 text-primary focus:ring-primary/50",
  checkboxLabel: "ml-2 block text-sm text-white",
  radio: "h-5 w-5 border-white/30 bg-background-light/20 text-primary focus:ring-primary/50"
};

// Mensagens comuns
const commonMessages = {
  requiredField: "Este campo é obrigatório",
  invalidEmail: "Por favor, insira um email válido",
  passwordMismatch: "As senhas não coincidem",
  passwordLength: "A senha deve ter pelo menos 8 caracteres"
};

export default {
  steps: ONBOARDING_STEPS,
  animations,
  styles: commonStyles,
  messages: commonMessages
};