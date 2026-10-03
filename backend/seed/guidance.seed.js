import GuidanceRequest from '../model/GuidanceRequest.js';
import GuidanceReply from '../model/GuidanceReply.js';

/**
 * Seeds guidance requests from students and corresponding replies from faculty and alumni mentors.
 * Features both answered requests and pending requests awaiting mentor guidance.
 * 
 * @param {Object} users Created users dictionary from seedUsers()
 */
export async function seedGuidance(users) {
  console.log('🧭 Seeding Guidance Requests & Mentor Replies...');

  const u = users.byEmail;

  // 1. Guidance Requests
  const request1 = await GuidanceRequest.create({
    studentId: u['aarav.sharma@campus.edu']._id,
    question: 'How should I structure a distributed transaction across microservices when two-phase commit is too costly for high throughput?',
    targetType: 'faculty',
    targetFacultyId: u['dr.rajesh.kumar@campus.edu']._id,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  });

  const request2 = await GuidanceRequest.create({
    studentId: u['diya.patel@campus.edu']._id,
    question: 'For campus placement frontend technical rounds, should I focus more on raw Web APIs & performance profiling or Next.js App Router conventions?',
    targetType: 'faculty',
    targetFacultyId: u['prof.neha.sharma@campus.edu']._id,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  const request3 = await GuidanceRequest.create({
    studentId: u['ananya.reddy@campus.edu']._id,
    question: 'What are the most common system design pitfalls new engineers encounter when scaling WebSocket servers to 50k concurrent connections?',
    targetType: 'alumni',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  // Pending request 1 (Diya Patel awaiting faculty reply)
  const request4 = await GuidanceRequest.create({
    studentId: u['diya.patel@campus.edu']._id,
    question: 'Could someone review my schema design for an e-commerce inventory reservation system using optimistic concurrency control? Details at: https://github.com/diya/inventory-occ',
    targetType: 'faculty',
    targetFacultyId: u['dr.rajesh.kumar@campus.edu']._id,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  // Pending request 2 (Kabir Verma awaiting alumni guidance)
  const request5 = await GuidanceRequest.create({
    studentId: u['kabir.verma@campus.edu']._id,
    question: 'As a 3rd-semester student interested in DevOps and Cloud, what portfolio projects distinguish candidates for 2026 summer internships?',
    targetType: 'alumni',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000),
  });

  // Pending remedial submission (Aarav Patel remedial task)
  const request6 = await GuidanceRequest.create({
    studentId: u['aarav.sharma@campus.edu']._id,
    question: 'REST API Remedial Task Submission:\nCompleted the required idempotency keys and error-handling middleware following interview recommendations.\n\nEvidence Repository:\nhttps://github.com/aarav-sharma/campus-rest-remedial\n\n```javascript\n// Idempotency verification handler\nexport const idempotentHandler = async (req, res) => {\n  const token = req.headers["x-idempotency-key"];\n  if (await cache.has(token)) return res.json(await cache.get(token));\n  const result = await processTransaction(req.body);\n  await cache.set(token, result, 3600);\n  return res.status(200).json(result);\n};\n```',
    targetType: 'faculty',
    targetFacultyId: u['dr.rajesh.kumar@campus.edu']._id,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
  });

  // 2. Guidance Replies
  // Reply from Dr. Rajesh Kumar (HOD / Faculty) to Request 1
  const reply1 = await GuidanceReply.create({
    requestId: request1._id,
    mentorId: u['dr.rajesh.kumar@campus.edu']._id,
    answerText: 'Excellent question Aarav. In high-throughput architectures, look into the Saga Pattern (orchestration vs choreography) paired with Outbox Pattern to guarantee eventual consistency without locking distributed resources. Also study compensating transactions.',
  });

  // Second Reply from Vikram Aditya (Alumni @ TechCorp) to Request 1
  const reply2 = await GuidanceReply.create({
    requestId: request1._id,
    mentorId: u['vikram.aditya@alumni.edu']._id,
    answerText: 'Adding to Dr. Kumar’s point: at TechCorp, we implement Sagas over Kafka topics with dead-letter queues. Focus on idempotency tokens on consumer handlers — in production interviews, interviewers always ask how you handle duplicate messages.',
  });

  // Reply from Prof. Neha Sharma (Faculty) to Request 2
  const reply3 = await GuidanceReply.create({
    requestId: request2._id,
    mentorId: u['prof.neha.sharma@campus.edu']._id,
    answerText: 'Start with raw JavaScript fundamentals, the Event Loop, asynchronous queues, and browser DOM rendering stages. Frameworks change, but understanding hydration, bundle analysis, and Core Web Vitals (LCP, INP, CLS) will pass any top-tier interview.',
  });

  // Reply from Priya Nambiar (Alumni @ CloudSys) to Request 3
  const reply4 = await GuidanceReply.create({
    requestId: request3._id,
    mentorId: u['priya.nambiar@alumni.edu']._id,
    answerText: 'The top 3 pitfalls are: 1) File descriptor exhaustion (check ulimit on Linux), 2) Memory leaks due to uncollected socket event listeners, and 3) Lack of backpressure handling when slow clients cannot drain incoming data buffers. Use Redis Pub/Sub or a dedicated gateway like Envoy for scaling.',
  });

  console.log(`   ✓ Created 6 Guidance Requests (3 Answered, 3 Pending)`);
  console.log(`   ✓ Created 4 Guidance Replies from Faculty & Alumni Mentors`);

  return {
    requests: [request1, request2, request3, request4, request5, request6],
    replies: [reply1, reply2, reply3, reply4],
  };
}
