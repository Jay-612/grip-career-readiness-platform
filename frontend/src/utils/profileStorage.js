/**
 * Profile & Skills Local Storage Persistence
 * Manages client-side enrichment for resume, professional links, bio, and custom verified skills.
 */

const STORAGE_PREFIX = 'grip_student_profile_';

const getDefaultLinks = (studentName = '') => {
  const slug = studentName ? studentName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  return {
    github: slug ? `https://github.com/${slug}` : '',
    linkedin: slug ? `https://linkedin.com/in/${slug}` : '',
    portfolio: slug ? `https://${slug}.dev` : '',
    leetcode: slug ? `https://leetcode.com/${slug}` : '',
  };
};

const getDefaultResume = (studentName = '') => {
  const formattedName = studentName ? studentName.trim().replace(/\s+/g, '_') : 'Student';
  return {
    fileName: `${formattedName}_Resume.pdf`,
    uploadedAt: 'Recently updated',
    fileSize: '240 KB',
    targetRole: 'Software Engineering',
  };
};

const DEFAULT_BIO = 'Final-year Computer Science student specializing in distributed systems, full-stack React/Node architectures, and database scalability. Actively preparing for campus placements.';

export const getStoredProfileExtra = (studentId, studentName = '') => {
  const defaultLinks = getDefaultLinks(studentName);
  const defaultResume = getDefaultResume(studentName);

  if (!studentId) return { links: defaultLinks, resume: defaultResume, bio: DEFAULT_BIO, customSkills: [] };
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${studentId}`);
    if (!raw) return { links: defaultLinks, resume: defaultResume, bio: DEFAULT_BIO, customSkills: [] };
    const parsed = JSON.parse(raw);

    const resume = { ...defaultResume, ...(parsed.resume || {}) };
    delete resume.atsScore;
    delete resume.status;

    // Sanitize any previously cached 'Aarav' references for other students
    const isActuallyAarav = studentName && studentName.toLowerCase().includes('aarav');
    if (!isActuallyAarav && resume.fileName && resume.fileName.toLowerCase().includes('aarav')) {
      resume.fileName = defaultResume.fileName;
    }

    const links = { ...defaultLinks, ...(parsed.links || {}) };
    if (!isActuallyAarav) {
      Object.keys(links).forEach((key) => {
        if (typeof links[key] === 'string' && links[key].toLowerCase().includes('aarav')) {
          links[key] = defaultLinks[key] || '';
        }
      });
    }

    return {
      links,
      resume,
      bio: parsed.bio || DEFAULT_BIO,
      customSkills: parsed.customSkills || [],
    };
  } catch {
    return { links: defaultLinks, resume: defaultResume, bio: DEFAULT_BIO, customSkills: [] };
  }
};

export const saveStoredProfileExtra = (studentId, data, studentName = '') => {
  if (!studentId) return;
  try {
    const current = getStoredProfileExtra(studentId, studentName);
    const updated = {
      ...current,
      ...data,
      links: { ...current.links, ...(data.links || {}) },
      resume: { ...current.resume, ...(data.resume || {}) },
    };
    delete updated.resume.atsScore;
    delete updated.resume.status;

    localStorage.setItem(`${STORAGE_PREFIX}${studentId}`, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save profile extra to storage:', err);
  }
};
