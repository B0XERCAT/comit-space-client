# Frontend Client Project

This document provides a quick overview of the frontend client application, including how to set it up, run it, and understand its basic file structure.

## 1. Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18.x or higher**: The project is built with Next.js, which requires a modern Node.js version.
- **npm or yarn**: Package manager for installing dependencies.

## 2. Getting Started

Follow these steps to get the frontend client up and running:

### Clone the Repository

```bash
git clone <your-repository-url>
cd comit-space-client  # Or your project's root directory name
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Run the Application (for development)

```bash
npm run dev
# or
yarn dev
```

This command starts the Next.js development server. The application will typically start on `http://localhost:3000`.

## 3. Environment Configuration

To securely manage API endpoints and external service credentials, this project uses environment variables.

### 📄 Environment Variables

Create a `.env.local` file in the root directory with the following content (replace with your own values):

```env
# API Endpoints
NEXT_PUBLIC_LOCAL_URL="https://your-backend-domain.com"
NEXT_PUBLIC_DEPLOY_URL="https://your-backend-domain.com"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_SUPABASE_REFRENCE_ID="your-project-ref"
NEXT_PUBLIC_SUPABASE_BUCKET_NAME="your-bucket-name"

# Authentication
AUTH_SECRET="your-auth-secret"
AUTH_TRUST_HOST="true"
```

### 🔒 Note:

The `.env.local` file is excluded from version control via `.gitignore`, so you must create it manually on every development or deployment machine.

## 4. Project Structure

The project follows a standard Next.js 14 application structure with the App Router. Below is a simplified overview of the key directories and their purposes:

```
.
├── .git/                      # Git version control files
├── .next/                     # Next.js build output (auto-generated)
├── .husky/                    # Git hooks configuration
├── .github/                   # GitHub workflows and configurations
├── .vscode/                   # VS Code workspace settings
├── app/                       # Next.js App Router pages and layouts
│   ├── (main)/               # Main route group
│   ├── admin/                # Admin panel routes
│   ├── api/                  # API routes
│   ├── error.tsx             # Global error page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/               # Reusable React components
│   ├── admin/               # Admin-specific components
│   ├── about/               # About page components
│   ├── clubroom/            # Clubroom reservation components
│   ├── common/              # Shared/common components
│   ├── event/               # Event management components
│   ├── main/                # Main page components
│   ├── myevent/             # My events components
│   ├── mystudy/             # My studies components
│   ├── post/                # Post board components
│   ├── study/               # Study management components
│   └── ui/                  # UI component library
├── constants/               # Application constants
│   └── apiEndpoint.ts       # API endpoint definitions
├── lib/                     # Utility libraries
│   └── supabase/            # Supabase client configuration
├── public/                  # Static assets
├── types/                   # TypeScript type definitions
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # Git ignore rules
├── .prettierrc              # Prettier configuration
├── components.json          # UI components configuration
├── database.types.ts        # Database type definitions
├── env.d.ts                 # Environment variable types
├── middleware.ts            # Next.js middleware
├── next.config.js           # Next.js configuration
├── next-env.d.ts            # Next.js type definitions
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

This structure follows Next.js 14 App Router conventions and modern React development best practices.

## 5. Key Features

The application includes the following main features:

- **Event Management**: Create, edit, and manage events with recruitment functionality
- **Study Management**: Create, edit, and manage study groups with member management
- **Post Board**: Community posts with like functionality and comments
- **Reservation System**: Clubroom reservation with staff approval workflow
- **Admin Panel**: Administrative interface for managing users, content, and system settings
- **User Authentication**: Secure authentication using NextAuth.js

## 6. Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives with custom styling
- **Authentication**: NextAuth.js
- **State Management**: React hooks and context
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React and React Icons
- **Calendar**: FullCalendar for reservation management
- **Markdown**: React MD Editor for rich text editing

## 7. Code Quality

The project uses several tools to maintain code quality:

- **ESLint**: Code linting with Next.js and TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit linting
- **TypeScript**: Static type checking
- **Import sorting**: Automatic import organization

Make sure to set up the required environment variables in your deployment platform's configuration.
