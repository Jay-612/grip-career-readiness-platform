import MockInterview from '../model/MockInterview.js';
import EvaluationScore from '../model/EvaluationScore.js';

/**
 * Seeds mock interview appointments and detailed evaluation rubric scores.
 * Features completed interviews with rubric scores, upcoming scheduled sessions, and cancelled bookings.
 * 
 * @param {Object} users Created users dictionary from seedUsers()
 */
export async function seedInterviews(users) {
  console.log('🤝 Seeding Mock Interviews & Evaluation Rubric Scores...');

  const u = users.byEmail;
  const now = new Date();
  const past5Days = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const past2Days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const next3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const next6Days = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

  // 1. Completed Interview: Aarav Sharma evaluated by Dr. Rajesh Kumar (Faculty)
  const interview1 = await MockInterview.create({
    studentId: u['aarav.sharma@campus.edu']._id,
    interviewerId: u['dr.rajesh.kumar@campus.edu']._id,
    dateTime: past5Days,
    meetLink: 'https://meet.google.com/gri-mock-001',
    status: 'completed',
  });

  const score1 = await EvaluationScore.create({
    interviewId: interview1._id,
    technicalScore: 9.5,
    communicationScore: 9.0,
    confidenceScore: 9.0,
  });

  // 2. Completed Interview: Tanvi Deshmukh evaluated by Alex Rivera (TechCorp Recruiter)
  const interview2 = await MockInterview.create({
    studentId: u['tanvi.deshmukh@campus.edu']._id,
    interviewerId: u['alex.rivera@techcorp.com']._id,
    dateTime: past2Days,
    meetLink: 'https://meet.google.com/gri-corp-002',
    status: 'completed',
  });

  const score2 = await EvaluationScore.create({
    interviewId: interview2._id,
    technicalScore: 9.8,
    communicationScore: 9.2,
    confidenceScore: 9.5,
  });

  // 3. Completed Interview: Diya Patel evaluated by Prof. Neha Sharma (Faculty)
  const interview3 = await MockInterview.create({
    studentId: u['diya.patel@campus.edu']._id,
    interviewerId: u['prof.neha.sharma@campus.edu']._id,
    dateTime: past5Days,
    meetLink: 'https://meet.google.com/gri-mock-003',
    status: 'completed',
  });

  const score3 = await EvaluationScore.create({
    interviewId: interview3._id,
    technicalScore: 7.5,
    communicationScore: 8.0,
    confidenceScore: 7.5,
  });

  // 4. Completed Interview: Rohan Gupta evaluated by Dr. Arun Pandey (Faculty)
  const interview4 = await MockInterview.create({
    studentId: u['rohan.gupta@campus.edu']._id,
    interviewerId: u['dr.arun.pandey@campus.edu']._id,
    dateTime: past2Days,
    meetLink: 'https://meet.google.com/gri-mock-004',
    status: 'completed',
  });

  const score4 = await EvaluationScore.create({
    interviewId: interview4._id,
    technicalScore: 8.5,
    communicationScore: 8.0,
    confidenceScore: 8.2,
  });

  // 5. Scheduled Upcoming Interview: Ananya Reddy with Sarah Chen (FinTech Apex Recruiter)
  const interview5 = await MockInterview.create({
    studentId: u['ananya.reddy@campus.edu']._id,
    interviewerId: u['sarah.chen@fintechapex.com']._id,
    dateTime: next3Days,
    meetLink: 'https://meet.google.com/gri-corp-005',
    status: 'scheduled',
  });

  // 6. Scheduled Upcoming Interview: Kabir Verma with Dr. Rajesh Kumar (Faculty)
  const interview6 = await MockInterview.create({
    studentId: u['kabir.verma@campus.edu']._id,
    interviewerId: u['dr.rajesh.kumar@campus.edu']._id,
    dateTime: next6Days,
    meetLink: 'https://meet.google.com/gri-mock-006',
    status: 'scheduled',
  });

  // 7. Cancelled Interview: Ishaan Nair with Prof. Neha Sharma (Rescheduling test)
  const interview7 = await MockInterview.create({
    studentId: u['ishaan.nair@campus.edu']._id,
    interviewerId: u['prof.neha.sharma@campus.edu']._id,
    dateTime: past5Days,
    meetLink: 'https://meet.google.com/gri-mock-007',
    status: 'cancelled',
  });

  console.log(`   ✓ Created 7 Mock Interview Appointments (4 Completed, 2 Scheduled, 1 Cancelled)`);
  console.log(`   ✓ Created 4 Evaluation Scores for completed interviews`);

  return {
    interviews: [interview1, interview2, interview3, interview4, interview5, interview6, interview7],
    scores: [score1, score2, score3, score4],
  };
}
