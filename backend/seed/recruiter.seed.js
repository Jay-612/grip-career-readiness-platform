import RecruiterFeedback from '../model/RecruiterFeedback.js';

/**
 * Seeds official corporate recruiter evaluations and candidate review records.
 * Directly impacts student readiness scores (Formula: goalScore*0.3 + interviewScore*0.4 + feedbackScore*0.3).
 * 
 * @param {Object} users Created users dictionary from seedUsers()
 */
export async function seedRecruiterFeedback(users) {
  console.log('💬 Seeding Recruiter Candidate Feedback Records...');

  const u = users.byEmail;
  const now = new Date();
  const past4Days = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const past2Days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const past1Day = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  const feedbackData = [
    // Aarav Sharma - Evaluated by Alex Rivera (TechCorp)
    {
      studentId: u['aarav.sharma@campus.edu']._id,
      recruiterId: u['alex.rivera@techcorp.com']._id,
      comments: `Candidate demonstrates outstanding grasp of concurrent data structures and Kafka partition semantics. Strong problem-solving rigor during the live whiteboard coding challenge. Highly recommended for TechCorp Cloud Platform Engineering Tier-1 internship. Suggested improvement: explore Raft log compaction techniques.`,
      date: past4Days,
    },
    // Tanvi Deshmukh - Evaluated by Alex Rivera (TechCorp)
    {
      studentId: u['tanvi.deshmukh@campus.edu']._id,
      recruiterId: u['alex.rivera@techcorp.com']._id,
      comments: `Exceptional system design whiteboard performance. Tanvi clearly explained distributed rate limiting with Redis sliding-window counters, handling race conditions with Lua scripts. Flawless communication and technical depth. Top candidate on TechCorp 2026 hiring radar.`,
      date: past2Days,
    },
    // Tanvi Deshmukh - Evaluated by Sarah Chen (FinTech Apex)
    {
      studentId: u['tanvi.deshmukh@campus.edu']._id,
      recruiterId: u['sarah.chen@fintechapex.com']._id,
      comments: `Strong algorithmic foundations and architectural maturity. Demonstrated comprehensive understanding of ACID transaction isolation levels in PostgreSQL. Excellent fit for FinTech Apex Core Banking Systems team.`,
      date: past1Day,
    },
    // Diya Patel - Evaluated by Sarah Chen (FinTech Apex)
    {
      studentId: u['diya.patel@campus.edu']._id,
      recruiterId: u['sarah.chen@fintechapex.com']._id,
      comments: `Solid frontend architectural skills in React and TypeScript. Diya explained state management trade-offs well and demonstrated clean component decomposition. Recommendation: deepen knowledge of database index access paths and SQL query profiling before final campus placement drive.`,
      date: past2Days,
    },
    // Rohan Gupta - Evaluated by Alex Rivera (TechCorp)
    {
      studentId: u['rohan.gupta@campus.edu']._id,
      recruiterId: u['alex.rivera@techcorp.com']._id,
      comments: `Very proficient with Docker multi-stage builds and Go HTTP microservices. Clean code style and methodical debugging approach. Passed technical screening round with high marks.`,
      date: past1Day,
    },
  ];

  const createdFeedback = await RecruiterFeedback.insertMany(feedbackData);
  console.log(`   ✓ Created ${createdFeedback.length} Recruiter Feedback Records`);

  return {
    feedback: createdFeedback,
  };
}
