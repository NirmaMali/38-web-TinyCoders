const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const { generateAIResponse, getJobMatchPrompt, getResumeTipsPrompt, getCareerSuggestPrompt } = require('../utils/aiHelper');

// POST /api/ai/match-jobs
const matchJobs = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId', 'name');
  if (!profile) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const activeJobs = await Job.find({ isActive: true, deadline: { $gte: new Date() } });

  const results = await Promise.all(
    activeJobs.slice(0, 5).map(async (job) => {
      const prompt = getJobMatchPrompt(profile, job);
      const aiResult = await generateAIResponse(prompt);

      let aiData = { score: 0, explanation: '', tips: [] };
      if (!aiResult.error) {
        try {
          const cleaned = aiResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          aiData = JSON.parse(cleaned);
        } catch (e) {
          aiData = { score: 50, explanation: aiResult.text.substring(0, 200), tips: ['Update your skills', 'Gain relevant experience'] };
        }
      }

      return {
        jobId: job._id,
        title: job.title,
        company: job.company,
        package: job.package,
        type: job.type,
        matchScore: aiData.score || 0,
        explanation: aiData.explanation || '',
        tips: aiData.tips || [],
      };
    })
  );

  results.sort((a, b) => b.matchScore - a.matchScore);

  res.json({ success: true, data: results });
});

// POST /api/ai/resume-tips
const resumeTips = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId', 'name');
  if (!profile) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const prompt = getResumeTipsPrompt(profile);
  const aiResult = await generateAIResponse(prompt);

  if (aiResult.error) {
    return res.json({
      success: true,
      data: {
        tips: [
          'Add more technical skills relevant to your target roles',
          'Include quantifiable achievements in your project descriptions',
          'Add links to your GitHub repositories and deployed projects',
          'List relevant certifications to stand out',
          'Tailor your resume summary to match the job description',
        ],
        source: 'fallback',
      },
      message: aiResult.message,
    });
  }

  let tips;
  try {
    const cleaned = aiResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    tips = JSON.parse(cleaned);
  } catch (e) {
    tips = { tips: aiResult.text.split('\n').filter(Boolean).slice(0, 5) };
  }

  res.json({ success: true, data: tips });
});

// POST /api/ai/career-suggest
const careerSuggest = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId', 'name');
  if (!profile) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const prompt = getCareerSuggestPrompt(profile);
  const aiResult = await generateAIResponse(prompt);

  if (aiResult.error) {
    return res.json({
      success: true,
      data: {
        careers: [
          {
            title: 'Full Stack Developer',
            description: 'Build end-to-end web applications',
            roadmap: ['Learn React/Node.js', 'Build portfolio projects', 'Apply to product companies'],
            expectedSalary: '6-15 LPA',
          },
          {
            title: 'Data Analyst',
            description: 'Analyze data to drive business decisions',
            roadmap: ['Learn Python/SQL', 'Master data visualization', 'Get certified in analytics'],
            expectedSalary: '5-12 LPA',
          },
          {
            title: 'DevOps Engineer',
            description: 'Automate deployment and infrastructure',
            roadmap: ['Learn Docker/Kubernetes', 'Master CI/CD pipelines', 'Get AWS/Azure certified'],
            expectedSalary: '8-18 LPA',
          },
        ],
        source: 'fallback',
      },
      message: aiResult.message,
    });
  }

  let careers;
  try {
    const cleaned = aiResult.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    careers = JSON.parse(cleaned);
  } catch (e) {
    careers = { careers: [{ title: 'Career Advice', description: aiResult.text.substring(0, 500), roadmap: [], expectedSalary: 'Varies' }] };
  }

  res.json({ success: true, data: careers });
});

module.exports = { matchJobs, resumeTips, careerSuggest };
