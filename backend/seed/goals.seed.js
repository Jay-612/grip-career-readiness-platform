import WeeklyGoal from '../model/WeeklyGoal.js';
import ActionPlan from '../model/ActionPlan.js';

/**
 * Seeds realistic development goals and remedial action plans for students.
 * Provides data variety: completed, in-progress, pending, due soon, and overdue states.
 * 
 * @param {Object} users Created users dictionary from seedUsers()
 */
export async function seedGoals(users) {
  console.log('🎯 Seeding Weekly Goals & Action Plans...');

  const now = new Date();
  const past3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const past7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const past14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const next2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const next5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const next10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

  const u = users.byEmail;

  const rawGoals = [
    // 1. Aarav Sharma (All completed goals - high achiever)
    {
      studentId: u['aarav.sharma@campus.edu']._id,
      title: 'Complete LeetCode Top 75 Graph & Tree Traversal Set',
      status: 'completed',
      dueDate: past14Days,
    },
    {
      studentId: u['aarav.sharma@campus.edu']._id,
      title: 'Implement Redis Cluster Caching Layer with TTL & LRU Eviction',
      status: 'completed',
      dueDate: past7Days,
    },
    {
      studentId: u['aarav.sharma@campus.edu']._id,
      title: 'Build Kafka Event Producer & Idempotent Consumer Pipeline in Go',
      status: 'completed',
      dueDate: past3Days,
    },
    {
      studentId: u['aarav.sharma@campus.edu']._id,
      title: 'Deploy Multi-Node Microservices on Local Minikube Cluster',
      status: 'completed',
      dueDate: past3Days,
    },

    // 2. Diya Patel (Mix of completed, in-progress, and due soon)
    {
      studentId: u['diya.patel@campus.edu']._id,
      title: 'Build Responsive React Dashboard with Tailwind & Custom Hooks',
      status: 'completed',
      dueDate: past7Days,
    },
    {
      studentId: u['diya.patel@campus.edu']._id,
      title: 'Develop RESTful Express API with JWT Authentication & Refresh Tokens',
      status: 'in-progress',
      dueDate: next2Days, // Due soon!
    },
    {
      studentId: u['diya.patel@campus.edu']._id,
      title: 'Design PostgreSQL Schema with Relational Indexes & Migration Scripts',
      status: 'in-progress',
      dueDate: next5Days,
    },
    {
      studentId: u['diya.patel@campus.edu']._id,
      title: 'Implement End-to-End Test Suite with Cypress and Jest RTL',
      status: 'pending',
      dueDate: next10Days,
    },

    // 3. Rohan Gupta (Completed & Active)
    {
      studentId: u['rohan.gupta@campus.edu']._id,
      title: 'Dockerize Go Backend Service with Multi-Stage Dockerfile',
      status: 'completed',
      dueDate: past14Days,
    },
    {
      studentId: u['rohan.gupta@campus.edu']._id,
      title: 'Benchmark API Throughput under 10k RPS with k6 Load Testing',
      status: 'completed',
      dueDate: past7Days,
    },
    {
      studentId: u['rohan.gupta@campus.edu']._id,
      title: 'Configure Prometheus Metrics Exporter & Grafana Alert Rules',
      status: 'in-progress',
      dueDate: next5Days,
    },

    // 4. Ananya Reddy (Active Product Sprints)
    {
      studentId: u['ananya.reddy@campus.edu']._id,
      title: 'Implement GraphQL Apollo Client Queries and Optimistic Updates',
      status: 'completed',
      dueDate: past7Days,
    },
    {
      studentId: u['ananya.reddy@campus.edu']._id,
      title: 'Refactor Context State to Zustand Store with Local Storage Sync',
      status: 'in-progress',
      dueDate: next2Days,
    },
    {
      studentId: u['ananya.reddy@campus.edu']._id,
      title: 'Conduct Lighthouse CWV Audit: Achieve 90+ Performance Score',
      status: 'pending',
      dueDate: next10Days,
    },

    // 5. Kabir Verma (Early semester beginner goals)
    {
      studentId: u['kabir.verma@campus.edu']._id,
      title: 'Complete Linux CLI Scripting & Bash Automation Labs',
      status: 'completed',
      dueDate: past7Days,
    },
    {
      studentId: u['kabir.verma@campus.edu']._id,
      title: 'Setup GitHub Actions CI Workflow for Automated Unit Testing',
      status: 'pending',
      dueDate: next5Days,
    },

    // 6. Ishaan Nair (Overdue goals testing overdue state)
    {
      studentId: u['ishaan.nair@campus.edu']._id,
      title: 'Train ResNet-18 Image Classifier on PyTorch with Data Augmentation',
      status: 'in-progress',
      dueDate: past3Days, // Overdue!
    },
    {
      studentId: u['ishaan.nair@campus.edu']._id,
      title: 'Deploy FastAPI ML Inference Endpoint with Docker & Gunicorn',
      status: 'pending',
      dueDate: past7Days, // Overdue!
    },

    // 7. Meera Joshi -> INTENTIONALLY 0 GOALS to test empty states!

    // 8. Tanvi Deshmukh (High achiever - Tier 1 readiness)
    {
      studentId: u['tanvi.deshmukh@campus.edu']._id,
      title: 'Write Technical Architecture RFC for Raft Distributed Consensus',
      status: 'completed',
      dueDate: past14Days,
    },
    {
      studentId: u['tanvi.deshmukh@campus.edu']._id,
      title: 'Implement Distributed Rate Limiter using Redis Token Bucket Algorithm',
      status: 'completed',
      dueDate: past7Days,
    },
    {
      studentId: u['tanvi.deshmukh@campus.edu']._id,
      title: 'Lead System Design Whiteboard Session on Distributed Job Scheduler',
      status: 'completed',
      dueDate: past3Days,
    },
  ];

  const createdGoals = await WeeklyGoal.insertMany(rawGoals);
  console.log(`   ✓ Created ${createdGoals.length} Weekly Goals across diverse status states`);

  // Action Plans (Remedial recommendations for identified skill gaps)
  const rawActionPlans = [
    {
      studentId: u['diya.patel@campus.edu']._id,
      weakSkill: 'Relational Database Indexing',
      recommendedTask: 'Study B-Tree structure, composite indexes, and run EXPLAIN ANALYZE on query plans.',
    },
    {
      studentId: u['ishaan.nair@campus.edu']._id,
      weakSkill: 'Docker Container Optimization',
      recommendedTask: 'Implement multi-stage Docker builds to reduce PyTorch container image size from 4GB to <800MB.',
    },
    {
      studentId: u['kabir.verma@campus.edu']._id,
      weakSkill: 'Terraform State Management',
      recommendedTask: 'Provision an S3 bucket with DynamoDB state locking and practice remote backend migration.',
    },
    {
      studentId: u['ananya.reddy@campus.edu']._id,
      weakSkill: 'Web Core Vitals (INP)',
      recommendedTask: 'Profile component render cycles using React DevTools and wrap expensive event callbacks in startTransition.',
    },
  ];

  const createdActionPlans = await ActionPlan.insertMany(rawActionPlans);
  console.log(`   ✓ Created ${createdActionPlans.length} Action Plans`);

  return {
    goals: createdGoals,
    actionPlans: createdActionPlans,
  };
}
