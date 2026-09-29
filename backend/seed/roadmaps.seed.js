import CareerRoadmap from '../model/CareerRoadmap.js';
import SemesterPlan from '../model/SemesterPlan.js';

/**
 * Seeds Career Roadmaps and associated Semester Plans for campus career tracks.
 */
export async function seedRoadmaps() {
  console.log('🧭 Seeding Career Roadmaps & Semester Plans...');

  const roadmapsData = [
    {
      careerName: 'Distributed Systems & Cloud Backend Engineer',
      description: 'High-concurrency systems, microservice architectures, and fault-tolerant cloud platforms.',
      requiredSkills: ['Kafka', 'Docker', 'Kubernetes', 'Redis', 'Microservices', 'System Design', 'Go', 'AWS'],
      semesters: [
        {
          semesterNumber: 3,
          subjects: ['Core Data Structures & Algorithms', 'LeetCode Intermediate Patterns', 'Graph Theory', 'Time & Space Complexity'],
        },
        {
          semesterNumber: 4,
          subjects: ['Database Internals & SQL/NoSQL', 'Relational Normalization', 'B-Tree & LSM Storage', 'Distributed Replication'],
        },
        {
          semesterNumber: 5,
          subjects: ['Event Streaming & Messaging', 'Apache Kafka Fundamentals', 'Redis Cluster Caching', 'gRPC & Protobuf Services'],
        },
        {
          semesterNumber: 6,
          subjects: ['Cloud Infrastructure & Containers', 'Docker Engine & Orchestration', 'Kubernetes Deployments', 'Resilience Patterns'],
        },
        {
          semesterNumber: 7,
          subjects: ['Distributed Consensus & Capstone', 'Raft Consensus Algorithm', 'Chaos Engineering with k6', 'Day 1 Mock Screens'],
        },
        {
          semesterNumber: 8,
          subjects: ['Enterprise Hiring & Placement Drives', 'System Design Whiteboard Mastery', 'Corporate Internship Conversion'],
        },
      ],
    },
    {
      careerName: 'Full-Stack Product Engineering',
      description: 'End-to-end web product engineering, responsive modern UI, and REST/GraphQL API systems.',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'PostgreSQL', 'System Optimization', 'REST APIs'],
      semesters: [
        {
          semesterNumber: 3,
          subjects: ['Modern JavaScript (ES6+)', 'DOM Manipulation & Event Loop', 'Semantic HTML5 & Modern CSS'],
        },
        {
          semesterNumber: 4,
          subjects: ['React Component Architecture', 'State Management & Custom Hooks', 'TypeScript Foundations', 'Tailwind CSS Systems'],
        },
        {
          semesterNumber: 5,
          subjects: ['Backend API Design with Express', 'RESTful Standards & Middleware', 'PostgreSQL Relational Modeling', 'JWT Auth Flows'],
        },
        {
          semesterNumber: 6,
          subjects: ['Full-Stack Performance & Testing', 'Jest & React Testing Library', 'GraphQL Schemas & Apollo Client', 'Web Vitals Optimization'],
        },
        {
          semesterNumber: 7,
          subjects: ['Capstone Web Platform & CI/CD', 'Dockerized Next.js Deployments', 'AWS S3 & CloudFront Hosting', 'Mock Technical Rounds'],
        },
        {
          semesterNumber: 8,
          subjects: ['Campus Recruitment Finales', 'Full-Stack Coding Sprints', 'Portfolio Demonstration'],
        },
      ],
    },
    {
      careerName: 'DevOps & Cloud Infrastructure Specialist',
      description: 'Automated CI/CD pipelines, container orchestration, Infrastructure-as-Code, and cloud reliability.',
      requiredSkills: ['Kubernetes', 'Terraform', 'Docker', 'Linux', 'AWS', 'CI/CD', 'Prometheus', 'Grafana'],
      semesters: [
        {
          semesterNumber: 3,
          subjects: ['Linux System Administration', 'Bash Shell Scripting', 'Networking Protocols & Subnetting'],
        },
        {
          semesterNumber: 4,
          subjects: ['Version Control Git Workflows', 'Containerization with Docker', 'Multi-Stage Image Builds', 'GitHub Actions CI/CD'],
        },
        {
          semesterNumber: 5,
          subjects: ['Infrastructure as Code (IaC)', 'Terraform State & Modules', 'AWS VPC, EC2, IAM & S3 Configuration', 'Ansible Automation'],
        },
        {
          semesterNumber: 6,
          subjects: ['Kubernetes Administration (CKA Prep)', 'Pod Scheduling & Services', 'Ingress Controllers & Helm Charts', 'ConfigMaps & Secrets'],
        },
        {
          semesterNumber: 7,
          subjects: ['Cloud Observability & Security', 'Prometheus Metrics & Alertmanager', 'Grafana Dashboarding', 'Vulnerability Scanning'],
        },
        {
          semesterNumber: 8,
          subjects: ['Site Reliability Engineering Capstone', 'Multi-Region High Availability', 'Placement Technical Interviews'],
        },
      ],
    },
    {
      careerName: 'AI & Data Systems Engineer',
      description: 'Machine learning data pipelines, model deployment services, and high-throughput data processing.',
      requiredSkills: ['Python', 'SQL', 'PyTorch', 'Data Pipelines', 'FastAPI', 'Docker', 'Pandas'],
      semesters: [
        {
          semesterNumber: 3,
          subjects: ['Python for Scientific Computing', 'NumPy Matrix Operations', 'Pandas Data Wrangling', 'Linear Algebra & Calculus'],
        },
        {
          semesterNumber: 4,
          subjects: ['Supervised & Unsupervised ML', 'Scikit-Learn Modeling', 'Feature Engineering & Cross-Validation', 'SQL Analytics'],
        },
        {
          semesterNumber: 5,
          subjects: ['Deep Learning & Neural Networks', 'PyTorch Tensors & Autograd', 'CNNs for Computer Vision', 'Transformer NLP Basics'],
        },
        {
          semesterNumber: 6,
          subjects: ['Model Serving & MLOps', 'FastAPI High-Throughput APIs', 'ONNX Runtime Optimization', 'Dockerized Model Containers'],
        },
        {
          semesterNumber: 7,
          subjects: ['End-to-End ML Pipeline Capstone', 'Airflow Orchestration', 'Vector Databases & RAG Pipelines', 'Mock Technical Rounds'],
        },
        {
          semesterNumber: 8,
          subjects: ['Campus Recruitment Evaluation', 'Applied AI Production Systems', 'Placement Readiness Board'],
        },
      ],
    },
  ];

  const createdRoadmaps = [];
  let totalSemesterPlans = 0;

  for (const rData of roadmapsData) {
    const roadmap = await CareerRoadmap.create({
      careerName: rData.careerName,
      description: rData.description,
      requiredSkills: rData.requiredSkills,
    });
    createdRoadmaps.push(roadmap);

    for (const sem of rData.semesters) {
      await SemesterPlan.create({
        roadmapId: roadmap._id,
        semesterNumber: sem.semesterNumber,
        subjects: sem.subjects,
      });
      totalSemesterPlans++;
    }
  }

  console.log(`   ✓ Created ${createdRoadmaps.length} Career Roadmaps`);
  console.log(`   ✓ Created ${totalSemesterPlans} Semester Plans`);

  const roadmapsByName = {};
  createdRoadmaps.forEach((r) => {
    roadmapsByName[r.careerName] = r;
  });

  return {
    all: createdRoadmaps,
    byName: roadmapsByName,
  };
}
