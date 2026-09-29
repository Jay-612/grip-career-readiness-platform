import ExperiencePost from '../model/ExperiencePost.js';

/**
 * Seeds published alumni experience articles, interview prep playbooks, and career reflections.
 * 
 * @param {Object} users Created users dictionary from seedUsers()
 */
export async function seedAlumniContent(users) {
  console.log('🎓 Seeding Alumni Experience Posts & Playbooks...');

  const u = users.byEmail;
  const now = new Date();
  const past10Days = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const past6Days = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const past3Days = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const postsData = [
    {
      alumniId: u['vikram.aditya@alumni.edu']._id,
      title: 'Cracking the Tier-1 Distributed Systems Interview: My TechCorp Journey',
      content: `When I was graduating in 2022, distributed system questions felt intimidating. What changed the game for me was treating every whiteboard problem as an engineering tradeoff discussion rather than memorizing algorithms.

Key Focus Areas:
1. Consensus Protocols: Understand Raft versus Paxos at an intuitive leader election and log replication level.
2. Caching Invalidation: Be ready to explain cache-aside, write-through, and write-behind patterns with Redis.
3. Network Partitions: CAP theorem is not just a definition—explain how DynamoDB handles split-brain with vector clocks.

Mock interviews on GRIP were the single highest-ROI activity during my 7th semester. Treat your mock evaluations seriously and revise feedback before every campus round!`,
      tags: ['Distributed Systems', 'TechCorp', 'System Design', 'Campus Placement', 'Interviews'],
      date: past10Days,
    },
    {
      alumniId: u['priya.nambiar@alumni.edu']._id,
      title: 'From College Projects to Production Kubernetes: A Cloud Architect’s Playbook',
      content: `Transitioning from local Docker containers to production-grade Kubernetes at CloudSys required a major mindset shift. 

Top 4 competencies interviewers look for in cloud candidates:
- Container Security: Do not run processes as root in your Dockerfiles. Use distroless or Alpine base images and scan CVEs.
- Helm & GitOps: Understanding how declarative manifests sync via ArgoCD or Flux will instantly put you in the top 5% of candidates.
- Observability: When an outage happens, logs are not enough. Instrument distributed tracing with OpenTelemetry and metrics with Prometheus.
- Cost Optimization: Talk about spot instances, pod auto-scalers (HPA/VPA), and egress traffic minimization.

Feel free to ping me on GRIP Guidance for resume feedback or architecture reviews!`,
      tags: ['Kubernetes', 'CloudSys', 'DevOps', 'Cloud Architecture', 'Mentorship'],
      date: past6Days,
    },
    {
      alumniId: u['vikram.aditya@alumni.edu']._id,
      title: 'Top 5 Coding Interview Mistakes Even Smart Students Make',
      content: `Over the past year evaluating campus candidates at TechCorp, here are the most frequent mistakes that lead to rejection:

1. Jumping to code without clarifying constraints (e.g. data size, memory limits, edge cases like empty arrays or integer overflow).
2. Staying silent during the problem-solving phase—interviewers want to hear your thought process.
3. Ignoring brute force: Propose a simple O(N^2) solution first in 30 seconds to establish a baseline, then optimize to O(N log N) or O(N).
4. Forgetting to test with an actual trace using a small test input on the whiteboard before announcing you are done.
5. Inability to analyze Big-O time and space complexity with precision.

Practice mock interviews regularly to turn these habits into second nature.`,
      tags: ['Coding Round', 'LeetCode', 'Interview Tips', 'Career Guidance'],
      date: past3Days,
    },
  ];

  const createdPosts = await ExperiencePost.insertMany(postsData);
  console.log(`   ✓ Created ${createdPosts.length} Alumni Experience Posts`);

  return {
    posts: createdPosts,
  };
}
