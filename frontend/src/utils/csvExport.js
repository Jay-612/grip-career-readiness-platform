/**
 * Utility to export an array of student objects to a CSV file and trigger download.
 */
export const exportStudentsToCSV = (students = [], filename = 'department_student_roster.csv') => {
  if (!students || students.length === 0) {
    alert('No student records available to export.');
    return;
  }

  const headers = ['Rank', 'Name', 'Email', 'USN/ID', 'Semester', 'Career Track', 'Readiness Score', 'Status'];

  const rows = students.map((s, index) => {
    const studentId = s.studentId || s._id || s.id || '';
    const usn = studentId ? `1MS${studentId.slice(-6).toUpperCase()}` : 'N/A';
    const status = (s.readinessScore || 0) >= 80 ? 'Placement Ready' : (s.readinessScore || 0) >= 60 ? 'Nearly Ready' : 'Needs Attention';

    return [
      s.rank || index + 1,
      `"${(s.studentName || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${usn}"`,
      s.semester || 'Unassigned',
      `"${(s.selectedCareer || 'None').replace(/"/g, '""')}"`,
      s.readinessScore || 0,
      `"${status}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
