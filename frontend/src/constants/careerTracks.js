/**
 * Canonical Career Tracks definition across the GRIP platform.
 * Aligned with seed/roadmaps.seed.js and backend Career_Roadmaps collection.
 */

export const CANONICAL_CAREER_TRACKS = [
  {
    id: 'cloud-backend',
    careerName: 'Distributed Systems & Cloud Backend Engineer',
    description: 'High-concurrency systems, microservice architectures, and fault-tolerant cloud platforms.',
    requiredSkills: ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'Microservices', 'System Design', 'Go', 'AWS'],
  },
  {
    id: 'fullstack',
    careerName: 'Full-Stack Product Engineering',
    description: 'End-to-end web product engineering, responsive modern UI, and REST/GraphQL API systems.',
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'PostgreSQL', 'System Optimization', 'REST APIs'],
  },
  {
    id: 'devops',
    careerName: 'DevOps & Cloud Infrastructure Specialist',
    description: 'Automated CI/CD pipelines, container orchestration, Infrastructure-as-Code, and cloud reliability.',
    requiredSkills: ['Kubernetes', 'Terraform', 'Docker', 'Linux', 'AWS', 'CI/CD', 'Prometheus', 'Grafana'],
  },
  {
    id: 'ai-data',
    careerName: 'AI & Data Systems Engineer',
    description: 'Machine learning data pipelines, model deployment services, and high-throughput data processing.',
    requiredSkills: ['Python', 'SQL', 'PyTorch', 'Data Pipelines', 'FastAPI', 'Docker', 'Pandas'],
  },
];

export const CAREER_TRACK_NAMES = CANONICAL_CAREER_TRACKS.map((t) => t.careerName);

export default CANONICAL_CAREER_TRACKS;
