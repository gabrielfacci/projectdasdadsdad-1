import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Gift, Sparkles, Shield, Zap } from 'lucide-react';
import { useOnboardingFlow } from '../../../context/OnboardingContext';
import '../../../index.css';
import './onboardingResponsive.css';
import { generateUTMUrl } from '../../../lib/utils'; // Added import

interface TestCompletedProps {
  userName: string;
  onComplete: () => void;
}

const TestCompleted: React.FC<TestCompletedProps> = ({ userName, onComplete }) => {
  const [isButtonActive, setIsButtonActive] = useState(false);

  useEffect(() => {
    // Ativar botão após 2 segundos para dar tempo da animação
    const timer = setTimeout(() => {
      setIsButtonActive(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.03, 1],
      boxShadow: [
        "0 0 0 rgba(123, 104, 238, 0.4)",
        "0 0 20px rgba(123, 104, 238, 0.6)",
        "0 0 0 rgba(123, 104, 238, 0.4)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "mirror"
      }
    }
  };

  const confettiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0.5],
      y: [0, 100],
      x: (i: number) => [0, i * 20 - 40],
      transition: (i: number) => ({
        duration: 2.5,
        delay: 0.2 + i * 0.1,
        repeat: Infinity,
        repeatDelay: i * 0.5
      })
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: "Perfil Criptográfico Completo",
      description: "Seu perfil está pronto para o Ghost Ecosystem",
      color: "#4ECDC4"
    },
    {
      icon: Zap,
      title: "Acesso a Métricas Avançadas",
      description: "Você terá dados para análise de desempenho",
      color: "#FFD166"
    },
    {
      icon: Gift,
      title: "Compatibilidade com o Ghost Chain",
      description: "Mineração otimizada em nossa rede",
      color: "#FF6B6B"
    }
  ];

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-md mx-auto px-3 sm:px-4 py-4 sm:py-6 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Confetti animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              backgroundColor:
                i % 3 === 0 ? "#6C63FF" :
                  i % 3 === 1 ? "#FFD166" : "#FF6B6B"
            }}
            variants={confettiVariants}
            custom={i}
          />
        ))}
      </div>

      {/* Main icon */}
      <motion.div
        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-green-500/90 to-emerald-600/90 flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
        variants={itemVariants}
        whileHover={{ scale: 1.05, rotate: 3 }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-green-500/50 to-emerald-500/50 rounded-2xl blur-md opacity-70"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />

        {/* Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror"
          }}
          className="relative z-10"
        >
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </motion.div>

        {/* Sparkle effect */}
        <motion.div
          className="absolute -right-1 -top-1"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            delay: 0.5
          }}
        >
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </motion.div>
      </motion.div>

      {/* Title with name */}
      <motion.h2
        className="text-xl sm:text-2xl font-bold text-white text-center mb-2 sm:mb-3"
        variants={itemVariants}
      >
        Parabéns, <span className="text-primary">{userName}</span>!
      </motion.h2>

      <motion.p
        className="text-neutral-300 text-center mb-4 sm:mb-6 max-w-xs text-[14px]"
        variants={itemVariants}
      >
        Você completou com sucesso a análise de perfil do Ghost Wallet. Seu perfil está pronto para
        operações avançadas em nossa rede.
      </motion.p>

      {/* Benefits */}
      <motion.div
        className="w-full space-y-3 sm:space-y-4 mb-6 sm:mb-8"
        variants={containerVariants}
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            className="flex items-start p-3 sm:p-4 bg-background-light/10 border border-white/10 rounded-xl relative overflow-hidden"
            variants={featureVariants}
            custom={index}
            whileHover={{
              y: -2,
              boxShadow: `0 4px 20px ${benefit.color}15`
            }}
          >
            {/* Feature animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(to right, ${benefit.color}10, transparent)`,
                opacity: 0.3
              }}
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: index * 0.5
              }}
            />

            <div className="p-2 sm:p-2.5 rounded-lg mr-3 sm:mr-4 relative z-10" style={{ backgroundColor: `${benefit.color}20` }}>
              <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: benefit.color }} />
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="text-white text-xs sm:text-sm font-medium">{benefit.title}</h3>
              <p className="text-neutral-400 text-[14px] mt-0.5 sm:mt-1">{benefit.description}</p>
            </div>

            {/* Animated spark */}
            {index === 1 && (
              <motion.div
                className="absolute -right-1 -top-1"
                animate={{
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 1
                }}
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Certificate message */}
      <motion.div
        className="w-full p-3 sm:p-4 bg-gradient-to-r from-[#6C63FF]/20 to-[#4ECDC4]/20 rounded-xl border border-white/10 mb-6 sm:mb-8 relative overflow-hidden"
        variants={itemVariants}
        initial="pulse"
        transition={{ delay: 0.8, duration: 0.5 }}
        >

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#6C63FF]/10 to-[#4ECDC4]/10"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-white/10 rounded-full">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD166]" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-white">Certificado Ghost Wallet</h4>
            <p className="text-[10px] sm:text-xs text-neutral-400">
              Seu perfil foi verificado e certificado para operações em nossa rede
            </p>
          </div>
        </div>
      </motion.div>

      {/* Finish button */}
      <motion.button
        onClick={onComplete}
        className="w-full h-12 sm:h-14 rounded-xl relative overflow-hidden"
        initial={itemVariants.hidden}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate="pulse"
        variants={pulseVariants}>

        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#6C63FF] to-[#4ECDC4] opacity-90"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />

        <span className="relative z-10 text-white text-sm sm:text-base font-medium flex items-center justify-center gap-2">
          Acessar Minha Conta
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>

        {/* Animated highlight */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0"
          animate={{
            opacity: [0, 0.2, 0],
            left: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: 0.5
          }}
        />
      </motion.button>

      {/* Hot spots animation */}
      <div className="absolute bottom-4 right-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#FFD166]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0
          }}
        />
      </div>

      <div className="absolute top-10 left-4">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#4ECDC4]"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0.5
          }}
        />
      </div>

      {/* Example usage of appendUTMtoLink -  Replace with your actual usage */}
      <div>
        <a
          href={generateUTMUrl("https://go.perfectpay.com.br/PPU38CPJJ4C")}
          target="_blank"
          rel="noopener noreferrer"
          className="action-button bg-primary text-white hover:bg-primary/90"
        >
          Comprar agora
        </a>
      </div>
    </motion.div>
  );
};

export default TestCompleted;