require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const AlumniProfile = require('../models/AlumniProfile');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const MentorshipRequest = require('../models/MentorshipRequest');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await AlumniProfile.deleteMany({});
    await Job.deleteMany({});
    await Notification.deleteMany({});
    await MentorshipRequest.deleteMany({});
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(12);

    // ── ADMIN ──
    const adminPass = await bcrypt.hash('Admin@123', salt);
    const admin = await User.create({
      name: 'Dr. Placement Admin',
      email: 'admin@placeiq.com',
      password: adminPass,
      role: 'admin',
      isApproved: true,
    });
    console.log('Admin seeded');

    // ── STUDENTS ──
    const studentPass = await bcrypt.hash('Student@123', salt);
    const studentsData = [
      { name: 'Aarav Sharma', usn: '1RV21CS001', dept: 'CSE', cgpa: 9.2, phone: '9876543201', skills: ['JavaScript', 'React', 'Node.js', 'Python'], interests: ['Full Stack', 'Web Dev'], placed: true, company: 'Google', role: 'SDE-1', pkg: 35, prefRoles: ['Full Stack Developer', 'Frontend Developer'], prefLocs: ['Bangalore', 'Hyderabad'], expectedPkg: 30, grades: [{ semester: 1, sgpa: 8.6, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 8.9, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 9.0, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 9.3, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 9.4, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 9.5, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 9.6, credits: 22, backlogs: 0 }] },
      { name: 'Diya Patel', usn: '1RV21CS002', dept: 'CSE', cgpa: 8.8, phone: '9876543202', skills: ['Python', 'Django', 'SQL', 'Machine Learning'], interests: ['Backend', 'AI/ML'], placed: true, company: 'Amazon', role: 'SDE', pkg: 28, prefRoles: ['Data Scientist', 'ML Engineer'], prefLocs: ['Hyderabad', 'Bangalore'], expectedPkg: 25, grades: [{ semester: 1, sgpa: 8.2, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 8.5, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 8.7, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 9.0, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 9.1, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 8.9, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 9.2, credits: 22, backlogs: 0 }] },
      { name: 'Vihan Reddy', usn: '1RV21CS003', dept: 'CSE', cgpa: 9.5, phone: '9876543203', skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'], interests: ['Backend', 'Cloud'], placed: true, company: 'Microsoft', role: 'Software Engineer', pkg: 42, prefRoles: ['Backend Developer', 'Cloud Engineer'], prefLocs: ['Hyderabad', 'Pune'], expectedPkg: 35, grades: [{ semester: 1, sgpa: 9.0, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 9.2, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 9.4, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 9.5, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 9.6, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 9.7, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 9.8, credits: 22, backlogs: 0 }] },
      { name: 'Ananya Iyer', usn: '1RV21EC001', dept: 'ECE', cgpa: 8.5, phone: '9876543204', skills: ['VLSI', 'Embedded C', 'Arduino', 'Python'], interests: ['Embedded Systems', 'IoT'], placed: true, company: 'Intel', role: 'Hardware Engineer', pkg: 22, prefRoles: ['Embedded Engineer', 'VLSI Designer'], prefLocs: ['Bangalore'], expectedPkg: 18, grades: [{ semester: 1, sgpa: 8.0, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 8.2, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 8.4, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 8.6, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 8.7, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 8.8, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 8.8, credits: 22, backlogs: 0 }] },
      { name: 'Rohan Kumar', usn: '1RV21EC002', dept: 'ECE', cgpa: 7.8, phone: '9876543205', skills: ['Signal Processing', 'MATLAB', 'Python'], interests: ['Signal Processing', 'Data'], placed: false, prefRoles: ['Data Analyst'], prefLocs: ['Bangalore', 'Pune'], expectedPkg: 10, grades: [{ semester: 1, sgpa: 7.2, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 7.5, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 7.8, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 8.0, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 7.9, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 8.1, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 8.0, credits: 22, backlogs: 0 }] },
      { name: 'Sneha Gupta', usn: '1RV21IS001', dept: 'ISE', cgpa: 9.0, phone: '9876543206', skills: ['React', 'TypeScript', 'GraphQL', 'AWS'], interests: ['Frontend', 'Cloud'], placed: true, company: 'Flipkart', role: 'Frontend Dev', pkg: 18, prefRoles: ['Frontend Developer', 'Full Stack Developer'], prefLocs: ['Bangalore'], expectedPkg: 15, grades: [{ semester: 1, sgpa: 8.5, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 8.8, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 9.0, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 9.1, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 9.2, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 9.0, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 9.3, credits: 22, backlogs: 0 }] },
      { name: 'Arjun Nair', usn: '1RV21IS002', dept: 'ISE', cgpa: 8.3, phone: '9876543207', skills: ['Java', 'Android', 'Kotlin', 'Firebase'], interests: ['Mobile Dev', 'Android'], placed: true, company: 'Infosys', role: 'Systems Engineer', pkg: 6, prefRoles: ['Android Developer', 'Mobile Developer'], prefLocs: ['Mysore', 'Bangalore'], expectedPkg: 8, grades: [{ semester: 1, sgpa: 7.8, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 8.0, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 8.2, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 8.4, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 8.5, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 8.5, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 8.6, credits: 22, backlogs: 0 }] },
      { name: 'Priya Menon', usn: '1RV21ME001', dept: 'MECH', cgpa: 8.0, phone: '9876543208', skills: ['AutoCAD', 'SolidWorks', 'Python', 'MATLAB'], interests: ['Design', 'Manufacturing'], placed: true, company: 'Tata Motors', role: 'Design Engineer', pkg: 8, prefRoles: ['Design Engineer', 'Product Designer'], prefLocs: ['Pune', 'Chennai'], expectedPkg: 7, grades: [{ semester: 1, sgpa: 7.5, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 7.8, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 8.0, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 8.1, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 8.2, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 8.1, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 8.3, credits: 22, backlogs: 0 }] },
      { name: 'Karthik Rao', usn: '1RV21ME002', dept: 'MECH', cgpa: 7.5, phone: '9876543209', skills: ['CATIA', 'Ansys', '3D Printing'], interests: ['Automotive', 'Design'], placed: false, prefRoles: ['Mechanical Engineer'], prefLocs: ['Pune', 'Chennai', 'Bangalore'], expectedPkg: 6, grades: [{ semester: 1, sgpa: 7.0, credits: 24, backlogs: 1 }, { semester: 2, sgpa: 7.2, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 7.4, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 7.6, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 7.8, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 7.7, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 7.8, credits: 22, backlogs: 0 }] },
      { name: 'Meera Joshi', usn: '1RV21CS004', dept: 'CSE', cgpa: 8.7, phone: '9876543210', skills: ['Python', 'TensorFlow', 'NLP', 'Deep Learning'], interests: ['AI/ML', 'NLP'], placed: true, company: 'Wipro', role: 'Data Scientist', pkg: 12, prefRoles: ['Data Scientist', 'ML Engineer', 'AI Researcher'], prefLocs: ['Bangalore', 'Hyderabad'], expectedPkg: 15, grades: [{ semester: 1, sgpa: 8.3, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 8.5, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 8.6, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 8.8, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 8.9, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 9.0, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 8.8, credits: 22, backlogs: 0 }] },
      { name: 'Sahil Khan', usn: '1RV21CS005', dept: 'CSE', cgpa: 7.2, phone: '9876543211', skills: ['HTML', 'CSS', 'JavaScript', 'PHP'], interests: ['Web Dev', 'Frontend'], placed: false, prefRoles: ['Frontend Developer', 'Web Developer'], prefLocs: ['Bangalore', 'Remote'], expectedPkg: 6, grades: [{ semester: 1, sgpa: 6.8, credits: 24, backlogs: 1 }, { semester: 2, sgpa: 7.0, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 7.1, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 7.3, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 7.4, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 7.5, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 7.3, credits: 22, backlogs: 0 }] },
      { name: 'Tanvi Desai', usn: '1RV21IS003', dept: 'ISE', cgpa: 8.9, phone: '9876543212', skills: ['Vue.js', 'Node.js', 'MongoDB', 'Express'], interests: ['Full Stack', 'Startup'], placed: false, prefRoles: ['Full Stack Developer', 'Startup Engineer'], prefLocs: ['Bangalore', 'Remote'], expectedPkg: 12, grades: [{ semester: 1, sgpa: 8.4, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 8.6, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 8.8, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 9.0, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 9.1, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 9.0, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 9.2, credits: 22, backlogs: 0 }] },
      { name: 'Nikhil Shetty', usn: '1RV21EC003', dept: 'ECE', cgpa: 6.8, phone: '9876543213', skills: ['C++', 'Robotics', 'ROS', 'Python'], interests: ['Robotics', 'Automation'], placed: false, prefRoles: ['Robotics Engineer'], prefLocs: ['Bangalore', 'Pune'], expectedPkg: 8, grades: [{ semester: 1, sgpa: 6.2, credits: 24, backlogs: 2 }, { semester: 2, sgpa: 6.5, credits: 24, backlogs: 1 }, { semester: 3, sgpa: 6.8, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 7.0, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 7.1, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 7.0, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 7.2, credits: 22, backlogs: 0 }] },
      { name: 'Ishita Agarwal', usn: '1RV21CS006', dept: 'CSE', cgpa: 9.8, phone: '9876543214', skills: ['Go', 'Kubernetes', 'Terraform', 'AWS', 'Docker'], interests: ['DevOps', 'Cloud', 'SRE'], placed: false, prefRoles: ['DevOps Engineer', 'Cloud Engineer', 'SRE'], prefLocs: ['Bangalore', 'Hyderabad', 'Remote'], expectedPkg: 25, grades: [{ semester: 1, sgpa: 9.5, credits: 24, backlogs: 0 }, { semester: 2, sgpa: 9.6, credits: 24, backlogs: 0 }, { semester: 3, sgpa: 9.7, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 9.8, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 9.9, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 9.8, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 10.0, credits: 22, backlogs: 0 }] },
      { name: 'Aditya Verma', usn: '1RV21ME003', dept: 'MECH', cgpa: 6.5, phone: '9876543215', skills: ['AutoCAD', 'MS Office', 'Basic Python'], interests: ['Management', 'Consulting'], placed: false, prefRoles: ['Management Trainee', 'Consultant'], prefLocs: ['Mumbai', 'Delhi'], expectedPkg: 5, grades: [{ semester: 1, sgpa: 6.0, credits: 24, backlogs: 2 }, { semester: 2, sgpa: 6.2, credits: 24, backlogs: 1 }, { semester: 3, sgpa: 6.4, credits: 26, backlogs: 0 }, { semester: 4, sgpa: 6.5, credits: 26, backlogs: 0 }, { semester: 5, sgpa: 6.7, credits: 24, backlogs: 0 }, { semester: 6, sgpa: 6.8, credits: 24, backlogs: 0 }, { semester: 7, sgpa: 6.9, credits: 22, backlogs: 0 }] },
    ];

    const studentUsers = [];
    for (const s of studentsData) {
      const user = await User.create({
        name: s.name,
        email: `${s.usn.toLowerCase()}@placeiq.com`,
        password: studentPass,
        role: 'student',
        isApproved: true,
      });

      const profileData = {
        userId: user._id,
        usn: s.usn,
        department: s.dept,
        cgpa: s.cgpa,
        phone: s.phone,
        skills: s.skills,
        interests: s.interests,
        semester: 7,
        semesterGrades: s.grades || [],
        preferredRoles: s.prefRoles || [],
        preferredLocations: s.prefLocs || [],
        expectedPackage: s.expectedPkg || undefined,
        internships: [
          { company: 'Tech Corp', role: 'Intern', duration: '2 months', description: 'Worked on web development projects' },
        ],
        projects: [
          { title: `${s.interests[0]} Project`, description: `A comprehensive project on ${s.interests[0]}`, techStack: s.skills.slice(0, 2).join(', '), link: 'https://github.com/example' },
        ],
        certifications: [
          { name: `${s.skills[0]} Certification`, issuer: 'Coursera', year: 2024, link: 'https://coursera.org' },
        ],
        github: `https://github.com/${s.name.split(' ')[0].toLowerCase()}`,
        linkedin: `https://linkedin.com/in/${s.name.split(' ')[0].toLowerCase()}`,
      };

      if (s.placed) {
        profileData.placementStatus = {
          isPlaced: true,
          company: s.company,
          role: s.role,
          package: s.pkg,
        };
      }

      // Calculate performance score
      let score = 0;
      score += s.cgpa * 5;
      score += Math.min(s.skills.length * 2, 15);
      score += 5; // 1 project
      score += 5; // 1 internship
      score += 2.5; // 1 certification
      profileData.performanceScore = Math.round(Math.min(score, 100));

      await StudentProfile.create(profileData);
      studentUsers.push(user);
    }
    console.log('15 Students seeded');

    // ── ALUMNI ──
    const alumniPass = await bcrypt.hash('Alumni@123', salt);
    const alumniData = [
      { name: 'Rajesh Kumar', dept: 'CSE', batch: 2020, company: 'Google', role: 'Senior SDE', salary: 45, bio: 'Passionate about distributed systems and mentoring fresh graduates.', mentor: true, careerPath: [{ company: 'TCS', role: 'Developer', year: 2020 }, { company: 'Google', role: 'SDE', year: 2022 }, { company: 'Google', role: 'Senior SDE', year: 2024 }], adviceTopics: ['Career Guidance', 'Interview Prep', 'Company Insights'], specializations: ['System Design', 'Distributed Systems', 'DSA'] },
      { name: 'Priya Sharma', dept: 'CSE', batch: 2021, company: 'Infosys', role: 'Tech Lead', salary: 18, bio: 'Full stack developer with expertise in cloud technologies.', mentor: true, careerPath: [{ company: 'Infosys', role: 'Systems Engineer', year: 2021 }, { company: 'Infosys', role: 'Tech Lead', year: 2023 }], adviceTopics: ['Career Guidance', 'Skill Development', 'Resume Review'], specializations: ['Full Stack', 'Cloud Computing', 'React'] },
      { name: 'Amit Patel', dept: 'ECE', batch: 2020, company: 'TCS', role: 'Project Manager', salary: 15, bio: 'From electronics to IT management.', mentor: false, careerPath: [{ company: 'TCS', role: 'Developer', year: 2020 }, { company: 'TCS', role: 'Project Manager', year: 2023 }], adviceTopics: [], specializations: ['Project Management'] },
      { name: 'Neha Gupta', dept: 'ISE', batch: 2022, company: 'Wipro', role: 'Data Analyst', salary: 10, bio: 'Data enthusiast helping others break into analytics.', mentor: true, careerPath: [{ company: 'Wipro', role: 'Data Analyst', year: 2022 }], adviceTopics: ['Career Guidance', 'Skill Development', 'Higher Studies'], specializations: ['Data Analytics', 'SQL', 'Python'] },
      { name: 'Vikram Singh', dept: 'CSE', batch: 2021, company: 'Amazon', role: 'SDE-2', salary: 38, bio: 'Systems design expert. Ask me about FAANG interviews!', mentor: true, careerPath: [{ company: 'Flipkart', role: 'SDE-1', year: 2021 }, { company: 'Amazon', role: 'SDE-2', year: 2023 }], adviceTopics: ['Interview Prep', 'Career Guidance', 'Company Insights', 'Career Switch'], specializations: ['System Design', 'Java', 'AWS'] },
      { name: 'Kavita Reddy', dept: 'CSE', batch: 2023, company: 'Flipkart', role: 'Backend Developer', salary: 22, bio: 'Specialized in microservices architecture.', mentor: false, careerPath: [{ company: 'Flipkart', role: 'Backend Developer', year: 2023 }], adviceTopics: [], specializations: ['Microservices', 'Spring Boot'] },
      { name: 'Suresh Nair', dept: 'MECH', batch: 2020, company: 'Accenture', role: 'Consultant', salary: 12, bio: 'Transitioned from mechanical engineering to IT consulting.', mentor: true, careerPath: [{ company: 'Bosch', role: 'Engineer', year: 2020 }, { company: 'Accenture', role: 'Consultant', year: 2022 }], adviceTopics: ['Career Switch', 'Career Guidance', 'General Advice'], specializations: ['IT Consulting', 'Career Transition'] },
      { name: 'Divya Iyer', dept: 'ECE', batch: 2022, company: 'Deloitte', role: 'Technology Analyst', salary: 14, bio: 'Helping bridge the gap between hardware and software.', mentor: true, careerPath: [{ company: 'Deloitte', role: 'Analyst', year: 2022 }, { company: 'Deloitte', role: 'Technology Analyst', year: 2024 }], adviceTopics: ['Career Guidance', 'Resume Review', 'Skill Development'], specializations: ['Business Analysis', 'Technology Consulting'] },
    ];

    const alumniUsers = [];
    for (const a of alumniData) {
      const user = await User.create({
        name: a.name,
        email: `${a.name.split(' ')[0].toLowerCase()}.alumni@placeiq.com`,
        password: alumniPass,
        role: 'alumni',
        isApproved: true,
      });

      await AlumniProfile.create({
        userId: user._id,
        department: a.dept,
        batchYear: a.batch,
        company: a.company,
        jobRole: a.role,
        salary: a.salary,
        bio: a.bio,
        isAvailableForMentorship: a.mentor,
        careerPath: a.careerPath,
        linkedin: `https://linkedin.com/in/${a.name.split(' ')[0].toLowerCase()}`,
        github: `https://github.com/${a.name.split(' ')[0].toLowerCase()}`,
        email: a.mentor ? `${a.name.split(' ')[0].toLowerCase()}.alumni@placeiq.com` : undefined,
        adviceTopics: a.adviceTopics || [],
        specializations: a.specializations || [],
      });
      alumniUsers.push(user);
    }
    console.log('8 Alumni seeded');

    // ── JOBS ──
    const jobsData = [
      {
        title: 'Software Development Engineer',
        company: 'Google',
        description: 'Join Google as an SDE and work on cutting-edge products used by billions. You will design, develop, test, deploy, maintain, and improve software.',
        requiredSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'System Design'],
        minCGPA: 8.0,
        package: 35,
        location: 'Bangalore',
        type: 'on-campus',
        deadline: new Date('2026-06-30'),
        isActive: true,
      },
      {
        title: 'Data Analyst',
        company: 'Amazon',
        description: 'Analyze large-scale datasets to drive business decisions. Work with cross-functional teams to identify trends and insights.',
        requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Tableau'],
        minCGPA: 7.5,
        package: 18,
        location: 'Hyderabad',
        type: 'on-campus',
        deadline: new Date('2026-05-15'),
        isActive: true,
      },
      {
        title: 'Full Stack Developer',
        company: 'Flipkart',
        description: 'Build scalable e-commerce solutions as a full-stack developer. Work with React, Node.js, and microservices architecture.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
        minCGPA: 7.0,
        package: 22,
        location: 'Bangalore',
        type: 'on-campus',
        deadline: new Date('2026-07-30'),
        isActive: true,
      },
      {
        title: 'Backend Developer',
        company: 'Zomato',
        description: 'Design and maintain backend services for India\'s largest food delivery platform.',
        requiredSkills: ['Java', 'Spring Boot', 'Kafka', 'Redis', 'PostgreSQL'],
        minCGPA: 7.0,
        package: 16,
        location: 'Gurugram',
        type: 'off-campus',
        deadline: new Date('2026-08-31'),
        isActive: true,
      },
      {
        title: 'Cloud Engineer',
        company: 'Microsoft',
        description: 'Work on Azure cloud services. Design, implement, and manage cloud infrastructure for enterprise clients.',
        requiredSkills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform'],
        minCGPA: 8.0,
        package: 30,
        location: 'Hyderabad',
        type: 'off-campus',
        deadline: new Date('2026-06-15'),
        isActive: true,
      },
      {
        title: 'Machine Learning Intern',
        company: 'Infosys',
        description: '6-month internship focused on building ML models for automation. Great opportunity for students interested in AI/ML.',
        requiredSkills: ['Python', 'TensorFlow', 'Machine Learning', 'Statistics'],
        minCGPA: 6.5,
        package: 3,
        location: 'Mysore',
        type: 'internship',
        deadline: new Date('2026-04-30'),
        isActive: true,
      },
    ];

    const createdJobs = [];
    for (const j of jobsData) {
      const job = await Job.create({ ...j, postedBy: admin._id });
      createdJobs.push(job);
    }

    // Add some applicants
    for (let i = 0; i < 4; i++) {
      createdJobs[0].applicants.push({
        studentId: studentUsers[i]._id,
        status: i === 0 ? 'placed' : i === 1 ? 'shortlisted' : 'applied',
      });
    }
    await createdJobs[0].save();

    for (let i = 2; i < 5; i++) {
      createdJobs[1].applicants.push({
        studentId: studentUsers[i]._id,
        status: 'applied',
      });
    }
    await createdJobs[1].save();

    createdJobs[2].applicants.push({ studentId: studentUsers[5]._id, status: 'placed' });
    createdJobs[2].applicants.push({ studentId: studentUsers[11]._id, status: 'applied' });
    await createdJobs[2].save();

    console.log('6 Jobs seeded');

    // ── MENTORSHIP REQUESTS ──
    // Student[10] (Sahil) → Alumni[0] (Rajesh at Google) - pending
    await MentorshipRequest.create({
      studentId: studentUsers[10]._id,
      alumniId: alumniUsers[0]._id,
      message: 'Hi Rajesh, I\'m a CSE student interested in preparing for product company interviews. Could you guide me on how to crack FAANG interviews?',
      topic: 'Interview Prep',
      status: 'pending',
    });

    // Student[13] (Ishita) → Alumni[4] (Vikram at Amazon) - accepted
    await MentorshipRequest.create({
      studentId: studentUsers[13]._id,
      alumniId: alumniUsers[4]._id,
      message: 'Hi Vikram, I have strong DevOps skills and I\'m interested in system design. Would love to learn from your FAANG experience!',
      topic: 'Career Guidance',
      status: 'accepted',
      response: 'Happy to help! Let\'s connect over a call. Send me a message with your availability.',
    });

    // Student[4] (Rohan) → Alumni[7] (Divya at Deloitte) - pending
    await MentorshipRequest.create({
      studentId: studentUsers[4]._id,
      alumniId: alumniUsers[7]._id,
      message: 'Hi Divya, I\'m an ECE student exploring career options between core electronics and IT. Can you share your experience of transitioning?',
      topic: 'Career Switch',
      status: 'pending',
    });

    // Student[11] (Tanvi) → Alumni[1] (Priya at Infosys) - accepted
    await MentorshipRequest.create({
      studentId: studentUsers[11]._id,
      alumniId: alumniUsers[1]._id,
      message: 'Hi Priya, I\'m a full stack developer looking to improve my resume. Could you review it and suggest improvements?',
      topic: 'Resume Review',
      status: 'accepted',
      response: 'Sure! Share your resume in the messages and I\'ll provide detailed feedback.',
    });

    console.log('4 Mentorship Requests seeded');

    // ── NOTIFICATIONS ──
    for (const su of studentUsers) {
      await Notification.create({
        userId: su._id,
        message: 'Welcome to PlaceIQ! Complete your profile to get job recommendations.',
        type: 'info',
      });
    }
    console.log('Notifications seeded');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin:   admin@placeiq.com / Admin@123');
    console.log('Student: 1rv21cs001@placeiq.com / Student@123');
    console.log('Alumni:  rajesh.alumni@placeiq.com / Alumni@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
