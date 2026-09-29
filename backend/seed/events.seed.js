import DepartmentEvent from '../model/DepartmentEvent.js';

/**
 * Seeds department-wide recruitment improvement events, mock drive days, and skill workshops.
 * Authored by Dr. Rajesh Kumar (HOD, Computer Science & Engineering).
 * 
 * @param {Object} users Created users dictionary from seedUsers()
 */
export async function seedEvents(users) {
  console.log('📅 Seeding Department Events & Placement Drives...');

  const u = users.byEmail;
  const hod = u['dr.rajesh.kumar@campus.edu'];
  const now = new Date();
  const next4Days = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const next8Days = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
  const next14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const eventsData = [
    {
      hodId: hod._id,
      title: 'Annual Campus Placement Mock Screening Day',
      targetSkill: 'Technical Interviewing & Whiteboard Coding',
      date: next4Days,
    },
    {
      hodId: hod._id,
      title: 'Distributed Systems & Cloud Architecture Masterclass',
      targetSkill: 'Microservices & System Design',
      date: next8Days,
    },
    {
      hodId: hod._id,
      title: 'Full-Stack Performance & Web Vitals Workshop',
      targetSkill: 'React Optimization & CWV Metrics',
      date: next14Days,
    },
  ];

  const createdEvents = await DepartmentEvent.insertMany(eventsData);
  console.log(`   ✓ Created ${createdEvents.length} Department Events`);

  return {
    events: createdEvents,
  };
}
