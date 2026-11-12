/**
 * Seed script – populates the database with sample data.
 * Run: npm run seed  (from the backend directory)
 * WARNING: This script clears existing data before inserting seed data.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const Interview = require('../models/Interview');
const Outcome = require('../models/Outcome');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gradious-talent-tracker';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Student.deleteMany({}),
    Company.deleteMany({}),
    Drive.deleteMany({}),
    Interview.deleteMany({}),
    Outcome.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // --- Companies ---
  const companies = await Company.insertMany([
    {
      name: 'TechSoft Solutions',
      industry: 'Software',
      website: 'https://techsoft.example.com',
      description: 'Leading software development company specializing in enterprise solutions.',
      contactEmail: 'hr@techsoft.example.com',
      contactPerson: 'Priya Sharma',
    },
    {
      name: 'Infovision Analytics',
      industry: 'Data Analytics',
      website: 'https://infovision.example.com',
      description: 'Data analytics and AI-driven insights company.',
      contactEmail: 'recruit@infovision.example.com',
      contactPerson: 'Arun Kumar',
    },
    {
      name: 'CloudNine Systems',
      industry: 'Cloud Computing',
      website: 'https://cloudnine.example.com',
      description: 'Cloud infrastructure and DevOps consulting firm.',
      contactEmail: 'careers@cloudnine.example.com',
      contactPerson: 'Meena Pillai',
    },
    {
      name: 'FinEdge Technologies',
      industry: 'Fintech',
      website: 'https://finedge.example.com',
      description: 'Fintech startup building payment and banking solutions.',
      contactEmail: 'hr@finedge.example.com',
      contactPerson: 'Rahul Nair',
    },
    {
      name: 'ByteCraft Innovations',
      industry: 'Product',
      website: 'https://bytecraft.example.com',
      description: 'Product company focused on SaaS tools for SMEs.',
      contactEmail: 'talent@bytecraft.example.com',
      contactPerson: 'Sneha Reddy',
    },
  ]);
  console.log(`✅ Seeded ${companies.length} companies`);

  // --- Students ---
  const students = await Student.insertMany([
    {
      name: 'Aarav Mehta',
      email: 'aarav.mehta@student.gradious.in',
      phone: '9876543210',
      department: 'CSE',
      graduationYear: 2025,
      cgpa: 8.7,
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      placementStatus: 'Placed',
      tenthPercent: 92,
      twelfthPercent: 88,
    },
    {
      name: 'Divya Krishnan',
      email: 'divya.krishnan@student.gradious.in',
      phone: '9876543211',
      department: 'CSE',
      graduationYear: 2025,
      cgpa: 9.1,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
      placementStatus: 'Placed',
      tenthPercent: 95,
      twelfthPercent: 91,
    },
    {
      name: 'Karthik Subramaniam',
      email: 'karthik.s@student.gradious.in',
      phone: '9876543212',
      department: 'ECE',
      graduationYear: 2025,
      cgpa: 7.8,
      skills: ['Embedded Systems', 'C', 'VLSI', 'MATLAB'],
      placementStatus: 'In Progress',
      tenthPercent: 85,
      twelfthPercent: 82,
    },
    {
      name: 'Priya Anand',
      email: 'priya.anand@student.gradious.in',
      phone: '9876543213',
      department: 'IT',
      graduationYear: 2025,
      cgpa: 8.2,
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
      placementStatus: 'In Progress',
      tenthPercent: 90,
      twelfthPercent: 86,
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.verma@student.gradious.in',
      phone: '9876543214',
      department: 'CSE',
      graduationYear: 2025,
      cgpa: 7.2,
      skills: ['Python', 'Django', 'PostgreSQL'],
      placementStatus: 'Not Placed',
      tenthPercent: 78,
      twelfthPercent: 75,
    },
    {
      name: 'Sneha Patel',
      email: 'sneha.patel@student.gradious.in',
      phone: '9876543215',
      department: 'AIDS',
      graduationYear: 2025,
      cgpa: 9.3,
      skills: ['Data Science', 'Python', 'R', 'Tableau', 'Power BI'],
      placementStatus: 'Placed',
      tenthPercent: 96,
      twelfthPercent: 93,
    },
    {
      name: 'Vikram Narayanan',
      email: 'vikram.n@student.gradious.in',
      phone: '9876543216',
      department: 'AIML',
      graduationYear: 2025,
      cgpa: 8.5,
      skills: ['Deep Learning', 'PyTorch', 'NLP', 'Computer Vision'],
      placementStatus: 'Placed',
      tenthPercent: 88,
      twelfthPercent: 85,
    },
    {
      name: 'Lakshmi Moorthy',
      email: 'lakshmi.m@student.gradious.in',
      phone: '9876543217',
      department: 'CSE',
      graduationYear: 2026,
      cgpa: 8.0,
      skills: ['Go', 'Kubernetes', 'AWS', 'Terraform'],
      placementStatus: 'Not Placed',
      tenthPercent: 84,
      twelfthPercent: 80,
    },
    {
      name: 'Arjun Singh',
      email: 'arjun.singh@student.gradious.in',
      phone: '9876543218',
      department: 'ME',
      graduationYear: 2025,
      cgpa: 7.5,
      skills: ['CAD', 'ANSYS', 'SolidWorks', 'Python'],
      placementStatus: 'Not Placed',
      tenthPercent: 82,
      twelfthPercent: 79,
    },
    {
      name: 'Kavitha Rajan',
      email: 'kavitha.r@student.gradious.in',
      phone: '9876543219',
      department: 'IT',
      graduationYear: 2025,
      cgpa: 8.9,
      skills: ['React', 'TypeScript', 'GraphQL', 'Firebase'],
      placementStatus: 'In Progress',
      tenthPercent: 91,
      twelfthPercent: 89,
    },
  ]);
  console.log(`✅ Seeded ${students.length} students`);

  // --- Drives ---
  const now = new Date();
  const drives = await Drive.insertMany([
    {
      company: companies[0]._id,
      role: 'Software Engineer',
      description: 'Full-stack development role working on enterprise web applications.',
      package: 8.5,
      driveDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      lastDateToApply: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      eligibilityCriteria: {
        minCGPA: 7.0,
        allowedDepartments: ['CSE', 'IT', 'AIDS', 'AIML'],
        graduationYear: 2025,
      },
      jobType: 'Full Time',
      location: 'Hyderabad',
      status: 'Completed',
      registeredStudents: [students[0]._id, students[1]._id, students[3]._id, students[4]._id, students[9]._id],
    },
    {
      company: companies[1]._id,
      role: 'Data Analyst',
      description: 'Analyze large datasets to derive business insights.',
      package: 7.0,
      driveDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      lastDateToApply: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      eligibilityCriteria: {
        minCGPA: 7.5,
        allowedDepartments: ['CSE', 'AIDS', 'AIML', 'IT'],
        graduationYear: 2025,
      },
      jobType: 'Full Time',
      location: 'Bangalore',
      status: 'Completed',
      registeredStudents: [students[1]._id, students[5]._id, students[6]._id],
    },
    {
      company: companies[2]._id,
      role: 'DevOps Engineer',
      description: 'Manage CI/CD pipelines and cloud infrastructure.',
      package: 9.0,
      driveDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
      lastDateToApply: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      eligibilityCriteria: {
        minCGPA: 7.0,
        allowedDepartments: ['CSE', 'IT'],
        graduationYear: 2025,
      },
      jobType: 'Full Time',
      location: 'Pune',
      status: 'Upcoming',
      registeredStudents: [students[7]._id],
    },
    {
      company: companies[3]._id,
      role: 'Backend Developer',
      description: 'Build scalable REST APIs for our fintech platform.',
      package: 10.0,
      driveDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
      lastDateToApply: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
      eligibilityCriteria: {
        minCGPA: 8.0,
        allowedDepartments: ['CSE', 'IT', 'AIDS'],
        graduationYear: 2025,
      },
      jobType: 'Full Time',
      location: 'Mumbai',
      status: 'Upcoming',
      registeredStudents: [students[0]._id, students[3]._id, students[9]._id],
    },
    {
      company: companies[4]._id,
      role: 'ML Engineer',
      description: 'Develop and deploy machine learning models for our SaaS products.',
      package: 12.0,
      driveDate: new Date(now.getFullYear(), now.getMonth() - 2, 5),
      lastDateToApply: new Date(now.getFullYear(), now.getMonth() - 2, 1),
      eligibilityCriteria: {
        minCGPA: 8.0,
        allowedDepartments: ['AIML', 'AIDS', 'CSE'],
        graduationYear: 2025,
      },
      jobType: 'Full Time',
      location: 'Chennai',
      status: 'Completed',
      registeredStudents: [students[1]._id, students[5]._id, students[6]._id],
    },
  ]);
  console.log(`✅ Seeded ${drives.length} drives`);

  // --- Interviews ---
  const interviews = await Interview.insertMany([
    // TechSoft drive - Aarav
    {
      student: students[0]._id,
      drive: drives[0]._id,
      roundNumber: 1,
      roundType: 'Aptitude',
      scheduledAt: new Date(now.getFullYear(), now.getMonth() - 1, 15, 9, 0),
      conductedAt: new Date(now.getFullYear(), now.getMonth() - 1, 15, 9, 30),
      feedback: 'Good performance in quantitative and logical sections.',
      score: 85,
      status: 'Completed',
      result: 'Passed',
    },
    {
      student: students[0]._id,
      drive: drives[0]._id,
      roundNumber: 2,
      roundType: 'Technical',
      scheduledAt: new Date(now.getFullYear(), now.getMonth() - 1, 15, 11, 0),
      conductedAt: new Date(now.getFullYear(), now.getMonth() - 1, 15, 11, 30),
      interviewerName: 'Ravi Kumar',
      feedback: 'Excellent understanding of React and Node.js. Handled system design well.',
      score: 90,
      status: 'Completed',
      result: 'Passed',
    },
    {
      student: students[0]._id,
      drive: drives[0]._id,
      roundNumber: 3,
      roundType: 'HR',
      scheduledAt: new Date(now.getFullYear(), now.getMonth() - 1, 16, 10, 0),
      conductedAt: new Date(now.getFullYear(), now.getMonth() - 1, 16, 10, 30),
      interviewerName: 'Priya Sharma',
      feedback: 'Great communication and cultural fit. Ready for the role.',
      score: 92,
      status: 'Completed',
      result: 'Passed',
    },
    // TechSoft drive - Rohan (rejected)
    {
      student: students[4]._id,
      drive: drives[0]._id,
      roundNumber: 1,
      roundType: 'Aptitude',
      scheduledAt: new Date(now.getFullYear(), now.getMonth() - 1, 15, 9, 0),
      conductedAt: new Date(now.getFullYear(), now.getMonth() - 1, 15, 9, 30),
      feedback: 'Below average performance in aptitude.',
      score: 55,
      status: 'Completed',
      result: 'Failed',
    },
    // Infovision drive - Sneha
    {
      student: students[5]._id,
      drive: drives[1]._id,
      roundNumber: 1,
      roundType: 'Aptitude',
      scheduledAt: new Date(now.getFullYear(), now.getMonth() - 1, 20, 9, 0),
      conductedAt: new Date(now.getFullYear(), now.getMonth() - 1, 20, 9, 30),
      feedback: 'Excellent analytical skills.',
      score: 95,
      status: 'Completed',
      result: 'Passed',
    },
    {
      student: students[5]._id,
      drive: drives[1]._id,
      roundNumber: 2,
      roundType: 'Technical',
      scheduledAt: new Date(now.getFullYear(), now.getMonth() - 1, 20, 11, 0),
      conductedAt: new Date(now.getFullYear(), now.getMonth() - 1, 20, 11, 30),
      interviewerName: 'Arun Kumar',
      feedback: 'Strong knowledge of data science concepts and tools.',
      score: 91,
      status: 'Completed',
      result: 'Passed',
    },
    // ByteCraft drive - Vikram
    {
      student: students[6]._id,
      drive: drives[4]._id,
      roundNumber: 1,
      roundType: 'Coding',
      scheduledAt: new Date(now.getFullYear(), now.getMonth() - 2, 5, 9, 0),
      conductedAt: new Date(now.getFullYear(), now.getMonth() - 2, 5, 9, 30),
      feedback: 'Strong algorithmic thinking. Solved all problems efficiently.',
      score: 88,
      status: 'Completed',
      result: 'Passed',
    },
    {
      student: students[6]._id,
      drive: drives[4]._id,
      roundNumber: 2,
      roundType: 'Technical',
      scheduledAt: new Date(now.getFullYear(), now.getMonth() - 2, 5, 11, 0),
      conductedAt: new Date(now.getFullYear(), now.getMonth() - 2, 5, 11, 30),
      interviewerName: 'Sneha Reddy',
      feedback: 'Deep knowledge of PyTorch and deployment pipelines.',
      score: 93,
      status: 'Completed',
      result: 'Passed',
    },
    // Kavitha - upcoming interview
    {
      student: students[9]._id,
      drive: drives[3]._id,
      roundNumber: 1,
      roundType: 'Aptitude',
      scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 9, 0),
      status: 'Scheduled',
      result: 'Pending',
    },
  ]);
  console.log(`✅ Seeded ${interviews.length} interviews`);

  // --- Outcomes ---
  const outcomes = await Outcome.insertMany([
    {
      student: students[0]._id,
      drive: drives[0]._id,
      result: 'Selected',
      offeredPackage: 8.5,
      offeredRole: 'Software Engineer',
      offerLocation: 'Hyderabad',
      offerLetterDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
      joiningDate: new Date(now.getFullYear(), now.getMonth() + 5, 1),
      remarks: 'Offer accepted.',
    },
    {
      student: students[4]._id,
      drive: drives[0]._id,
      result: 'Rejected',
      remarks: 'Did not clear aptitude round.',
    },
    {
      student: students[1]._id,
      drive: drives[1]._id,
      result: 'Selected',
      offeredPackage: 7.0,
      offeredRole: 'Data Analyst',
      offerLocation: 'Bangalore',
      offerLetterDate: new Date(now.getFullYear(), now.getMonth() - 1, 25),
      joiningDate: new Date(now.getFullYear(), now.getMonth() + 5, 1),
      remarks: 'Offer accepted.',
    },
    {
      student: students[5]._id,
      drive: drives[1]._id,
      result: 'Selected',
      offeredPackage: 7.0,
      offeredRole: 'Data Analyst',
      offerLocation: 'Bangalore',
      offerLetterDate: new Date(now.getFullYear(), now.getMonth() - 1, 25),
      joiningDate: new Date(now.getFullYear(), now.getMonth() + 5, 1),
      remarks: 'Offer accepted.',
    },
    {
      student: students[6]._id,
      drive: drives[4]._id,
      result: 'Selected',
      offeredPackage: 12.0,
      offeredRole: 'ML Engineer',
      offerLocation: 'Chennai',
      offerLetterDate: new Date(now.getFullYear(), now.getMonth() - 2, 10),
      joiningDate: new Date(now.getFullYear(), now.getMonth() + 4, 1),
      remarks: 'Highest package this season.',
    },
    {
      student: students[3]._id,
      drive: drives[3]._id,
      result: 'Pending',
      remarks: 'Interview not yet conducted.',
    },
    {
      student: students[9]._id,
      drive: drives[3]._id,
      result: 'Pending',
      remarks: 'Interview scheduled.',
    },
  ]);
  console.log(`✅ Seeded ${outcomes.length} outcomes`);

  console.log('\n🎉 Database seeding complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
