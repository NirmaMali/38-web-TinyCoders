const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');

// ── EXTERNAL JOB PLATFORM INTEGRATION ──
// Simulates fetching from LinkedIn, Naukri, Indeed etc.
// In production, replace with real API calls (e.g., LinkedIn API, Indeed API, RapidAPI job search)

const EXTERNAL_PLATFORMS = {
  linkedin: {
    name: 'LinkedIn',
    color: '#0A66C2',
    baseUrl: 'https://linkedin.com/jobs/view/',
  },
  naukri: {
    name: 'Naukri',
    color: '#4A90D9',
    baseUrl: 'https://naukri.com/job-listings/',
  },
  indeed: {
    name: 'Indeed',
    color: '#2164F3',
    baseUrl: 'https://indeed.com/viewjob?jk=',
  },
  internshala: {
    name: 'Internshala',
    color: '#00A5EC',
    baseUrl: 'https://internshala.com/internship/detail/',
  },
};

// Curated external job listings (in production, fetched via APIs)
const externalJobsDatabase = [
  {
    id: 'ext-1',
    title: 'Software Engineer',
    company: 'Atlassian',
    location: 'Bangalore',
    package: '25-35 LPA',
    type: 'Full-Time',
    platform: 'linkedin',
    skills: ['Java', 'Python', 'React', 'System Design'],
    minCGPA: 7.5,
    description: 'Build collaborative tools that power modern teamwork. Work on products like Jira and Confluence.',
    postedDate: '2026-03-20',
    applyUrl: 'https://linkedin.com/jobs/view/atlassian-swe',
    experience: 'Freshers',
  },
  {
    id: 'ext-2',
    title: 'Data Science Intern',
    company: 'Swiggy',
    location: 'Bangalore',
    package: '40K/month',
    type: 'Internship',
    platform: 'internshala',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
    minCGPA: 7.0,
    description: 'Work on recommendation systems and delivery route optimization using ML models.',
    postedDate: '2026-03-22',
    applyUrl: 'https://internshala.com/internship/swiggy-ds',
    experience: 'Students/Freshers',
  },
  {
    id: 'ext-3',
    title: 'Frontend Developer',
    company: 'Razorpay',
    location: 'Bangalore',
    package: '18-28 LPA',
    type: 'Full-Time',
    platform: 'naukri',
    skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js'],
    minCGPA: 6.5,
    description: 'Build fast, reliable and beautiful payment experiences used by millions of businesses.',
    postedDate: '2026-03-18',
    applyUrl: 'https://naukri.com/razorpay-frontend',
    experience: 'Freshers / 0-1 years',
  },
  {
    id: 'ext-4',
    title: 'Backend Engineer',
    company: 'PhonePe',
    location: 'Pune',
    package: '20-30 LPA',
    type: 'Full-Time',
    platform: 'linkedin',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Docker'],
    minCGPA: 7.0,
    description: 'Design and develop backend services powering India\'s largest digital payment platform.',
    postedDate: '2026-03-25',
    applyUrl: 'https://linkedin.com/jobs/view/phonepe-backend',
    experience: 'Freshers',
  },
  {
    id: 'ext-5',
    title: 'DevOps Engineer',
    company: 'Zerodha',
    location: 'Bangalore / Remote',
    package: '22-32 LPA',
    type: 'Full-Time',
    platform: 'indeed',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Go', 'Python'],
    minCGPA: 7.5,
    description: 'Build and maintain infrastructure for India\'s largest stock broker. Handle millions of orders daily.',
    postedDate: '2026-03-15',
    applyUrl: 'https://indeed.com/zerodha-devops',
    experience: 'Freshers / 0-2 years',
  },
  {
    id: 'ext-6',
    title: 'ML Engineer Intern',
    company: 'Myntra',
    location: 'Bangalore',
    package: '50K/month',
    type: 'Internship',
    platform: 'internshala',
    skills: ['Python', 'TensorFlow', 'Deep Learning', 'NLP', 'Computer Vision'],
    minCGPA: 7.0,
    description: 'Work on fashion recommendation, visual search, and NLP-powered style advice systems.',
    postedDate: '2026-03-24',
    applyUrl: 'https://internshala.com/myntra-ml-intern',
    experience: 'Pre-final/Final year students',
  },
  {
    id: 'ext-7',
    title: 'Embedded Systems Engineer',
    company: 'Bosch',
    location: 'Bangalore',
    package: '12-18 LPA',
    type: 'Full-Time',
    platform: 'naukri',
    skills: ['Embedded C', 'RTOS', 'VLSI', 'Arduino', 'IoT'],
    minCGPA: 7.0,
    description: 'Develop embedded software for automotive and industrial IoT applications.',
    postedDate: '2026-03-19',
    applyUrl: 'https://naukri.com/bosch-embedded',
    experience: 'Freshers',
  },
  {
    id: 'ext-8',
    title: 'Cloud Solutions Architect',
    company: 'Oracle',
    location: 'Hyderabad',
    package: '28-40 LPA',
    type: 'Full-Time',
    platform: 'linkedin',
    skills: ['AWS', 'Azure', 'Cloud Architecture', 'Docker', 'Kubernetes'],
    minCGPA: 8.0,
    description: 'Design cloud solutions for enterprise clients. Work with cutting-edge cloud-native technologies.',
    postedDate: '2026-03-21',
    applyUrl: 'https://linkedin.com/jobs/view/oracle-cloud',
    experience: 'Freshers / 0-1 years',
  },
  {
    id: 'ext-9',
    title: 'Product Analyst',
    company: 'Meesho',
    location: 'Bangalore',
    package: '14-20 LPA',
    type: 'Full-Time',
    platform: 'indeed',
    skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Excel'],
    minCGPA: 6.5,
    description: 'Drive product decisions with data. Analyze user behavior, funnel metrics, and growth patterns.',
    postedDate: '2026-03-23',
    applyUrl: 'https://indeed.com/meesho-analyst',
    experience: 'Freshers',
  },
  {
    id: 'ext-10',
    title: 'Design Engineer Intern',
    company: 'Tata Technologies',
    location: 'Pune',
    package: '25K/month',
    type: 'Internship',
    platform: 'internshala',
    skills: ['AutoCAD', 'SolidWorks', 'CATIA', 'MATLAB'],
    minCGPA: 6.0,
    description: 'Work on automotive design projects using modern CAD/CAM tools.',
    postedDate: '2026-03-26',
    applyUrl: 'https://internshala.com/tata-design',
    experience: 'Pre-final year students',
  },
  {
    id: 'ext-11',
    title: 'Full Stack Developer',
    company: 'Freshworks',
    location: 'Chennai',
    package: '16-24 LPA',
    type: 'Full-Time',
    platform: 'naukri',
    skills: ['React', 'Node.js', 'MongoDB', 'Express', 'GraphQL'],
    minCGPA: 7.0,
    description: 'Build SaaS products used by 60,000+ businesses worldwide.',
    postedDate: '2026-03-17',
    applyUrl: 'https://naukri.com/freshworks-fullstack',
    experience: 'Freshers',
  },
  {
    id: 'ext-12',
    title: 'Cybersecurity Analyst',
    company: 'Cisco',
    location: 'Bangalore',
    package: '18-25 LPA',
    type: 'Full-Time',
    platform: 'linkedin',
    skills: ['Network Security', 'Python', 'Linux', 'Cloud Security'],
    minCGPA: 7.5,
    description: 'Protect enterprise networks and develop next-gen security solutions.',
    postedDate: '2026-03-16',
    applyUrl: 'https://linkedin.com/jobs/view/cisco-security',
    experience: 'Freshers / 0-1 years',
  },
];

// GET /api/external-jobs — fetch & match external jobs for a student
const getExternalJobs = asyncHandler(async (req, res) => {
  const { platform, location, type, search } = req.query;

  let studentProfile = null;
  if (req.user) {
    studentProfile = await StudentProfile.findOne({ userId: req.user._id });
  }

  let jobs = [...externalJobsDatabase];

  // Apply filters
  if (platform) jobs = jobs.filter(j => j.platform === platform);
  if (location) jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
  if (type) jobs = jobs.filter(j => j.type.toLowerCase() === type.toLowerCase());
  if (search) jobs = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  // Calculate match scores if student profile exists
  if (studentProfile) {
    jobs = jobs.map(job => {
      let matchScore = 0;

      // Skills match (50%)
      if (studentProfile.skills.length > 0 && job.skills.length > 0) {
        const skillsLower = studentProfile.skills.map(s => s.toLowerCase());
        const overlap = job.skills.filter(s => skillsLower.some(sk => sk.includes(s.toLowerCase()) || s.toLowerCase().includes(sk))).length;
        matchScore += Math.round((overlap / job.skills.length) * 50);
      }

      // CGPA (20%)
      if (studentProfile.cgpa >= job.minCGPA) {
        matchScore += 20;
      }

      // Location preference (15%)
      if (studentProfile.preferredLocations && studentProfile.preferredLocations.length > 0) {
        const locsLower = studentProfile.preferredLocations.map(l => l.toLowerCase());
        if (locsLower.some(l => job.location.toLowerCase().includes(l))) {
          matchScore += 15;
        }
      } else {
        matchScore += 5;
      }

      // Role preference (15%)
      if (studentProfile.preferredRoles && studentProfile.preferredRoles.length > 0) {
        const rolesLower = studentProfile.preferredRoles.map(r => r.toLowerCase());
        if (rolesLower.some(r => job.title.toLowerCase().includes(r) || r.includes(job.title.toLowerCase().split(' ')[0]))) {
          matchScore += 15;
        }
      } else {
        matchScore += 5;
      }

      return {
        ...job,
        matchScore: Math.min(matchScore, 100),
        isEligible: studentProfile.cgpa >= job.minCGPA,
        platformInfo: EXTERNAL_PLATFORMS[job.platform],
      };
    });

    // Sort by match score
    jobs.sort((a, b) => b.matchScore - a.matchScore);
  } else {
    jobs = jobs.map(job => ({
      ...job,
      matchScore: null,
      isEligible: null,
      platformInfo: EXTERNAL_PLATFORMS[job.platform],
    }));
  }

  res.json({
    success: true,
    data: {
      jobs,
      platforms: Object.entries(EXTERNAL_PLATFORMS).map(([key, val]) => ({ id: key, ...val })),
      totalJobs: jobs.length,
    },
  });
});

// ── PREDICTIVE ANALYTICS ──

// GET /api/admin/predictive-analytics
const getPredictiveAnalytics = asyncHandler(async (req, res) => {
  const allStudents = await StudentProfile.find().populate('userId', 'name');

  // Calculate placement probability for each unplaced student
  const predictions = allStudents
    .filter(s => !s.placementStatus?.isPlaced)
    .map(student => {
      const { probability, factors, riskLevel, recommendations } = calculatePlacementProbability(student);
      return {
        studentId: student._id,
        name: student.userId?.name || 'Unknown',
        department: student.department,
        cgpa: student.cgpa,
        semester: student.semester,
        probability,
        riskLevel,
        factors,
        recommendations,
        skillCount: student.skills?.length || 0,
        projectCount: student.projects?.length || 0,
        internshipCount: student.internships?.length || 0,
      };
    })
    .sort((a, b) => a.probability - b.probability); // lowest probability first (at-risk)

  // Department-wise predictions
  const departments = ['CSE', 'ECE', 'ISE', 'MECH'];
  const deptPredictions = departments.map(dept => {
    const deptStudents = predictions.filter(p => p.department === dept);
    const avgProb = deptStudents.length > 0
      ? Math.round(deptStudents.reduce((sum, s) => sum + s.probability, 0) / deptStudents.length)
      : 0;
    const atRisk = deptStudents.filter(s => s.riskLevel === 'high').length;
    return { department: dept, avgProbability: avgProb, atRiskCount: atRisk, totalUnplaced: deptStudents.length };
  }).filter(d => d.totalUnplaced > 0);

  // Skill demand analysis
  const allJobs = await Job.find({ isActive: true });
  const skillDemand = {};
  allJobs.forEach(job => {
    (job.requiredSkills || []).forEach(skill => {
      skillDemand[skill] = (skillDemand[skill] || 0) + 1;
    });
  });
  const topDemandedSkills = Object.entries(skillDemand)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, demand: count }));

  // Skill gap analysis
  const studentSkillFreq = {};
  allStudents.forEach(s => {
    (s.skills || []).forEach(skill => {
      studentSkillFreq[skill] = (studentSkillFreq[skill] || 0) + 1;
    });
  });
  const skillGaps = topDemandedSkills.map(({ skill, demand }) => ({
    skill,
    demand,
    supply: studentSkillFreq[skill] || 0,
    gap: Math.max(0, demand - (studentSkillFreq[skill] || 0)),
  }));

  // Salary trend predictions (based on performance data)
  const placedStudents = allStudents.filter(s => s.placementStatus?.isPlaced);
  const avgByCgpaRange = [
    { range: '6.0-7.0', min: 6, max: 7 },
    { range: '7.0-8.0', min: 7, max: 8 },
    { range: '8.0-9.0', min: 8, max: 9 },
    { range: '9.0-10.0', min: 9, max: 10 },
  ].map(({ range, min, max }) => {
    const students = placedStudents.filter(s => s.cgpa >= min && s.cgpa < max);
    const avgPkg = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.placementStatus.package || 0), 0) / students.length * 10) / 10
      : 0;
    return { range, avgPackage: avgPkg, count: students.length };
  });

  // Overall placement forecast
  const totalUnplaced = predictions.length;
  const likelyToGetPlaced = predictions.filter(p => p.probability >= 60).length;
  const atRisk = predictions.filter(p => p.probability < 40).length;

  res.json({
    success: true,
    data: {
      predictions,
      deptPredictions,
      topDemandedSkills,
      skillGaps,
      salaryByGrade: avgByCgpaRange,
      forecast: {
        totalUnplaced,
        likelyToGetPlaced,
        atRisk,
        moderate: totalUnplaced - likelyToGetPlaced - atRisk,
        predictedPlacementRate: totalUnplaced > 0 ? Math.round((likelyToGetPlaced / totalUnplaced) * 100) : 0,
      },
    },
  });
});

// GET /api/student/career-insights — Personalized predictive insights for a student
const getStudentCareerInsights = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId', 'name');
  if (!profile) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const { probability, factors, riskLevel, recommendations } = calculatePlacementProbability(profile);

  // Find best matching jobs
  const activeJobs = await Job.find({ isActive: true, deadline: { $gte: new Date() } });
  const eligibleJobs = activeJobs.filter(j => profile.cgpa >= j.minCGPA);

  // Career path suggestions based on skills
  const careerPaths = suggestCareerPaths(profile);

  // Skill improvement suggestions
  const allJobs = await Job.find({ isActive: true });
  const demandedSkills = {};
  allJobs.forEach(job => {
    (job.requiredSkills || []).forEach(skill => {
      demandedSkills[skill] = (demandedSkills[skill] || 0) + 1;
    });
  });

  const studentSkillsLower = (profile.skills || []).map(s => s.toLowerCase());
  const missingSkills = Object.entries(demandedSkills)
    .filter(([skill]) => !studentSkillsLower.includes(skill.toLowerCase()))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, demand]) => ({ skill, demand, reason: `Required by ${demand} active job(s)` }));

  // SGPA trend analysis
  const sgpaTrend = (profile.semesterGrades || [])
    .sort((a, b) => a.semester - b.semester)
    .map(g => ({ semester: g.semester, sgpa: g.sgpa }));

  let trendDirection = 'stable';
  if (sgpaTrend.length >= 3) {
    const recent = sgpaTrend.slice(-3);
    const avgRecent = recent.reduce((s, g) => s + g.sgpa, 0) / recent.length;
    const older = sgpaTrend.slice(0, -3);
    if (older.length > 0) {
      const avgOlder = older.reduce((s, g) => s + g.sgpa, 0) / older.length;
      if (avgRecent > avgOlder + 0.3) trendDirection = 'improving';
      else if (avgRecent < avgOlder - 0.3) trendDirection = 'declining';
    }
  }

  // Peer comparison
  const allUnplaced = await StudentProfile.find({
    department: profile.department,
    'placementStatus.isPlaced': false,
  });
  const peerRank = allUnplaced
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .findIndex(s => s.userId.toString() === profile.userId._id.toString()) + 1;

  res.json({
    success: true,
    data: {
      placementProbability: probability,
      riskLevel,
      factors,
      recommendations,
      eligibleJobCount: eligibleJobs.length,
      totalActiveJobs: activeJobs.length,
      careerPaths,
      missingSkills,
      sgpaTrend,
      trendDirection,
      peerComparison: {
        rank: peerRank,
        total: allUnplaced.length,
        department: profile.department,
      },
    },
  });
});

// ── HELPER FUNCTIONS ──

function calculatePlacementProbability(student) {
  let probability = 0;
  const factors = {};

  // CGPA factor (30 points)
  const cgpaScore = Math.min((student.cgpa / 10) * 30, 30);
  factors.cgpa = { score: Math.round(cgpaScore), max: 30, label: 'Academic Performance' };
  probability += cgpaScore;

  // Skills (20 points)
  const skillScore = Math.min((student.skills?.length || 0) * 3, 20);
  factors.skills = { score: Math.round(skillScore), max: 20, label: 'Technical Skills' };
  probability += skillScore;

  // Projects (15 points)
  const projectScore = Math.min((student.projects?.length || 0) * 5, 15);
  factors.projects = { score: Math.round(projectScore), max: 15, label: 'Projects' };
  probability += projectScore;

  // Internships (15 points)
  const internScore = Math.min((student.internships?.length || 0) * 7.5, 15);
  factors.internships = { score: Math.round(internScore), max: 15, label: 'Internships' };
  probability += internScore;

  // Certifications (5 points)
  const certScore = Math.min((student.certifications?.length || 0) * 2.5, 5);
  factors.certifications = { score: Math.round(certScore), max: 5, label: 'Certifications' };
  probability += certScore;

  // Portfolio links (5 points)
  let portfolioScore = 0;
  if (student.github) portfolioScore += 2.5;
  if (student.linkedin) portfolioScore += 2.5;
  factors.portfolio = { score: Math.round(portfolioScore), max: 5, label: 'Portfolio' };
  probability += portfolioScore;

  // SGPA trend bonus (5 points)
  const grades = (student.semesterGrades || []).sort((a, b) => a.semester - b.semester);
  let trendScore = 0;
  if (grades.length >= 3) {
    const last3 = grades.slice(-3).map(g => g.sgpa);
    if (last3[2] > last3[0]) trendScore = 5;
    else if (last3[2] === last3[0]) trendScore = 2.5;
  }
  factors.trend = { score: Math.round(trendScore), max: 5, label: 'Grade Trend' };
  probability += trendScore;

  // Backlogs penalty (-5 each)
  const totalBacklogs = grades.reduce((sum, g) => sum + (g.backlogs || 0), 0);
  const backlogPenalty = Math.min(totalBacklogs * 5, 15);
  factors.backlogs = { score: -Math.round(backlogPenalty), max: 0, label: 'Backlogs (penalty)' };
  probability -= backlogPenalty;

  probability = Math.round(Math.max(0, Math.min(probability, 100)));

  let riskLevel = 'low';
  if (probability < 40) riskLevel = 'high';
  else if (probability < 65) riskLevel = 'medium';

  // Generate recommendations
  const recommendations = [];
  if ((student.skills?.length || 0) < 4) recommendations.push('Add more technical skills (aim for 5+)');
  if ((student.projects?.length || 0) < 2) recommendations.push('Build at least 2 portfolio projects');
  if ((student.internships?.length || 0) < 1) recommendations.push('Complete at least 1 internship');
  if (!student.github) recommendations.push('Add your GitHub profile');
  if (!student.linkedin) recommendations.push('Add your LinkedIn profile');
  if ((student.certifications?.length || 0) < 2) recommendations.push('Get certified in relevant technologies');
  if (student.cgpa < 7.5) recommendations.push('Focus on improving CGPA above 7.5');
  if (totalBacklogs > 0) recommendations.push('Clear all backlogs as priority');

  return { probability, factors, riskLevel, recommendations: recommendations.slice(0, 5) };
}

function suggestCareerPaths(profile) {
  const skills = (profile.skills || []).map(s => s.toLowerCase());
  const interests = (profile.interests || []).map(s => s.toLowerCase());
  const all = [...skills, ...interests];
  const paths = [];

  if (all.some(s => ['react', 'node.js', 'javascript', 'full stack', 'web dev', 'mongodb', 'express'].includes(s))) {
    paths.push({ title: 'Full Stack Developer', match: 'High', salary: '6-25 LPA', growth: 'Very High', steps: ['Master React + Node.js', 'Build 3+ full-stack projects', 'Learn cloud deployment (AWS/GCP)', 'Apply to product companies'] });
  }
  if (all.some(s => ['python', 'machine learning', 'ai/ml', 'tensorflow', 'deep learning', 'nlp', 'data'].includes(s))) {
    paths.push({ title: 'ML/AI Engineer', match: 'High', salary: '8-30 LPA', growth: 'Very High', steps: ['Complete ML specialization', 'Build end-to-end ML projects', 'Publish research or blog posts', 'Target AI-focused companies'] });
  }
  if (all.some(s => ['java', 'spring boot', 'backend', 'microservices', 'kafka'].includes(s))) {
    paths.push({ title: 'Backend Engineer', match: 'High', salary: '8-35 LPA', growth: 'High', steps: ['Master system design', 'Learn distributed systems', 'Contribute to open source', 'Practice DSA for interviews'] });
  }
  if (all.some(s => ['docker', 'kubernetes', 'aws', 'devops', 'cloud', 'terraform', 'sre'].includes(s))) {
    paths.push({ title: 'DevOps/Cloud Engineer', match: 'High', salary: '10-35 LPA', growth: 'Very High', steps: ['Get AWS/GCP certified', 'Build CI/CD pipelines', 'Learn Infrastructure as Code', 'Master container orchestration'] });
  }
  if (all.some(s => ['sql', 'statistics', 'tableau', 'excel', 'data analyst', 'analytics'].includes(s))) {
    paths.push({ title: 'Data Analyst', match: 'High', salary: '5-18 LPA', growth: 'High', steps: ['Master SQL and Python', 'Learn visualization tools', 'Build analysis portfolios', 'Get Google Data Analytics cert'] });
  }
  if (all.some(s => ['embedded', 'vlsi', 'arduino', 'iot', 'embedded c', 'rtos'].includes(s))) {
    paths.push({ title: 'Embedded/IoT Engineer', match: 'High', salary: '6-20 LPA', growth: 'High', steps: ['Master RTOS and firmware', 'Build IoT prototypes', 'Learn PCB design basics', 'Apply to semiconductor firms'] });
  }
  if (all.some(s => ['autocad', 'solidworks', 'catia', 'design', 'manufacturing'].includes(s))) {
    paths.push({ title: 'Design/CAD Engineer', match: 'High', salary: '5-15 LPA', growth: 'Moderate', steps: ['Get CATIA/SolidWorks certified', 'Build design portfolio', 'Learn simulation tools (ANSYS)', 'Target core engineering firms'] });
  }

  // Always suggest a default
  if (paths.length === 0) {
    paths.push({ title: 'Software Developer', match: 'Moderate', salary: '4-12 LPA', growth: 'High', steps: ['Learn a programming language deeply', 'Build portfolio projects', 'Practice problem-solving', 'Start applying broadly'] });
  }

  return paths.slice(0, 4);
}

module.exports = {
  getExternalJobs,
  getPredictiveAnalytics,
  getStudentCareerInsights,
};
