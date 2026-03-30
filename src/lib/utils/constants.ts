export const DIFFICULTIES = {
  BEGINNER: 'principiante',
  INTERMEDIATE: 'intermedio',  
  ADVANCED: 'avanzado',
} as const;

export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
} as const;

export const PURCHASE_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const PRODUCT_TYPES = {
  PLAN: 'plan',
  GROUP: 'group',
} as const;

export const PAYMENT_PROVIDERS = {
  SIMULATED: 'simulated',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
} as const;

export const USER_ROLES = {
  OWNER: 'owner',
  COACH: 'coach',
  USER: 'user',
} as const;

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  TRAINING_PLANS: 'trainingPlans',
  TRAINING_PLAN_GROUPS: 'trainingPlanGroups',
  PURCHASES: 'purchases',
  USER_ENTITLEMENTS: 'userEntitlements',
  CATEGORIES: 'categories',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/app/dashboard',
  PLANS: '/app/plans',
  GROUPS: '/app/groups',
  MY_LIBRARY: '/app/my-library',
  ADMIN: '/app/admin',
  COACH: '/app/coach',
} as const;

export const API_ROUTES = {
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
  PLANS: '/api/plans',
  GROUPS: '/api/groups',
  PURCHASES: '/api/purchases',
  ENTITLEMENTS: '/api/entitlements',
  USERS: '/api/users',
} as const;