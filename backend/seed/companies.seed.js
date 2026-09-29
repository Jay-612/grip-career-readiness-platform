import Company from '../model/Company.js';

/**
 * Seeds target hiring partner companies and their minimum skill match thresholds.
 */
export async function seedCompanies() {
  console.log('🏢 Seeding Hiring Partner Companies...');

  const companiesData = [
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
    {
      companyName: 'NextGen Mobility',
      minimumMatchScore: 60,
      requiredSkills: ['Python', 'PyTorch', 'Data Pipelines', 'FastAPI', 'Docker'],
    },
  ];

  const createdCompanies = await Company.insertMany(companiesData);
  console.log(`   ✓ Created ${createdCompanies.length} Companies`);

  const companiesByName = {};
  createdCompanies.forEach((c) => {
    companiesByName[c.companyName] = c;
  });

  return {
    all: createdCompanies,
    byName: companiesByName,
  };
}
