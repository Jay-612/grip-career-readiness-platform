import fs from 'fs';

const summary = JSON.parse(fs.readFileSync('.claude/audit/final/audit-summary.json', 'utf8'));
const orig = {
  'public-landing': { origCards: 98, origDHeight: 4176, origMHeight: 7789, origMFolds: 9.2, origActions: 17 },
  'public-login': { origCards: 25, origDHeight: 1102, origMHeight: 1148, origMFolds: 1.4, origActions: 10 },
  'public-register': { origCards: 34, origDHeight: 1198, origMHeight: 1559, origMFolds: 1.8, origActions: 8 },
  'student-dashboard': { origCards: 97, origDHeight: 2110, origMHeight: 4880, origMFolds: 5.8, origActions: 11 },
  'student-profile': { origCards: 90, origDHeight: 1994, origMHeight: 4446, origMFolds: 5.3, origActions: 17 },
  'student-career-compass': { origCards: 135, origDHeight: 3553, origMHeight: 6987, origMFolds: 8.3, origActions: 15 },
  'student-goals': { origCards: 115, origDHeight: 1869, origMHeight: 3838, origMFolds: 4.5, origActions: 24 },
  'student-guidance': { origCards: 90, origDHeight: 1491, origMHeight: 2675, origMFolds: 3.2, origActions: 19 },
  'student-interviews': { origCards: 77, origDHeight: 1205, origMHeight: 2287, origMFolds: 2.7, origActions: 19 },
  'student-alumni-posts': { origCards: 92, origDHeight: 1355, origMHeight: 2420, origMFolds: 2.9, origActions: 38 },
  'faculty-dashboard': { origCards: 93, origDHeight: 1769, origMHeight: 3663, origMFolds: 4.3, origActions: 16 },
  'faculty-interviews': { origCards: 124, origDHeight: 2761, origMHeight: 4777, origMFolds: 5.7, origActions: 49 },
  'faculty-guidance': { origCards: 66, origDHeight: 1157, origMHeight: 1361, origMFolds: 1.6, origActions: 13 },
  'faculty-analytics': { origCards: 195, origDHeight: 3505, origMHeight: 6754, origMFolds: 8.0, origActions: 32 },
  'alumni-dashboard': { origCards: 85, origDHeight: 1890, origMHeight: 3761, origMFolds: 4.5, origActions: 18 },
  'alumni-experience': { origCards: 46, origDHeight: 1162, origMHeight: 1692, origMFolds: 2.0, origActions: 26 },
  'alumni-mentorship': { origCards: 82, origDHeight: 1395, origMHeight: 1356, origMFolds: 1.6, origActions: 20 },
  'recruiter-dashboard': { origCards: 57, origDHeight: 1453, origMHeight: 2638, origMFolds: 3.1, origActions: 15 },
  'recruiter-company': { origCards: 65, origDHeight: 1927, origMHeight: 3179, origMFolds: 3.8, origActions: 16 },
  'recruiter-feedback': { origCards: 51, origDHeight: 1281, origMHeight: 2012, origMFolds: 2.4, origActions: 12 },
  'admin-dashboard': { origCards: 73, origDHeight: 1281, origMHeight: 3184, origMFolds: 3.8, origActions: 9 },
  'admin-users': { origCards: 74, origDHeight: 1022, origMHeight: 1756, origMFolds: 2.1, origActions: 37 },
  'admin-curriculum': { origCards: 85, origDHeight: 1248, origMHeight: 2948, origMFolds: 3.5, origActions: 16 },
  'admin-companies': { origCards: 77, origDHeight: 900, origMHeight: 2007, origMFolds: 2.4, origActions: 18 },
  'admin-events': { origCards: 38, origDHeight: 900, origMHeight: 1255, origMFolds: 1.5, origActions: 11 },
  'admin-analytics': { origCards: 70, origDHeight: 1301, origMHeight: 2113, origMFolds: 2.5, origActions: 7 }
};

console.log('| Route | Orig Cards | Curr Cards | Orig Actions | Curr Actions | Orig Desktop H | Curr Desktop H | Orig Mobile H | Curr Mobile H | Orig Mobile Folds | Curr Mobile Folds | Mobile Height Reduction |');
console.log('| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |');

for (const [id, o] of Object.entries(orig)) {
  const cur = summary.metrics[id];
  if (!cur) continue;
  const cCards = cur.desktop.cards;
  const cActions = cur.desktop.buttons;
  const cdH = cur.desktop.height;
  const cmH = cur.mobile.height;
  const cmF = cur.mobile.folds;
  const red = Math.round(((o.origMHeight - cmH) / o.origMHeight) * 100);
  console.log(`| \`${id}\` | ${o.origCards} | ${cCards} | ${o.origActions} | ${cActions} | ${o.origDHeight}px | ${cdH}px | ${o.origMHeight}px | ${cmH}px | ${o.origMFolds} | ${cmF} | -${red}% |`);
}
