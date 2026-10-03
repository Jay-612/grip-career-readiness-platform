/**
 * Profile & Skills Local Storage Persistence
 * Manages client-side enrichment for resume, professional links, bio, and custom verified skills.
 */

const STORAGE_PREFIX = 'grip_student_profile_';

const DEFAULT_LINKS = {
  github: 'https://github.com/aaravsharma',
  linkedin: 'https://linkedin.com/in/aarav-sharma',
  portfolio: 'https://aaravsharma.dev',
  leetcode: 'https://leetcode.com/aarav_sharma',
};

const DEFAULT_RESUME = {
  fileName: 'Aarav_Sharma_Resume_2026.pdf',
  uploadedAt: '2026-09-15',
  fileSize: '248 KB',
  atsScore: 88,
  status: 'Verified by Placement Cell',
  targetRole: 'Full Stack & Software Engineering',
};

const DEFAULT_BIO = 'Final-year Computer Science student specializing in distributed systems, full-stack React/Node architectures, and database scalability. Actively preparing for campus placements.';

export const getStoredProfileExtra = (studentId) => {
  if (!studentId) return { links: DEFAULT_LINKS, resume: DEFAULT_RESUME, bio: DEFAULT_BIO, customSkills: [] };
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${studentId}`);
    if (!raw) return { links: DEFAULT_LINKS, resume: DEFAULT_RESUME, bio: DEFAULT_BIO, customSkills: [] };
    const parsed = JSON.parse(raw);
    return {
      links: { ...DEFAULT_LINKS, ...(parsed.links || {}) },
      resume: { ...DEFAULT_RESUME, ...(parsed.resume || {}) },
      bio: parsed.bio || DEFAULT_BIO,
      customSkills: parsed.customSkills || [],
    };
  } catch {
    return { links: DEFAULT_LINKS, resume: DEFAULT_RESUME, bio: DEFAULT_BIO, customSkills: [] };
  }
};

export const saveStoredProfileExtra = (studentId, data) => {
  if (!studentId) return;
  try {
    const current = getStoredProfileExtra(studentId);
    const updated = {
      ...current,
      ...data,
      links: { ...current.links, ...(data.links || {}) },
      resume: { ...current.resume, ...(data.resume || {}) },
    };
    localStorage.setItem(`${STORAGE_PREFIX}${studentId}`, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save profile extra to storage:', err);
  }
};
