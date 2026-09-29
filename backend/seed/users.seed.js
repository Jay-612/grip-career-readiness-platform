import bcrypt from 'bcryptjs';
import User from '../model/User.js';

export const DEV_DEFAULT_PASSWORD = 'Password123!';

/**
 * Seeds development users across all supported roles with deterministic hashed passwords.
 * Returns a dictionary containing keyed arrays of created users.
 */
export async function seedUsers() {
  console.log('👤 Seeding Development Users...');

  // Hash development password using same bcrypt salt rounds (10) as authController
  const hashedPassword = await bcrypt.hash(DEV_DEFAULT_PASSWORD, 10);

  const rawUsers = [
    // 8 Students
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      password: hashedPassword,
      role: 'student',
    },
    {
      name: 'Diya Patel',
      email: 'diya.patel@campus.edu',
      password: hashedPassword,
      role: 'student',
    },
    {
      name: 'Rohan Gupta',
      email: 'rohan.gupta@campus.edu',
      password: hashedPassword,
      role: 'student',
    },
    {
      name: 'Ananya Reddy',
      email: 'ananya.reddy@campus.edu',
      password: hashedPassword,
      role: 'student',
    },
    {
      name: 'Kabir Verma',
      email: 'kabir.verma@campus.edu',
      password: hashedPassword,
      role: 'student',
    },
    {
      name: 'Ishaan Nair',
      email: 'ishaan.nair@campus.edu',
      password: hashedPassword,
      role: 'student',
    },
    {
      name: 'Meera Joshi',
      email: 'meera.joshi@campus.edu',
      password: hashedPassword,
      role: 'student',
    },
    {
      name: 'Tanvi Deshmukh',
      email: 'tanvi.deshmukh@campus.edu',
      password: hashedPassword,
      role: 'student',
    },

    // 3 Faculty (Dr. Rajesh Kumar is HOD)
    {
      name: 'Dr. Rajesh Kumar',
      email: 'dr.rajesh.kumar@campus.edu',
      password: hashedPassword,
      role: 'faculty',
    },
    {
      name: 'Prof. Neha Sharma',
      email: 'prof.neha.sharma@campus.edu',
      password: hashedPassword,
      role: 'faculty',
    },
    {
      name: 'Dr. Arun Pandey',
      email: 'dr.arun.pandey@campus.edu',
      password: hashedPassword,
      role: 'faculty',
    },

    // 2 Alumni Mentors
    {
      name: 'Vikram Aditya',
      email: 'vikram.aditya@alumni.edu',
      password: hashedPassword,
      role: 'alumni',
    },
    {
      name: 'Priya Nambiar',
      email: 'priya.nambiar@alumni.edu',
      password: hashedPassword,
      role: 'alumni',
    },

    // 2 Corporate Campus Recruiters
    {
      name: 'Alex Rivera',
      email: 'alex.rivera@techcorp.com',
      password: hashedPassword,
      role: 'recruiter',
    },
    {
      name: 'Sarah Chen',
      email: 'sarah.chen@fintechapex.com',
      password: hashedPassword,
      role: 'recruiter',
    },

    // 1 Administrator
    {
      name: 'Campus Administrator',
      email: 'admin@campus.edu',
      password: hashedPassword,
      role: 'admin',
    },
  ];

  const createdUsers = await User.insertMany(rawUsers);
  console.log(`   ✓ Created ${createdUsers.length} Users`);

  // Build a lookup map by email for easy relationship linking
  const usersByEmail = {};
  createdUsers.forEach((u) => {
    usersByEmail[u.email] = u;
  });

  const students = createdUsers.filter((u) => u.role === 'student');
  const faculty = createdUsers.filter((u) => u.role === 'faculty');
  const alumni = createdUsers.filter((u) => u.role === 'alumni');
  const recruiters = createdUsers.filter((u) => u.role === 'recruiter');
  const admin = createdUsers.find((u) => u.role === 'admin');

  return {
    all: createdUsers,
    byEmail: usersByEmail,
    students,
    faculty,
    alumni,
    recruiters,
    admin,
  };
}
