import StudentProfile from '../model/StudentProfile.js';
import FacultyProfile from '../model/FacultyProfile.js';
import AlumniProfile from '../model/AlumniProfile.js';
import RecruiterProfile from '../model/RecruiterProfile.js';

/**
 * Seeds role-specific profiles for Students, Faculty, Alumni, and Recruiters.
 * 
 * @param {Object} users Created users dictionary from seedUsers()
 */
export async function seedProfiles(users) {
  console.log('📋 Seeding Role-Specific Profiles...');

  // 1. Student Profiles (with varied semesters & careers, including an unconfigured profile)
  const studentProfilesData = [
    {
      studentId: users.byEmail['aarav.sharma@campus.edu']._id,
      semester: 6,
      selectedCareer: 'Distributed Systems & Cloud Backend Engineer',
      readinessScore: 88, // Initial, will be refined by syncReadiness
    },
    {
      studentId: users.byEmail['diya.patel@campus.edu']._id,
      semester: 5,
      selectedCareer: 'Full-Stack Product Engineering',
      readinessScore: 68,
    },
    {
      studentId: users.byEmail['rohan.gupta@campus.edu']._id,
      semester: 6,
      selectedCareer: 'Distributed Systems & Cloud Backend Engineer',
      readinessScore: 78,
    },
    {
      studentId: users.byEmail['ananya.reddy@campus.edu']._id,
      semester: 5,
      selectedCareer: 'Full-Stack Product Engineering',
      readinessScore: 62,
    },
    {
      studentId: users.byEmail['kabir.verma@campus.edu']._id,
      semester: 3,
      selectedCareer: 'DevOps & Cloud Infrastructure Specialist',
      readinessScore: 45,
    },
    {
      studentId: users.byEmail['ishaan.nair@campus.edu']._id,
      semester: 6,
      selectedCareer: 'AI & Data Systems Engineer',
      readinessScore: 52,
    },
    {
      studentId: users.byEmail['meera.joshi@campus.edu']._id,
      semester: 4,
      selectedCareer: '', // Testing incomplete profile / unselected roadmap state
      readinessScore: 0,
    },
    {
      studentId: users.byEmail['tanvi.deshmukh@campus.edu']._id,
      semester: 7,
      selectedCareer: 'Distributed Systems & Cloud Backend Engineer',
      readinessScore: 94,
    },
  ];

  const createdStudentProfiles = await StudentProfile.insertMany(studentProfilesData);
  console.log(`   ✓ Created ${createdStudentProfiles.length} Student Profiles`);

  // 2. Faculty Profiles (Dr. Rajesh Kumar is marked isHOD: true)
  const facultyProfilesData = [
    {
      facultyId: users.byEmail['dr.rajesh.kumar@campus.edu']._id,
      employeeId: 'FAC-CSE-001',
      department: 'Computer Science & Engineering',
      isHOD: true, // Official HOD identifier
    },
    {
      facultyId: users.byEmail['prof.neha.sharma@campus.edu']._id,
      employeeId: 'FAC-CSE-002',
      department: 'Computer Science & Engineering',
      isHOD: false,
    },
    {
      facultyId: users.byEmail['dr.arun.pandey@campus.edu']._id,
      employeeId: 'FAC-IT-003',
      department: 'Information Technology',
      isHOD: false,
    },
  ];

  const createdFacultyProfiles = await FacultyProfile.insertMany(facultyProfilesData);
  console.log(`   ✓ Created ${createdFacultyProfiles.length} Faculty Profiles (including HOD)`);

  // 3. Alumni Profiles
  const alumniProfilesData = [
    {
      alumniId: users.byEmail['vikram.aditya@alumni.edu']._id,
      graduationYear: 2022,
      currentCompany: 'TechCorp',
      jobRole: 'Senior Software Engineer',
    },
    {
      alumniId: users.byEmail['priya.nambiar@alumni.edu']._id,
      graduationYear: 2020,
      currentCompany: 'CloudSys',
      jobRole: 'Staff Cloud Architect',
    },
  ];

  const createdAlumniProfiles = await AlumniProfile.insertMany(alumniProfilesData);
  console.log(`   ✓ Created ${createdAlumniProfiles.length} Alumni Profiles`);

  // 4. Recruiter Profiles
  const recruiterProfilesData = [
    {
      recruiterId: users.byEmail['alex.rivera@techcorp.com']._id,
      companyName: 'TechCorp',
      designation: 'Lead University Talent Partner',
    },
    {
      recruiterId: users.byEmail['sarah.chen@fintechapex.com']._id,
      companyName: 'FinTech Apex',
      designation: 'Director of Campus Recruitment',
    },
  ];

  const createdRecruiterProfiles = await RecruiterProfile.insertMany(recruiterProfilesData);
  console.log(`   ✓ Created ${createdRecruiterProfiles.length} Recruiter Profiles`);

  return {
    studentProfiles: createdStudentProfiles,
    facultyProfiles: createdFacultyProfiles,
    alumniProfiles: createdAlumniProfiles,
    recruiterProfiles: createdRecruiterProfiles,
  };
}
