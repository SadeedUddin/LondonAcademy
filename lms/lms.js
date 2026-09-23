// ============================================================
//  LAUK LMS - Data Store + Auth + Quiz Engine  (lms.js)
//
//  SECURITY NOTE
//  This LMS runs entirely in the browser (static hosting, no server).
//  Everything here is hardened as far as a static site allows:
//   - no plain-text passwords anywhere in the code
//   - admin login is verified with PBKDF2 (310k rounds) and the
//     session carries a proof that cannot be forged without the password
//   - self-registration can only create student accounts
//   - all user-supplied text is escaped before it touches the DOM
//  But anything stored in a visitor's own browser (progress, quiz
//  results, registered accounts) can still be edited by that visitor.
//  Before real learners / certificates rely on it, move accounts,
//  progress and quiz scoring to a real backend (e.g. Tutor LMS).
// ============================================================
'use strict';

/* ---------- ADMIN ACCOUNT (password is NOT stored here) ----------
   To change the admin password: open any LMS page, open the browser
   console and run:   await LMS.makeAdminVerifier('your-new-password')
   then paste the printed salt + verifier below.                    */
const ADMIN_ACCOUNT = {
  id: 'admin',
  name: 'Academy Admin',
  email: 'admin@londonukacademy.uk',
  avatar: 'AA',
  salt: '5cfe567e3006fe2541cdcf860346d784',
  iterations: 310000,
  verifier: 'ec628522d019ea197971c962924dddabfabb08c7eeb4163f77da5b3e780c01b0'
};

/* Demo learner profiles (display only - no passwords) */
const DEMO_USERS = [
  { id: 1, name: 'Sarah Thompson', email: 'sarah@example.com', role: 'student', avatar: 'ST', enrolled: [1, 2, 3] },
  { id: 2, name: 'James Okafor',   email: 'james@example.com', role: 'student', avatar: 'JO', enrolled: [1, 4] },
  { id: 3, name: 'Aisha Patel',    email: 'aisha@example.com', role: 'student', avatar: 'AP', enrolled: [2, 5] },
];

const COURSES = [
  {
    id: 1,
    title: 'Level 3 Management Diploma',
    code: 'L3MD',
    level: 'Level 3',
    instructor: 'Emma Clarke',
    duration: '6 months',
    lessons: 24,
    credits: 37,
    discipline: 'management',
    emoji: '📊',
    color: '#c9a84c',
    description: 'Develop core management skills including leading teams, managing performance, and driving operational excellence.',
    modules: [
      {
        id: 'm1', title: 'Unit 1: Principles of Management', lessons: 4,
        items: [
          { id: 'l1', title: 'Introduction to Management', duration: '25 min', type: 'video' },
          { id: 'l2', title: 'Management Theories & Approaches', duration: '30 min', type: 'video' },
          { id: 'l3', title: 'Setting Objectives & KPIs', duration: '20 min', type: 'reading' },
          { id: 'l4', title: 'Unit Quiz', duration: '15 min', type: 'quiz' },
        ]
      },
      {
        id: 'm2', title: 'Unit 2: Leading Your Team', lessons: 4,
        items: [
          { id: 'l5', title: 'Leadership vs Management', duration: '28 min', type: 'video' },
          { id: 'l6', title: 'Motivating Your Team', duration: '22 min', type: 'video' },
          { id: 'l7', title: 'Delegation & Empowerment', duration: '18 min', type: 'reading' },
          { id: 'l8', title: 'Unit Quiz', duration: '15 min', type: 'quiz' },
        ]
      },
      {
        id: 'm3', title: 'Unit 3: Managing Performance', lessons: 4,
        items: [
          { id: 'l9',  title: 'Performance Management Cycles', duration: '32 min', type: 'video' },
          { id: 'l10', title: 'Conducting Appraisals', duration: '25 min', type: 'video' },
          { id: 'l11', title: 'Handling Underperformance', duration: '20 min', type: 'reading' },
          { id: 'l12', title: 'Unit Quiz', duration: '15 min', type: 'quiz' },
        ]
      },
      {
        id: 'm4', title: 'Unit 4: Operational Planning', lessons: 4,
        items: [
          { id: 'l13', title: 'Planning & Resource Management', duration: '28 min', type: 'video' },
          { id: 'l14', title: 'Risk Assessment Basics', duration: '22 min', type: 'video' },
          { id: 'l15', title: 'Continuous Improvement Methods', duration: '18 min', type: 'reading' },
          { id: 'l16', title: 'Unit Quiz', duration: '15 min', type: 'quiz' },
        ]
      },
      {
        id: 'm5', title: 'Unit 5: Communication & Stakeholders', lessons: 4,
        items: [
          { id: 'l17', title: 'Effective Business Communication', duration: '26 min', type: 'video' },
          { id: 'l18', title: 'Stakeholder Management', duration: '20 min', type: 'video' },
          { id: 'l19', title: 'Presenting Information', duration: '15 min', type: 'reading' },
          { id: 'l20', title: 'Unit Quiz', duration: '15 min', type: 'quiz' },
        ]
      },
      {
        id: 'm6', title: 'Unit 6: Final Assessment', lessons: 4,
        items: [
          { id: 'l21', title: 'Portfolio Preparation', duration: '40 min', type: 'reading' },
          { id: 'l22', title: 'Mock Assessment Review', duration: '35 min', type: 'video' },
          { id: 'l23', title: 'Submission Guidance', duration: '20 min', type: 'reading' },
          { id: 'l24', title: 'Final Knowledge Check', duration: '30 min', type: 'quiz' },
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Level 3 Award in Education & Training',
    code: 'L3AET',
    level: 'Level 3',
    instructor: 'Dr. Marcus Reid',
    duration: '3 months',
    lessons: 12,
    credits: 12,
    discipline: 'education',
    emoji: '🎓',
    color: '#4e9dff',
    description: 'Gain the essential skills to teach or train in post-16 education settings. Includes micro-teach, lesson planning and inclusive practice.',
    modules: [
      {
        id: 'm1', title: 'Unit 1: The Teaching Role', lessons: 3,
        items: [
          { id: 'l1', title: 'Roles and Responsibilities', duration: '22 min', type: 'video' },
          { id: 'l2', title: 'The Teaching and Learning Cycle', duration: '28 min', type: 'video' },
          { id: 'l3', title: 'Unit Quiz', duration: '15 min', type: 'quiz' },
        ]
      },
      {
        id: 'm2', title: 'Unit 2: Planning Inclusive Sessions', lessons: 3,
        items: [
          { id: 'l4', title: 'Lesson Planning Fundamentals', duration: '30 min', type: 'video' },
          { id: 'l5', title: 'Inclusive Teaching Methods', duration: '25 min', type: 'reading' },
          { id: 'l6', title: 'Unit Quiz', duration: '15 min', type: 'quiz' },
        ]
      },
      {
        id: 'm3', title: 'Unit 3: Assessment Fundamentals', lessons: 3,
        items: [
          { id: 'l7', title: 'Types of Assessment', duration: '25 min', type: 'video' },
          { id: 'l8', title: 'Giving Effective Feedback', duration: '20 min', type: 'reading' },
          { id: 'l9', title: 'Unit Quiz', duration: '15 min', type: 'quiz' },
        ]
      },
      {
        id: 'm4', title: 'Unit 4: Professional Development', lessons: 3,
        items: [
          { id: 'l10', title: 'CPD for Educators', duration: '18 min', type: 'video' },
          { id: 'l11', title: 'Reflection and Practice', duration: '20 min', type: 'reading' },
          { id: 'l12', title: 'Final Assessment', duration: '30 min', type: 'quiz' },
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Level 5 Operations Diploma',
    code: 'L5OD',
    level: 'Level 5',
    instructor: 'Prof. Linda Walsh',
    duration: '12 months',
    lessons: 36,
    credits: 74,
    discipline: 'operations',
    emoji: '⚙️',
    color: '#34c77b',
    description: 'Strategic-level qualification in operations management covering supply chain, financial planning, change management and organisational strategy.',
    modules: [
      {
        id: 'm1', title: 'Unit 1: Strategic Operations', lessons: 6,
        items: [
          { id: 'l1', title: 'Introduction to Operations Strategy', duration: '35 min', type: 'video' },
          { id: 'l2', title: 'Value Chain Analysis', duration: '30 min', type: 'video' },
          { id: 'l3', title: 'Operational Excellence', duration: '28 min', type: 'reading' },
          { id: 'l4', title: 'KPI Frameworks', duration: '25 min', type: 'video' },
          { id: 'l5', title: 'Case Study: Toyota Production System', duration: '20 min', type: 'reading' },
          { id: 'l6', title: 'Unit Assessment', duration: '30 min', type: 'quiz' },
        ]
      },
      {
        id: 'm2', title: 'Unit 2: Financial Management', lessons: 6,
        items: [
          { id: 'l7', title: 'Budgeting & Forecasting', duration: '40 min', type: 'video' },
          { id: 'l8', title: 'Cost Management Techniques', duration: '35 min', type: 'video' },
          { id: 'l9', title: 'Financial Statements Analysis', duration: '30 min', type: 'reading' },
          { id: 'l10', title: 'Investment Appraisal', duration: '28 min', type: 'video' },
          { id: 'l11', title: 'Working Capital Management', duration: '22 min', type: 'reading' },
          { id: 'l12', title: 'Unit Assessment', duration: '30 min', type: 'quiz' },
        ]
      }
    ]
  },
  {
    id: 4,
    title: 'Level 4 Certificate in Education & Training',
    code: 'L4CET',
    level: 'Level 4',
    instructor: 'Dr. Marcus Reid',
    duration: '6 months',
    lessons: 20,
    credits: 36,
    discipline: 'education',
    emoji: '📚',
    color: '#f5a623',
    description: 'An in-depth teaching qualification building advanced pedagogical skills, inclusive practice, assessment design and professional identity.',
    modules: [
      {
        id: 'm1', title: 'Unit 1: Teaching in Post-16', lessons: 5,
        items: [
          { id: 'l1', title: 'Advanced Teaching Roles', duration: '30 min', type: 'video' },
          { id: 'l2', title: 'Curriculum Design', duration: '35 min', type: 'video' },
          { id: 'l3', title: 'Pedagogical Theories', duration: '28 min', type: 'reading' },
          { id: 'l4', title: 'Contextual Practice', duration: '22 min', type: 'video' },
          { id: 'l5', title: 'Unit Assessment', duration: '30 min', type: 'quiz' },
        ]
      }
    ]
  },
  {
    id: 5,
    title: 'Certified Professional Trainer',
    code: 'CPT',
    level: 'Professional',
    instructor: 'Emma Clarke',
    duration: '4 months',
    lessons: 16,
    credits: 20,
    discipline: 'management',
    emoji: '🏆',
    color: '#e84855',
    description: 'Industry-recognised trainer certification covering facilitation skills, programme design, virtual delivery, and training evaluation.',
    modules: [
      {
        id: 'm1', title: 'Unit 1: Training Design', lessons: 4,
        items: [
          { id: 'l1', title: 'Needs Analysis', duration: '25 min', type: 'video' },
          { id: 'l2', title: 'Learning Objectives', duration: '20 min', type: 'reading' },
          { id: 'l3', title: 'Programme Architecture', duration: '30 min', type: 'video' },
          { id: 'l4', title: 'Unit Quiz', duration: '15 min', type: 'quiz' },
        ]
      }
    ]
  }
];

const QUIZ_BANKS = {
  l4: [
    {
      q: 'Which management theory focuses on employees being motivated by self-actualisation?',
      options: ["Taylor's Scientific Management", "Maslow's Hierarchy of Needs", "McGregor's Theory X", "Herzberg's Two-Factor Theory"],
      answer: 1
    },
    {
      q: 'What does SMART stand for when setting objectives?',
      options: ['Simple, Measurable, Achievable, Realistic, Timely', 'Specific, Measurable, Achievable, Relevant, Time-bound', 'Strategic, Motivating, Attainable, Reasonable, Trackable', 'Systematic, Manageable, Accurate, Realistic, Targeted'],
      answer: 1
    },
    {
      q: 'A KPI is best described as:',
      options: ['A financial ratio used in accounting', 'A metric that measures how effectively a company achieves key business objectives', 'A human resources policy document', 'A type of management structure'],
      answer: 1
    }
  ],
  l8: [
    {
      q: 'Which leadership style involves the leader making all decisions with little input from the team?',
      options: ['Democratic', 'Laissez-faire', 'Autocratic', 'Transformational'],
      answer: 2
    },
    {
      q: "Maslow's Hierarchy places which need at the top?",
      options: ['Safety needs', 'Esteem needs', 'Social needs', 'Self-actualisation'],
      answer: 3
    },
    {
      q: 'Effective delegation primarily helps to:',
      options: ['Remove accountability from the manager', 'Develop team members and free management time', 'Reduce the number of employees needed', 'Increase micro-management opportunities'],
      answer: 1
    }
  ],
  default: [
    {
      q: 'What is the primary purpose of a learning objective?',
      options: ['To describe what the teacher will do', 'To state what the learner will be able to do after the session', 'To outline assessment criteria only', 'To document course costs'],
      answer: 1
    },
    {
      q: 'Which assessment type occurs throughout a course to monitor progress?',
      options: ['Summative', 'Diagnostic', 'Formative', 'Initial'],
      answer: 2
    },
    {
      q: 'CPD stands for:',
      options: ['Continuous Professional Development', 'Certified Programme Design', 'Competency Planning Document', 'Curriculum Policy Directive'],
      answer: 0
    }
  ]
};


/* ============================================================
   HELPERS
   ============================================================ */
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v == null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}

function storeGet(storage, key) {
  try { return storage.getItem(key); } catch (e) { return null; }
}
function storeSet(storage, key, val) {
  try { storage.setItem(key, val); } catch (e) { /* storage blocked */ }
}
function storeDel(storage, key) {
  try { storage.removeItem(key); } catch (e) { /* storage blocked */ }
}

function bytesToHex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
function hexToBytes(hex) {
  if (typeof hex !== 'string' || hex.length % 2 || /[^0-9a-f]/i.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
function randomHex(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return bytesToHex(a);
}
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/* Synchronous SHA-256 (used to verify the admin session proof on page load) */
function sha256Hex(bytes) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const l = bytes.length;
  const padLen = ((l + 9 + 63) >> 6) << 6;
  const m = new Uint8Array(padLen);
  m.set(bytes);
  m[l] = 0x80;
  const dv = new DataView(m.buffer);
  dv.setUint32(padLen - 8, Math.floor((l * 8) / 0x100000000));
  dv.setUint32(padLen - 4, (l * 8) >>> 0);
  const w = new Uint32Array(64);
  for (let off = 0; off < padLen; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = w[i - 15], s1 = w[i - 2];
      const r7 = ((s0 >>> 7) | (s0 << 25)) ^ ((s0 >>> 18) | (s0 << 14)) ^ (s0 >>> 3);
      const r17 = ((s1 >>> 17) | (s1 << 15)) ^ ((s1 >>> 19) | (s1 << 13)) ^ (s1 >>> 10);
      w[i] = (w[i - 16] + r7 + w[i - 7] + r17) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) +
        ((e & f) ^ (~e & g)) + h + K[i] + w[i];
      const t2 = (((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) +
        ((a & b) ^ (a & c) ^ (b & c));
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

async function pbkdf2Hex(password, saltHex, iterations) {
  if (!window.crypto || !crypto.subtle) {
    throw new Error('Secure sign-in needs HTTPS. Please open the site over https://');
  }
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations },
    key, 256
  );
  return bytesToHex(new Uint8Array(bits));
}

/* Console helper to rotate the admin password */
async function makeAdminVerifier(newPassword) {
  if (!newPassword || newPassword.length < 12) throw new Error('Use at least 12 characters.');
  const salt = randomHex(16);
  const derived = await pbkdf2Hex(newPassword, salt, ADMIN_ACCOUNT.iterations);
  const verifier = sha256Hex(hexToBytes(derived));
  const out = { salt, verifier };
  console.log('Paste into ADMIN_ACCOUNT in lms.js:', out);
  return out;
}

const EMAIL_RE = /^[^\s@<>"'`]+@[^\s@<>"'`]+\.[^\s@<>"'`]{2,}$/;

/* ============================================================
   REGISTERED USERS (stored in this browser only)
   ============================================================ */
const USERS_KEY = 'lms_users';

function getRegisteredUsers() {
  const list = safeParse(storeGet(localStorage, USERS_KEY), []);
  return Array.isArray(list) ? list : [];
}
function saveRegisteredUsers(list) {
  storeSet(localStorage, USERS_KEY, JSON.stringify(list));
}

/* ============================================================
   PROGRESS STORE (per user)
   ============================================================ */
function progressKey() {
  const s = getSession();
  return 'lms_progress_' + (s ? String(s.id).replace(/[^\w-]/g, '') : 'guest');
}

function getProgress() {
  const key = progressKey();
  const existing = storeGet(localStorage, key);
  if (!existing) {
    const s = getSession();
    // Sample progress only for the demo learner account
    const defaultProgress = (s && s.id === 1) ? {
      1: { l1: true, l2: true, l3: true, l4: true, l5: true, l6: true, l7: true, l8: true, l9: true, l10: true, l11: true, l12: true, l13: true, l14: true, l15: true, l16: true, l17: true, l18: true },
      2: { l1: true, l2: true, l3: true, l4: true, l5: true, l6: true, l7: true },
      3: { l1: true, l2: true, l3: true, l4: true, l5: true }
    } : {};
    storeSet(localStorage, key, JSON.stringify(defaultProgress));
    return defaultProgress;
  }
  const p = safeParse(existing, {});
  return (p && typeof p === 'object' && !Array.isArray(p)) ? p : {};
}

function setProgress(p) {
  storeSet(localStorage, progressKey(), JSON.stringify(p));
}

function findLesson(courseId, lessonId) {
  const course = COURSES.find(c => c.id === Number(courseId));
  if (!course) return null;
  return course.modules.flatMap(m => m.items).find(l => l.id === lessonId) || null;
}

function markLessonComplete(courseId, lessonId) {
  if (!findLesson(courseId, lessonId)) return false;   // ignore unknown / crafted ids
  const p = getProgress();
  const cid = String(Number(courseId));
  if (!Object.prototype.hasOwnProperty.call(p, cid) || typeof p[cid] !== 'object') p[cid] = {};
  p[cid][lessonId] = true;
  setProgress(p);
  return true;
}

function isLessonComplete(courseId, lessonId) {
  const p = getProgress();
  const cid = String(Number(courseId));
  return !!(Object.prototype.hasOwnProperty.call(p, cid) && p[cid] &&
    Object.prototype.hasOwnProperty.call(p[cid], lessonId) && p[cid][lessonId] === true);
}

function getCourseProgress(courseId) {
  const course = COURSES.find(c => c.id == courseId);
  if (!course) return 0;
  const allLessons = course.modules.flatMap(m => m.items);
  if (!allLessons || allLessons.length === 0) return 0;
  const done = allLessons.filter(l => isLessonComplete(courseId, l.id)).length;
  return Math.round((done / allLessons.length) * 100);
}

/* ============================================================
   AUTHENTICATION
   ============================================================ */
const SESSION_KEY = 'lms_session';
const SESSION_TTL_SHORT = 8 * 60 * 60 * 1000;        // 8 hours
const SESSION_TTL_REMEMBER = 7 * 24 * 60 * 60 * 1000; // 7 days

function readRawSession() {
  return safeParse(storeGet(sessionStorage, SESSION_KEY), null) ||
         safeParse(storeGet(localStorage, SESSION_KEY), null);
}

function isValidAdminProof(proof) {
  const bytes = hexToBytes(proof);
  if (!bytes || bytes.length !== 32) return false;
  return timingSafeEqual(sha256Hex(bytes), ADMIN_ACCOUNT.verifier);
}

function getSession() {
  const s = readRawSession();
  if (!s || typeof s !== 'object') return null;
  if (typeof s.exp !== 'number' || Date.now() > s.exp) { clearSession(); return null; }
  // Role is never trusted from storage: admin requires a valid proof
  const role = (s.role === 'admin' && isValidAdminProof(s.proof)) ? 'admin' : 'student';
  return {
    id: s.id,
    name: String(s.name || 'Student').slice(0, 80),
    email: String(s.email || '').slice(0, 120),
    role,
    avatar: String(s.avatar || 'ST').slice(0, 2),
    enrolled: Array.isArray(s.enrolled) ? s.enrolled.filter(n => Number.isInteger(n)) : [1],
    proof: role === 'admin' ? s.proof : undefined,
    exp: s.exp
  };
}

function setSession(user, remember) {
  const prev = readRawSession();
  const persist = (typeof remember === 'boolean') ? remember : !!(prev && prev.remember);
  const record = Object.assign({}, user, {
    remember: persist,
    exp: user.exp || Date.now() + (persist ? SESSION_TTL_REMEMBER : SESSION_TTL_SHORT)
  });
  clearSession();
  storeSet(persist ? localStorage : sessionStorage, SESSION_KEY, JSON.stringify(record));
}

function updateSessionProfile(fields) {
  const raw = readRawSession();
  if (!raw) return null;
  if (fields.name) {
    raw.name = String(fields.name).slice(0, 80);
    raw.avatar = initials(raw.name);
  }
  if (fields.email && EMAIL_RE.test(fields.email)) raw.email = String(fields.email).slice(0, 120);
  storeSet(raw.remember ? localStorage : sessionStorage, SESSION_KEY, JSON.stringify(raw));
  return getSession();
}

function clearSession() {
  storeDel(sessionStorage, SESSION_KEY);
  storeDel(localStorage, SESSION_KEY);
}

function initials(name) {
  return String(name).trim().split(/\s+/).map(n => n[0] || '').join('').toUpperCase().slice(0, 2) || 'U';
}

function requireAuth(role) {
  const session = getSession();
  if (!session) {
    const here = location.pathname.split('/').pop() + location.search;
    window.location.replace('index.html?next=' + encodeURIComponent(here));
    return null;
  }
  if (role === 'admin' && session.role !== 'admin') {
    window.location.replace('dashboard.html');
    return null;
  }
  return session;
}

/* Only allow redirecting to our own LMS pages after login */
function safeNext(next, fallback) {
  if (typeof next === 'string' && /^(dashboard|course|lesson|admin)\.html(\?[\w=&%.-]*)?$/.test(next)) return next;
  return fallback;
}

/* Basic brute-force slow-down (per browser) */
const LOCK_KEY = 'lms_login_lock';
function checkLock() {
  const st = safeParse(storeGet(localStorage, LOCK_KEY), { fails: 0, until: 0 });
  if (st.until && Date.now() < st.until) {
    const secs = Math.ceil((st.until - Date.now()) / 1000);
    throw new Error(`Too many attempts. Please wait ${secs}s and try again.`);
  }
  return st;
}
function recordFail(st) {
  st.fails = (st.fails || 0) + 1;
  if (st.fails >= 5) { st.until = Date.now() + 60 * 1000 * Math.min(st.fails - 4, 15); }
  storeSet(localStorage, LOCK_KEY, JSON.stringify(st));
}
function clearFails() { storeDel(localStorage, LOCK_KEY); }

async function login(email, password, remember) {
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');
  const lock = checkLock();
  const fail = () => { recordFail(lock); return new Error('Invalid email or password.'); };
  if (!EMAIL_RE.test(email) || !password) throw fail();

  if (email === ADMIN_ACCOUNT.email) {
    const derived = await pbkdf2Hex(password, ADMIN_ACCOUNT.salt, ADMIN_ACCOUNT.iterations);
    if (!isValidAdminProof(derived)) throw fail();
    clearFails();
    const a = ADMIN_ACCOUNT;
    const session = { id: a.id, name: a.name, email: a.email, role: 'admin', avatar: a.avatar, enrolled: [1, 2, 3, 4, 5], proof: derived };
    setSession(session, !!remember);
    return getSession();
  }

  const user = getRegisteredUsers().find(u => u.email === email);
  if (!user) {
    await pbkdf2Hex(password, randomHex(16), 100000); // equalise timing
    throw fail();
  }
  const hash = await pbkdf2Hex(password, user.salt, user.iterations || 100000);
  if (!timingSafeEqual(hash, user.hash)) throw fail();
  clearFails();
  setSession({ id: user.id, name: user.name, email: user.email, role: 'student', avatar: user.avatar, enrolled: user.enrolled }, !!remember);
  return getSession();
}

/* Demo learner - no password, fixed sample profile, never admin */
function demoLogin() {
  const d = DEMO_USERS[0];
  setSession({ id: d.id, name: d.name, email: d.email, role: 'student', avatar: d.avatar, enrolled: d.enrolled }, false);
  return getSession();
}

async function register(name, email, password) {
  name = String(name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 80);
  email = String(email || '').trim().toLowerCase();
  password = String(password || '');
  if (name.length < 2) throw new Error('Please enter your full name.');
  if (!EMAIL_RE.test(email) || email.length > 120) throw new Error('Please enter a valid email address.');
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error('Password must be at least 8 characters and include letters and numbers.');
  }
  const users = getRegisteredUsers();
  if (email === ADMIN_ACCOUNT.email || DEMO_USERS.some(u => u.email === email) || users.some(u => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }
  const salt = randomHex(16);
  const iterations = 100000;
  const hash = await pbkdf2Hex(password, salt, iterations);
  const newUser = {
    id: 'u_' + randomHex(8),
    name, email, salt, iterations, hash,
    role: 'student',                 // self-registration can never create admins
    avatar: initials(name),
    enrolled: [1]
  };
  users.push(newUser);
  saveRegisteredUsers(users);
  setSession({ id: newUser.id, name, email, role: 'student', avatar: newUser.avatar, enrolled: newUser.enrolled }, false);
  return getSession();
}

/* ============================================================
   QUIZ ENGINE
   ============================================================ */
class QuizEngine {
  constructor(lessonId, containerEl, opts) {
    this.lessonId = lessonId;
    this.container = containerEl;
    this.opts = opts || {};
    this.bank = QUIZ_BANKS[lessonId] || QUIZ_BANKS.default;
    this.current = 0;
    this.answers = [];
    this.render();
  }

  render() {
    const q = this.bank[this.current];
    const letters = ['A', 'B', 'C', 'D'];

    const dotsHtml = this.bank.map((_, i) => {
      let cls = 'quiz-dot';
      if (i < this.current) cls += ' answered';
      if (i === this.current) cls += ' current';
      return `<div class="${cls}"></div>`;
    }).join('');

    this.container.innerHTML = `
      <div class="quiz-title">🧠 Knowledge Check</div>
      <div class="quiz-sub">Question ${this.current + 1} of ${this.bank.length}</div>
      <div class="quiz-progress-dots">${dotsHtml}</div>
      <div class="quiz-question">${escapeHtml(q.q)}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <div class="quiz-option ${this.answers[this.current] === i ? 'selected' : ''}" data-idx="${i}">
            <span class="quiz-option-letter">${letters[i]}</span>
            ${escapeHtml(opt)}
          </div>
        `).join('')}
      </div>
      <div class="quiz-result"></div>
      <div style="display:flex;gap:10px;align-items:center;">
        ${this.current > 0 ? `<button class="btn-quiz" data-quiz="prev" style="background:rgba(255,255,255,.1);color:var(--white);">◀ Prev</button>` : ''}
        <button class="btn-quiz" data-quiz="next" ${this.answers[this.current] == null ? 'disabled' : ''}>
          ${this.current === this.bank.length - 1 ? 'Submit Quiz' : 'Next ▶'}
        </button>
      </div>
    `;

    const nextBtn = this.container.querySelector('[data-quiz="next"]');
    this.container.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        this.answers[this.current] = parseInt(opt.dataset.idx, 10);
        this.container.querySelectorAll('.quiz-option').forEach(o => o.classList.toggle('selected', o === opt));
        nextBtn.disabled = false;
      });
    });

    nextBtn.addEventListener('click', () => {
      if (this.current < this.bank.length - 1) {
        this.current++;
        this.render();
      } else {
        this.showResults();
      }
    });

    this.container.querySelector('[data-quiz="prev"]')?.addEventListener('click', () => {
      this.current--;
      this.render();
    });
  }

  showResults() {
    const score = this.answers.filter((ans, i) => ans === this.bank[i].answer).length;
    const pct = Math.round((score / this.bank.length) * 100);
    const pass = pct >= 70;

    this.container.innerHTML = `
      <div class="quiz-title">🏆 Quiz Complete!</div>
      <div style="text-align:center;padding:24px 0;">
        <div style="font-size:3.5rem;font-weight:800;color:${pass ? 'var(--success)' : 'var(--danger)'};margin-bottom:8px;">${pct}%</div>
        <div style="font-size:1rem;font-weight:600;margin-bottom:4px;">${pass ? '🎉 Passed! Lesson marked complete.' : '❌ Not quite - you need 70% to pass. Try again'}</div>
        <div style="font-size:.85rem;color:var(--slate);margin-bottom:24px;">${score} out of ${this.bank.length} correct</div>
      </div>
      ${pass ? this.bank.map((q, i) => {
        const userAns = this.answers[i];
        const correct = q.answer;
        return `
          <div style="margin-bottom:14px;padding:12px;background:rgba(255,255,255,.04);border-radius:10px;border:1px solid rgba(255,255,255,.07);">
            <div style="font-size:.85rem;font-weight:600;margin-bottom:8px;">Q${i + 1}: ${escapeHtml(q.q)}</div>
            ${q.options.map((opt, j) => {
              let style = 'padding:6px 10px;border-radius:6px;font-size:.82rem;margin-bottom:4px;';
              if (j === correct) style += 'background:rgba(52,199,123,.15);color:var(--success);';
              else if (j === userAns && j !== correct) style += 'background:rgba(232,72,85,.1);color:var(--danger);';
              else style += 'color:var(--slate);';
              return `<div style="${style}">${j === correct ? '✓' : j === userAns ? '✗' : '·'} ${escapeHtml(opt)}</div>`;
            }).join('')}
          </div>`;
      }).join('') : ''}
      <button class="btn-quiz" data-quiz="retry" style="margin-top:8px;">Try Again</button>
    `;
    this.container.querySelector('[data-quiz="retry"]').addEventListener('click', () => {
      this.current = 0;
      this.answers = [];
      this.render();
    });

    const session = getSession();
    if (session) {
      const key = 'lms_quiz_results_' + String(session.id).replace(/[^\w-]/g, '');
      const results = safeParse(storeGet(localStorage, key), {});
      results[this.lessonId] = { score: pct, pass, date: new Date().toISOString() };
      storeSet(localStorage, key, JSON.stringify(results));
      if (pass && typeof this.opts.onPass === 'function') this.opts.onPass(pct);
    }
  }
}

/* ============================================================
   UI UTILITIES
   ============================================================ */
function showToast(msg, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const safeType = Object.prototype.hasOwnProperty.call(icons, type) ? type : 'info';
  const toast = document.createElement('div');
  toast.className = `toast ${safeType}`;

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = icons[safeType];
  const text = document.createElement('span');
  text.className = 'toast-text';
  text.textContent = String(msg);          // plain text only - never HTML
  const close = document.createElement('span');
  close.className = 'toast-close';
  close.textContent = '✕';
  close.addEventListener('click', () => toast.remove());

  toast.append(icon, text, close);
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideInRight .3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function createRing(container, pct, size = 120, stroke = 10, color = '#c9a84c') {
  if (!container) return;
  pct = Math.max(0, Math.min(100, Number(pct) || 0));
  size = Number(size) || 120;
  stroke = Number(stroke) || 10;
  if (!/^#[0-9a-f]{3,8}$/i.test(color)) color = '#c9a84c';
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  container.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="progress-ring">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="rgba(255,255,255,.08)" stroke-width="${stroke}" fill="none"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="${stroke}" fill="none"
        stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})"
        stroke-dasharray="${circ}" stroke-dashoffset="${circ}" style="transition:stroke-dashoffset 1.2s ease"/>
    </svg>
    <div class="ring-label">
      <div class="ring-label-value">${pct}%</div>
      <div class="ring-label-sub">Complete</div>
    </div>`;
  setTimeout(() => {
    const circle = container.querySelector('circle:nth-child(2)');
    if (circle) circle.style.strokeDashoffset = offset;
  }, 100);
}

function setupSidebar(activeItem) {
  const session = getSession();
  if (!session) return;

  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = session.avatar || 'ST');
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name || 'Student');
  document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = session.role === 'admin' ? 'Administrator' : 'Student');

  sidebar.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.page) item.classList.toggle('active', item.dataset.page === activeItem);
  });

  // The ☰ button toggles via its own onclick; here we only make the overlay close the menu
  const overlay = document.querySelector('.sidebar-overlay');
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', () => {
      clearSession();
      window.location.href = 'index.html';
    });
  });

  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  notifBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel?.classList.toggle('show');
  });
  document.addEventListener('click', () => notifPanel?.classList.remove('show'));
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

/* Expose a frozen API so page scripts / console can't swap auth functions on the object */
window.LMS = Object.freeze({
  COURSES, DEMO_USERS, QUIZ_BANKS,
  getProgress, setProgress, markLessonComplete, isLessonComplete, getCourseProgress, findLesson,
  getSession, setSession, updateSessionProfile, clearSession, requireAuth, safeNext,
  login, demoLogin, register, makeAdminVerifier,
  QuizEngine, showToast, createRing, setupSidebar, getParam, escapeHtml
});
