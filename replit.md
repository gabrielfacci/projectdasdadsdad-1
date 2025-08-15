# Ghost Wallet - Cryptocurrency Wallet Discovery Application

## Overview

Ghost Wallet is a full-stack web application built for cryptocurrency wallet discovery and mining simulation. The application features a React frontend with a Node.js/Express backend, using Supabase as the primary database and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API for global state
- **Routing**: React Router for client-side navigation
- **UI Components**: Radix UI primitives with custom Ghost-themed styling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Development**: TSX for TypeScript execution
- **Build**: ESBuild for production bundling
- **API Structure**: RESTful endpoints with `/api` prefix

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM with Neon serverless driver
- **Local Storage**: Browser localStorage for client-side caching
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

## Key Components

### Authentication System
- Supabase Auth integration with custom user management
- Profile-based authentication with onboarding flow
- Admin role support with protected routes
- License validation and synchronization

### Mining Simulation
- Multi-blockchain support (Solana, Bitcoin, Ethereum, BSC, Cardano, Polkadot)
- Web Workers for background processing
- Real-time statistics and hash rate simulation
- Wallet discovery with balance generation

### License Management
- External license API integration
- Blockchain access control based on license status
- Automatic license synchronization
- Cached access checks for performance

### Referral System
- User referral code generation
- Commission tracking and balance management
- Ranking system with leaderboards
- Withdrawal request processing

### UI/UX Features
- Progressive Web App (PWA) capabilities
- Service Worker for offline functionality
- Responsive design with mobile-first approach
- Ghost-themed animations and visual effects

## Data Flow

### User Authentication Flow
1. User registration/login through Supabase Auth
2. Profile creation with onboarding process
3. License validation against external API
4. Session persistence in PostgreSQL

### Mining Operation Flow
1. Blockchain selection with access validation
2. Web Worker initialization for background processing
3. Simulated wallet generation and balance checking
4. Real-time statistics updates to UI
5. Found wallets stored in local database

### License Synchronization Flow
1. Periodic API calls to external license service
2. Database updates with current license status
3. Access control enforcement for blockchain features
4. User notification of license changes

## External Dependencies

### Core Services
- **Supabase**: Authentication, database, and real-time features
- **Neon Database**: PostgreSQL hosting for Drizzle ORM
- **External License API**: License validation service

### API Integrations
- **CoinGecko**: Cryptocurrency price data
- **Multiple RPC Endpoints**: Blockchain network access
- **Facebook Pixel**: Analytics and conversion tracking

### Third-party Libraries
- **React Query**: Server state management
- **Framer Motion**: Animations and transitions
- **Date-fns**: Date manipulation utilities
- **Cross-fetch**: Universal fetch implementation

## Deployment Strategy

### Development Environment
- Vite dev server with hot module replacement
- TSX for TypeScript execution
- Replit-specific plugins for development tools

### Production Build
- Vite build for frontend static assets
- ESBuild for backend bundling
- Output to `dist/` directory structure

### Environment Configuration
- Environment variables for database and API keys
- Separate configs for development/production
- Supabase connection string management

### Database Management
- Drizzle migrations in `migrations/` directory
- Schema definitions in `shared/schema.ts`
- Database push command for schema updates

The application follows a modern full-stack architecture with clear separation of concerns, robust error handling, and scalable design patterns suitable for cryptocurrency-related applications.

## Recent Changes: Latest modifications with dates

### 30/07/2025 - Complete Internationalization Coverage for All Onboarding Components
- **Full Quiz Flow Translation**: Applied comprehensive internationalization to CryptoLevel, ReturnPreference, WalletExperience, MiningExperience, OpportunityApproach, ProfileApproval, and CryptoInterest components
- **Translation Hook Integration**: Added useTranslation hooks to all onboarding components for dynamic language switching
- **LSP Error Resolution**: Fixed commonStyles import errors across multiple components by removing non-existent imports
- **Hardcoded Text Elimination**: Replaced all Portuguese hardcoded texts with proper translation keys throughout the onboarding flow
- **Extended Translation Files**: Added complete translation sections for all onboarding steps in Portuguese (BR), English (US), and Spanish (ES)
- **Native-Quality Translations**: Implemented professional translations covering titles, subtitles, option labels, descriptions, button texts, status messages, and technical specifications
- **Profile Stats Translation**: Added translation keys for tech interest, crypto level, risk openness, and mining potential indicators
- **Technical Specifications**: Translated Ghost Core specs, security features, and wallet analysis data
- **User Interaction Messages**: Fixed "Select an option to continue" messages across all quiz components with proper translation keys
- **Complete Language Coverage**: Ensured 100% interface translation coverage with zero Portuguese text leakage when other languages are selected
- **Consistent Translation Keys**: Structured translation files with logical hierarchy and consistent naming conventions
- **Zero Visual Movement**: Maintained stable layout during language switching to prevent UI trembling
- **GhostTest Component Internationalization**: Applied complete translation coverage to the GhostTest analysis component including all phases, metrics, labels, and status messages
- **Critical Translation Fix**: Resolved the issue where GhostTest component remained in Portuguese regardless of language selection - now properly translates across all supported languages

### 29/07/2025 - Complete Ghost Theme Integration Across Core Application
- **Full Application Suite**: Applied Ghost theme to Login, Register, Plan Selection, Welcome Screen, BlockchainSelector, UserLayout, Dashboard, TrendingBlockchain, BaseChart, and Mining components
- **Unified Dark Background**: #0d0a14 background with Ghost radial gradients across all core components
- **Consistent Visual Identity**: Ghost primary/secondary gradients (#7B68EE, #9370DB) for all titles and buttons
- **Enhanced Input Styling**: Ghost-themed input fields with purple focus states and backdrop blur effects
- **Professional Button Design**: Gradient buttons with Ghost brand styling and hover animations
- **Floating Animations**: Ghost-themed background animations matching onboarding experience
- **Mining Component Theme**: Complete Ghost styling applied to mining interface with themed cards, buttons, titles, stat cards, performance containers, and all interactive elements
- **MiningPrepPopup Theme**: Complete Ghost styling applied to mining preparation popup with themed containers, progress bars, and status indicators
- **Turbo Button Theme**: Complete Ghost styling applied to Turbo activation button while preserving all functionality
- **UpgradePopup Theme**: Complete Ghost styling applied to Turbo upgrade modal with themed backgrounds, gradients, and buttons
- **Withdrawal Modal Theme**: Complete Ghost styling applied to withdrawal component with themed inputs, buttons, and containers
- **Referrals Component Theme**: Complete Ghost styling applied to referrals page with themed cards, buttons, tabs, and stat containers
- **UserLayout Theme**: Complete Ghost styling applied to main layout with themed navigation and floating effects
- **Enhanced Background Effects**: Advanced Ghost background with multiple gradient layers and conic gradients
- **Settings Component Theme**: Complete Ghost styling applied to settings page with themed forms, switches, and cards
- **Plan Selection Modal Enhancement**: Complete popup behavior with z-99999, darkened background overlay (rgba(0,0,0,0.85)), backdrop blur, enhanced shadows and smooth animations for proper modal display above all page elements
- **BaseChart Theme**: Complete Ghost styling applied to price charts with themed titles, prices, and volume indicators
- **TrendingBlockchain Theme**: Complete Ghost styling applied to trending blockchain card with themed progress bars and hover effects
- **Dashboard Theme**: Complete Ghost styling applied to dashboard with themed stat cards, progress bars, and status sections
- **BlockchainSelector Theme**: Complete Ghost styling applied to blockchain selection with themed cards and status indicators
- **Welcome Screen Theme**: Complete Ghost styling applied to welcome screen with gradient titles and buttons
- **Register Component Theme**: Complete Ghost styling applied to registration form while preserving layout
- **Login Component Theme**: Consistent Ghost styling applied to login form maintaining structure
- **Plan Selection Modal**: Complete Ghost theme applied to entire PlanSelectionPopup component
- **Interactive Elements**: Ghost-styled close buttons, blockchain badges, and navigation elements
- **Stat Cards Enhancement**: Redesigned dashboard stat cards with Ghost theme, hover effects, and improved typography
- **Progress Indicators**: Ghost-themed progress bars with gradient fills and improved visual feedback
- **Button Improvements**: Enhanced "Começar a Minerar" and "Verificar" buttons with shimmer effects and hover animations
- **Navigation Enhancement**: Top and bottom navigation bars with Ghost theme consistency
- **Price Update**: Changed Plano Start price to R$ 49.90 for better market positioning
- **UI Cleanup**: Removed back button from onboarding flow for cleaner user experience
- **Layout Preservation**: Maintained existing structure while improving visual consistency across all components

### 27/07/2025 - TURBO MODE Implementation + Advanced License Features
- **TURBO MODE ACTIVATED**: Implemented PPPBAHKJ product code support for turbo mode activation
- **4-Tier License Verification**: Added turbo mode as 4th verification alongside existing blockchain access
- **Visual Turbo Indicators**: Created TurboModeIndicator components with animated UI elements
- **Enhanced License Hook**: Updated useLicenseVerification to include turboModeEnabled state
- **Unified License System**: LicenseRequired component now uses same verification logic as BlockchainSelector
- **Advanced Caching**: Turbo mode status cached with blockchain permissions for optimal performance
- **Real-time Verification**: Turbo mode verified against external signature server (PPPBAHKJ)
- **UI Integration**: Turbo mode banner displayed prominently when active in BlockchainSelector
- **Zero-Access Security**: Maintained strict no-blockchain-access policy without valid licenses
- **Production-Ready Turbo**: Complete turbo mode system ready for live user activation

### 24/07/2025 - Production-Ready License Verification System + ENTERPRISE Support
- **Complete License System Overhaul**: Fixed endpoint issues and implemented production-ready license verification
- **Real API Integration**: Connected to actual external license API using verify_license.php endpoint
- **3-Tier License System**: PPPBC295 (Enterprise), PPPBC293 (Premium), PPPBC229 (Basic) with proper priority handling
- **ENTERPRISE License Active**: PPPBC295 now properly configured to unlock ALL 6 blockchains (Solana, Bitcoin, Ethereum, BSC, Cardano, Polkadot)
- **Hierarchical Priority System**: ENTERPRISE (all chains) > PREMIUM (Sol/BTC/ETH) > BASIC (Solana only)
- **Robust Error Handling**: Implemented retry mechanism, timeout controls, and comprehensive error states
- **Production Caching**: 5-minute intelligent cache system with automatic cleanup and force refresh capability
- **Network Resilience**: Automatic retries with exponential backoff for network failures
- **Email Validation**: Proper email format validation and sanitization
- **Admin Endpoints**: Cache management and statistics endpoints for production monitoring
- **Debug Tools**: Added debug endpoint for direct license testing
- **Performance Optimization**: Parallel license checks with proper timeout handling
- **Commercial Viability**: System now ready for real users with full ENTERPRISE support