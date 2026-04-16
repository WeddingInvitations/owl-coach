# 🦉 Owl Coach - SaaS Training Platform

A complete SaaS training platform built with Next.js, TypeScript, Firebase, and Tailwind CSS. Similar to Coursera but focused on training plans with locked content and role-based access control.

## 🚀 Features

### Core Platform Features
- **User Authentication** - Firebase Auth with role-based access (Owner/Coach/User)
- **Training Plans** - Individual courses with modules and exercises
- **Plan Groups** - Bundled packages with discounted pricing
- **Purchase System** - Individual and group purchase workflows
- **Access Control** - Content locked until purchased
- **Role Management** - Owner, Coach, and User roles with different permissions
- **Admin Panel** - Complete platform management for owners
- **Coach Dashboard** - Content creation and management for coaches
- **User Library** - Personal collection of purchased content

### Technical Features
- **Next.js 14** with App Router and TypeScript
- **Firebase** Authentication and Firestore database
- **Tailwind CSS** with custom design system
- **Zod** validation schemas
- **Clean Architecture** with Repository pattern
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - Live data synchronization
- **Security Rules** - Firestore security rules for data protection

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** 18+ installed
- **Firebase** project created
- **Firebase CLI** installed (`npm install -g firebase-tools`)
- **Git** for version control

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd owl-coach
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication and Firestore Database

#### Configure Environment Variables
Create `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Stripe Configuration

**📘 [Ver guía detallada de configuración de Stripe →](./STRIPE_SETUP.md)**

#### Resumen rápido:

1. **Crea cuenta en Stripe** (gratis): https://dashboard.stripe.com/register
2. **Obtén tus API keys** (modo TEST): https://dashboard.stripe.com/test/apikeys
3. **Actualiza `.env.local`** con tus keys:

```env
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Para desarrollo local, instala Stripe CLI y ejecuta:**

```powershell
stripe login
stripe listen --forward-to localhost:3000/api/billing/webhook
```

Copia el webhook secret que te muestra al `.env.local` como `STRIPE_WEBHOOK_SECRET`.

**Para instrucciones completas paso a paso, consulta [STRIPE_SETUP.md](./STRIPE_SETUP.md)**

### 5. Database Setup

#### Initialize Firebase
```bash
firebase login
firebase init
```

Select:
- Firestore Database
- Hosting
- Storage (optional)

#### Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

#### Seed Sample Data
```bash
npm run seed
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Firebase Emulator (Optional)
For local development with Firebase emulators:
```bash
firebase emulators:start
```

## 📁 Project Structure

```
owl-coach/
├── public/                 # Static files
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── api/           # API routes
│   │   ├── app/           # Protected app pages
│   │   │   ├── admin/     # Admin panel
│   │   │   ├── dashboard/ # User dashboard
│   │   │   ├── plans/     # Training plans
│   │   │   ├── groups/    # Plan groups
│   │   │   └── library/   # User library
│   │   ├── login/         # Authentication pages
│   │   └── register/
│   ├── components/        # Reusable UI components
│   │   └── ui/           # Base UI components
│   ├── lib/              # Utility functions
│   ├── server/           # Server-side logic
│   │   ├── repositories/ # Data access layer
│   │   └── services/     # Business logic layer
│   └── types/            # TypeScript type definitions
├── scripts/              # Database seeding scripts
├── firestore.rules       # Firestore security rules
└── firebase.json         # Firebase configuration
```

## 👤 User Roles & Permissions

### Owner
- Full platform access
- User management (promote/demote roles)
- Content management (create/edit/delete plans & groups)
- Purchase and analytics overview
- Admin panel access

### Coach
- Content creation (create/edit training plans)
- Content management (own content only)
- User library viewing
- Limited admin access

### User
- Browse available content
- Purchase plans and groups
- Access purchased content
- Personal library management

## Redirected to Stripe Checkout (hosted payment page)
4. Completes payment with card details
5. Stripe processes payment and sends webhook
6. Backend creates Purchase and UserEntitlement records
7. User redirected back to plan page with success message
8. Content immediately available in user's library
9. User registers with email/password
2. Account created with 'user' role
3. Redirected to dashboard with available content
4. Can browse and purchase training plans

### Content Purchase Flow
1. User browses training plans or groups
2. Clicks "Purchase" on desired content
3. Mock payment process (simulated for MVP)
4. Entitlement created automatically
5. Content appears in user's library
6. User can access all modules and exercises

### Content Access
1. User navigates to library
2. Sees all purchased content
3. Clicks on training plan
4. Access to all modules and exercises
5. Progress tracking (planned feature)

## 🔧 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Training Plans
- `GET /api/pbilling/create-checkout-session` - Create Stripe checkout session
- `POST /api/billing/webhook` - Stripe webhook handler (Stripe calls this)
- `POST /api/purchases` - Create purchase (legacy/internal)
- `POST /api/plans` - Create plan (Coach/Owner only)
- `GET /api/plans/[id]` - Get specific plan
- `PUT /api/plans/[id]` - Update plan (Coach/Owner only)
- `DELETE /api/plans/[id]` - Delete plan (Coach/Owner only)

### Plan Groups
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create group (Coach/Owner only)
- `GET /api/groups/[id]` - Get specific group
- `PUT /api/groups/[id]` - Update group (Coach/Owner only)
- `DELETE /api/groups/[id]` - Delete group (Coach/Owner only)

### Purchases & Access
- `POST /api/purchases` - Create purchase
- `GET /api/purchases` - List user purchases
- `GET /api/entitlements` - List user entitlements
- `GET /api/library` - User's purchased content

### Admin
- `GET /api/admin/users` - List all users (Owner only)
- `PUT /api/admin/users` - Update user role (Owner only)

## 🗄️ Database Schema

### Users Collection
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'coach' | 'user';
  createdAt: string;
}
```

### Training Plans Collection
```typescript
{
  id: string;
  title: string;
  description: string;
  level: 'principiante' | 'intermedio' | 'avanzado';
  price: number;
  imageUrl?: string;
  tags: string[];
  modules: TrainingModule[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

##productType: 'plan' | 'group';
  productId: string;
  amount: number;
  currency: 'EUR' | 'USD';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentProvider: 'simulated' | 'stripe' | 'paypal';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
}
```

### UserEntitlements Collection
```typescript
{
  id: string;
  userId: string;
  productType: 'plan' | 'group';
  productId: string;
  unlockedPlanIds: string[];
  sourcePurchaseId: string;
  createdAt: Date
  userId: string;
  trainingPlanId: string;
  grantedAt: string;
  source: 'purchase' | 'admin';
  sourceId: string;
}
```

## 🔐 Security

### Firestore Rules
The application includes comprehensive Firestore security rules that:
- Restrict access based on user authentication
- Enforce role-based permissions
- Prevent unauthorized data access
- Maintain audit trails for purchases

### Authentication
- Firebase Authentication handles user sessions
- JWT tokens for API authentication
- Role-based access control throughout the app
- Secure logout and session management

## 🎨 Design System

### Colors
- **Primary**: Blue tones for main actions
- **Secondary**: Gray tones for secondary elements
- **Success**: Green for positive actions
- **Warning**: Yellow for cautions
- **Error**: Red for errors

### Components
All UI components are built with:
- **Consistent styling** using Tailwind CSS
- **Accessibility** considerations
- **Responsive design** principles
- **Reusable patterns** for maintainability

## 🧪 Testing

### Test Accounts
The seed script creates test accounts:

**Owner Account**
- Email: `admin@owlcoach.com`
- Password: Set during registration
- Access: Full platform administration

**Coach Account**
- Email: `coach@owlcoach.com`
- Password: Set during registration
- Access: Content creation and management

**User Account**
- Email: `user@owlcoach.com`
- Password: Set during registration
- Access: Standard user features

### Sample Data
The seed script includes:
- 4 sample users with different roles
- 4 training plans with various difficulty levels
- 2 plan groups (bundles)
- Sample purchases and entitlements
- Realistic content with exercises and modules

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy to your preferred hosting service
3. Ensure environment variables are configured
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`

## 📝 Development Notes

### Code Architecture
- **Repository Pattern** for data access abstraction
- **Service Layer** for business logic
- **Clean separation** of concerns
- **TypeScript** for type safety throughout

##Subscription-based pricing with Stripe Billing
- Multiple payment methods (PayPal, Apple Pay, Google Pay)
- Progress tracking for users
- Video streaming integration
- Mobile app development
- Advanced analytics dashboard
- Email notifications
- Course completion certificates
- Affiliate program
- Gift cards and promotion
- Payment integration (Stripe/PayPal)
- Progress tracking for users
- Video streaming integration
- Mobile app development
- Advanced analytics dashboard
- Email notifications
- Course completion certificates

## 📞 Support & Contributing

### Getting Help
- Check the documentation above
- Review the code comments
- Test with the provided sample data
- Use Firebase emulators for local development

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is created as an MVP for a SaaS training platform. Please review and modify the license according to your needs.

---

**Built with ❤️ using Next.js, TypeScript, Firebase, and Tailwind CSS**