import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { User } from '../src/types/user';
import { TrainingPlan, TrainingModule, Exercise } from '../src/types/training-plan';
import { TrainingPlanGroup } from '../src/types/training-plan-group';
import { Purchase } from '../src/types/purchase';
import { Entitlement } from '../src/types/entitlement';

// Initialize Firebase Admin (you'll need to add your service account key)
// const serviceAccount = require('./path-to-your-service-account-key.json');
// initializeApp({
//   credential: cert(serviceAccount),
// });

// For development, we'll use the emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
initializeApp({ projectId: 'owl-coach' });

const db = getFirestore();

// Sample data
const sampleUsers: (User & { id: string })[] = [
  {
    id: 'owner1',
    email: 'admin@owlcoach.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'owner',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'coach1',
    email: 'coach@owlcoach.com',
    firstName: 'Jane',
    lastName: 'Coach',
    role: 'coach',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user1',
    email: 'user@owlcoach.com',
    firstName: 'John',
    lastName: 'Student',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user2',
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];

const sampleExercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Push-ups',
    description: 'Standard push-up form and technique',
    sets: 3,
    reps: '10-15',
    restTime: 60,
    instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up'],
    videoUrl: 'https://youtube.com/watch?v=example1',
  },
  {
    id: 'ex2',
    name: 'Squats',
    description: 'Proper squat form and variations',
    sets: 3,
    reps: '12-15',
    restTime: 90,
    instructions: ['Stand with feet shoulder-width apart', 'Lower into squat', 'Return to start'],
    videoUrl: 'https://youtube.com/watch?v=example2',
  },
  {
    id: 'ex3',
    name: 'Plank',
    description: 'Core strengthening plank exercise',
    sets: 3,
    reps: '30-60 seconds',
    restTime: 45,
    instructions: ['Hold plank position', 'Keep core tight', 'Maintain straight line'],
  },
  {
    id: 'ex4',
    name: 'Lunges',
    description: 'Forward and reverse lunge techniques',
    sets: 3,
    reps: '10 per leg',
    restTime: 60,
    instructions: ['Step forward into lunge', 'Lower back knee', 'Return to start'],
  },
  {
    id: 'ex5',
    name: 'Burpees',
    description: 'Full-body conditioning exercise',
    sets: 3,
    reps: '8-12',
    restTime: 120,
    instructions: ['Squat down', 'Jump back to plank', 'Jump forward', 'Jump up'],
  },
];

const sampleModules: TrainingModule[] = [
  {
    id: 'mod1',
    title: 'Upper Body Basics',
    description: 'Introduction to upper body exercises',
    exercises: [sampleExercises[0], sampleExercises[2]],
    estimatedDuration: 30,
  },
  {
    id: 'mod2',
    title: 'Lower Body Foundation',
    description: 'Essential lower body movements',
    exercises: [sampleExercises[1], sampleExercises[3]],
    estimatedDuration: 35,
  },
  {
    id: 'mod3',
    title: 'Full Body Conditioning',
    description: 'Compound movements and conditioning',
    exercises: [sampleExercises[4]],
    estimatedDuration: 25,
  },
];

const samplePlans: (TrainingPlan & { id: string })[] = [
  {
    id: 'plan1',
    title: 'Beginner Fitness Foundation',
    slug: 'beginner-fitness-foundation',
    shortDescription: 'Perfect for those starting their fitness journey',
    fullDescription: 'Perfect for those starting their fitness journey. Learn proper form and build strength gradually with guided exercises.',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    coachId: 'coach1',
    coachName: 'Jane Coach',
    difficulty: 'principiante',
    duration: 4,
    price: 29.99,
    currency: 'USD',
    isPublished: true,
    categoryIds: ['fitness', 'principiante'],
    previewModules: [sampleModules[0]],
    fullModules: [sampleModules[0], sampleModules[1]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'plan2',
    title: 'Intermediate Strength Building',
    slug: 'intermediate-strength-building',
    shortDescription: 'Take your training to the next level',
    fullDescription: 'Take your training to the next level with progressive strength building exercises and advanced techniques.',
    coverImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=300&fit=crop',
    coachId: 'coach1',
    coachName: 'Jane Coach',
    difficulty: 'intermedio',
    duration: 8,
    price: 49.99,
    currency: 'USD',
    isPublished: true,
    categoryIds: ['strength', 'intermedio'],
    previewModules: [sampleModules[1]],
    fullModules: [sampleModules[1], sampleModules[2]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'plan3',
    title: 'Advanced Athletic Performance',
    slug: 'advanced-athletic-performance',
    shortDescription: 'Elite-level training for serious athletes',
    fullDescription: 'Elite-level training for serious athletes looking to maximize performance with cutting-edge techniques.',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    coachId: 'coach1',
    coachName: 'Jane Coach',
    difficulty: 'avanzado',
    duration: 12,
    price: 79.99,
    currency: 'USD',
    isPublished: true,
    categoryIds: ['avanzado', 'performance'],
    previewModules: [sampleModules[0]],
    fullModules: [sampleModules[0], sampleModules[1], sampleModules[2]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'plan4',
    title: 'Yoga for Flexibility',
    slug: 'yoga-for-flexibility',
    shortDescription: 'Improve flexibility and mindfulness',
    fullDescription: 'Improve flexibility and mindfulness through guided yoga practices and meditation techniques.',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    coachId: 'coach1',
    coachName: 'Jane Coach',
    difficulty: 'principiante',
    duration: 6,
    price: 24.99,
    currency: 'USD',
    isPublished: true,
    categoryIds: ['yoga', 'flexibility'],
    previewModules: [sampleModules[0]],
    fullModules: [sampleModules[0]],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleGroups: (TrainingPlanGroup & { id: string })[] = [
  {
    id: 'group1',
    title: 'Complete Fitness Bundle',
    slug: 'complete-fitness-bundle',
    shortDescription: 'Everything you need for a complete fitness transformation',
    fullDescription: 'Everything you need for a complete fitness transformation. Includes beginner through advanced programs with expert guidance.',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    coachId: 'coach1',
    coachName: 'Jane Coach',
    includedPlanIds: ['plan1', 'plan2', 'plan3'],
    price: 99.99,
    currency: 'USD',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'group2',
    title: 'Beginner Starter Pack',
    slug: 'beginner-starter-pack',
    shortDescription: 'Perfect introduction to fitness',
    fullDescription: 'Perfect introduction to fitness with foundational programs designed for beginners.',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    coachId: 'coach1',
    coachName: 'Jane Coach',
    includedPlanIds: ['plan1', 'plan4'],
    price: 44.99,
    currency: 'USD',
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const samplePurchases: (Purchase & { id: string })[] = [
  {
    id: 'purchase1',
    userId: 'user1',
    productId: 'plan1',
    productType: 'plan',
    amount: 29.99,
    currency: 'USD',
    status: 'completed',
    paymentProvider: 'simulated',
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: 'purchase2',
    userId: 'user2',
    productId: 'group1',
    productType: 'group',
    amount: 99.99,
    currency: 'USD',
    status: 'completed',
    paymentProvider: 'simulated',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
  },
];

const sampleEntitlements: (Entitlement & { id: string })[] = [
  {
    id: 'entitlement1',
    userId: 'user1',
    productType: 'plan',
    productId: 'plan1',
    unlockedPlanIds: ['plan1'],
    sourcePurchaseId: 'purchase1',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'entitlement2',
    userId: 'user2',
    productType: 'group',
    productId: 'group1',
    unlockedPlanIds: ['plan1', 'plan2', 'plan3'],
    sourcePurchaseId: 'purchase2',
    createdAt: new Date(Date.now() - 172800000),
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - remove in production)
    console.log('🧹 Clearing existing data...');
    const collections = ['users', 'trainingPlans', 'trainingPlanGroups', 'purchases', 'userEntitlements'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    // Seed users
    console.log('👥 Seeding users...');
    for (const user of sampleUsers) {
      const { id, ...userData } = user;
      await db.collection('users').doc(id).set(userData);
    }

    // Seed training plans
    console.log('📚 Seeding training plans...');
    for (const plan of samplePlans) {
      const { id, ...planData } = plan;
      await db.collection('trainingPlans').doc(id).set(planData);
    }

    // Seed training plan groups
    console.log('📦 Seeding training plan groups...');
    for (const group of sampleGroups) {
      const { id, ...groupData } = group;
      await db.collection('trainingPlanGroups').doc(id).set(groupData);
    }

    // Seed purchases
    console.log('💳 Seeding purchases...');
    for (const purchase of samplePurchases) {
      const { id, ...purchaseData } = purchase;
      await db.collection('purchases').doc(id).set(purchaseData);
    }

    // Seed entitlements
    console.log('🎫 Seeding entitlements...');
    for (const entitlement of sampleEntitlements) {
      const { id, ...entitlementData } = entitlement;
      await db.collection('userEntitlements').doc(id).set(entitlementData);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`- Users: ${sampleUsers.length}`);
    console.log(`- Training Plans: ${samplePlans.length}`);
    console.log(`- Plan Groups: ${sampleGroups.length}`);
    console.log(`- Purchases: ${samplePurchases.length}`);
    console.log(`- Entitlements: ${sampleEntitlements.length}`);
    
    console.log('\n🔐 Test accounts:');
    console.log('- Owner: admin@owlcoach.com');
    console.log('- Coach: coach@owlcoach.com');
    console.log('- User: user@owlcoach.com');
    console.log('- User: sarah@example.com');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding script
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding script failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };