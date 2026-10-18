import mongoose from 'mongoose';
import CareerRoadmap from '../model/CareerRoadmap.js';
import SemesterPlan from '../model/SemesterPlan.js';
import Company from '../model/Company.js';
import User from '../model/User.js';
import FacultyProfile from '../model/FacultyProfile.js';
import AlumniProfile from '../model/AlumniProfile.js';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/grip_db';

async function seedCareerData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for Career Data Seeding...');

    // 1. Seed Career Roadmaps
    const roadmapsData = [
      {
        careerName: 'Distributed Systems & Cloud Backend Engineer',
        description: 'High-concurrency platforms, microservices & scalable cloud infrastructure.',
        requiredSkills: ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'Microservices', 'System Design', 'Go', 'AWS'],
        semesters: [
          {
            semesterNumber: 3,
            subjects: ['Core CS & Problem Solving', 'LeetCode DSA Mastered', 'Bit Manipulation', 'Graph Theory'],
          },
          {
            semesterNumber: 4,
            subjects: ['Web Architecture & DBs', 'Relational Schema Design', 'B-Tree Indexes', 'NoSQL Replication'],
          },
          {
            semesterNumber: 5,
            subjects: ['Distributed Caching & Event Architectures', 'Redis Caching Clusters', 'Apache Kafka Pub/Sub', 'gRPC Microservices'],
          },
          {
            semesterNumber: 6,
            subjects: ['Capstone & Fault Tolerance', 'Chaos Engineering', 'Load Testing (k6)', 'Raft Consensus Engine'],
          },
          {
            semesterNumber: 7,
            subjects: ['Campus Drives & Internships', 'Day 1 Mock Screens', 'System Design Whiteboard', 'Corporate Onboarding'],
          },
          {
            semesterNumber: 8,
            subjects: ['Full-Time Conversion', 'Advanced Systems Electives', 'Enterprise Placement'],
          },
        ],
      },
      {
        careerName: 'Full-Stack Product Engineering',
        description: 'End-to-end product delivery, responsive frontend frameworks & API services.',
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'PostgreSQL', 'System Optimization', 'REST APIs'],
        semesters: [
          {
            semesterNumber: 3,
            subjects: ['UI Fundamentals & Modern JavaScript', 'CSS Architecture', 'DOM Optimization'],
          },
          {
            semesterNumber: 4,
            subjects: ['Full-Stack Frameworks', 'React Architecture', 'Node.js Express APIs', 'SQL Modeling'],
          },
          {
            semesterNumber: 5,
            subjects: ['Production Web Apps', 'GraphQL Federation', 'Next.js SSR', 'State Management'],
          },
          {
            semesterNumber: 6,
            subjects: ['Product Capstone', 'Micro-frontends', 'CI/CD Pipelines', 'Performance Audits'],
          },
          {
            semesterNumber: 7,
            subjects: ['Campus Recruitment Drives', 'Product Engineering Interviews', 'Take-Home Assignments'],
          },
          {
            semesterNumber: 8,
            subjects: ['Graduation & Corporate Transition'],
          },
        ],
      },
      {
        careerName: 'DevOps & Site Reliability Engineer',
        description: 'Infrastructure automation, production resilience, CI/CD and telemetry pipelines.',
        requiredSkills: ['Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Linux', 'Prometheus', 'AWS'],
        semesters: [
          {
            semesterNumber: 3,
            subjects: ['Linux Operating Systems', 'Shell Scripting', 'TCP/IP Networking'],
          },
          {
            semesterNumber: 4,
            subjects: ['Container Fundamentals', 'Docker Engine', 'CI/CD with GitHub Actions', 'Python Automation'],
          },
          {
            semesterNumber: 5,
            subjects: ['Cloud Infrastructure', 'Terraform IaC', 'AWS Architecture', 'Prometheus & Grafana'],
          },
          {
            semesterNumber: 6,
            subjects: ['Kubernetes Cluster Orchestration', 'Service Mesh (Istio)', 'Chaos Engineering', 'SRE Practices'],
          },
          {
            semesterNumber: 7,
            subjects: ['Placement Drives & Infrastructure Interviews', 'Live Incident Simulation'],
          },
          {
            semesterNumber: 8,
            subjects: ['Corporate Onboarding & Cloud Deployment'],
          },
        ],
      },
    ];

    for (const rData of roadmapsData) {
      let existing = await CareerRoadmap.findOne({
        careerName: { $regex: new RegExp(`^${rData.careerName}$`, 'i') },
      });

      if (!existing) {
        existing = await CareerRoadmap.create({
          careerName: rData.careerName,
          description: rData.description,
          requiredSkills: rData.requiredSkills,
        });
        console.log(`Created roadmap: ${rData.careerName}`);
      }

      // Seed or update semester plans
      for (const sem of rData.semesters) {
        const semExists = await SemesterPlan.findOne({
          roadmapId: existing._id,
          semesterNumber: sem.semesterNumber,
        });

        if (!semExists) {
          await SemesterPlan.create({
            roadmapId: existing._id,
            semesterNumber: sem.semesterNumber,
            subjects: sem.subjects,
          });
          console.log(`  - Added Sem ${sem.semesterNumber} for ${rData.careerName}`);
        }
      }
    }

    // 2. Seed Target Hiring Partner Companies
    const companies = [
      {
        companyName: 'TechCorp',
        minimumMatchScore: 70,
        requiredSkills: ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'Microservices', 'System Design'],
      },
      {
        companyName: 'FinTech Apex',
        minimumMatchScore: 65,
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'PostgreSQL', 'System Optimization'],
      },
      {
        companyName: 'CloudSys',
        minimumMatchScore: 60,
        requiredSkills: ['Kubernetes', 'Terraform', 'Docker', 'Linux', 'AWS', 'CI/CD'],
      },
      {
        companyName: 'ScaleScale',
        minimumMatchScore: 75,
        requiredSkills: ['Distributed Systems', 'Go', 'Kafka', 'Redis', 'Microservices', 'System Design'],
      },
    ];

    for (const comp of companies) {
      const existingComp = await Company.findOne({ companyName: comp.companyName });
      if (!existingComp) {
        await Company.create(comp);
        console.log(`Created company: ${comp.companyName}`);
      }
    }

    // 3. Seed Faculty and Alumni Mentors
    let facultyUser = await User.findOne({ email: 'neha.sharma@campus.edu' });
    if (!facultyUser) {
      facultyUser = await User.create({
        name: 'Prof. Neha Sharma',
        email: 'neha.sharma@campus.edu',
        password: '$2a$10$YourHashedPasswordHereOrTest123',
        role: 'faculty',
      });
      console.log('Created User: Prof. Neha Sharma');
    }

    let facultyProf = await FacultyProfile.findOne({ facultyId: facultyUser._id });
    if (!facultyProf) {
      await FacultyProfile.create({
        facultyId: facultyUser._id,
        employeeId: 'FAC-CSE-004',
        department: 'Computer Science & Engineering',
      });
      console.log('Created FacultyProfile for Prof. Neha Sharma');
    }

    let alumniUser = await User.findOne({ email: 'amit.verma@alumni.campus.edu' });
    if (!alumniUser) {
      alumniUser = await User.create({
        name: 'Amit Verma',
        email: 'amit.verma@alumni.campus.edu',
        password: '$2a$10$YourHashedPasswordHereOrTest123',
        role: 'alumni',
      });
      console.log('Created User: Amit Verma');
    }

    let alumniProf = await AlumniProfile.findOne({ alumniId: alumniUser._id });
    if (!alumniProf) {
      await AlumniProfile.create({
        alumniId: alumniUser._id,
        currentCompany: 'TechCorp',
        jobRole: 'Staff SWE, TechCorp • CSE Alumni \'21',
        graduationYear: 2021,
      });
      console.log('Created AlumniProfile for Amit Verma');
    }

    console.log('✅ Career data seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding career data:', err);
    process.exit(1);
  }
}

seedCareerData();
