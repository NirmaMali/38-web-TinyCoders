const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const generateAIResponse = async (prompt) => {
  const ai = getGenAI();
  if (!ai) {
    return { error: true, message: 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.' };
  }
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return { error: false, text: response.text() };
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return { error: true, message: 'AI service temporarily unavailable. Please try again later.' };
  }
};

const getJobMatchPrompt = (studentProfile, job) => {
  return `You are an expert career counselor. Analyze the match between this student profile and job posting.

Student Profile:
- Skills: ${studentProfile.skills?.join(', ') || 'None listed'}
- CGPA: ${studentProfile.cgpa}
- Department: ${studentProfile.department}
- Interests: ${studentProfile.interests?.join(', ') || 'None listed'}
- Internships: ${studentProfile.internships?.map(i => `${i.role} at ${i.company}`).join(', ') || 'None'}
- Projects: ${studentProfile.projects?.map(p => p.title).join(', ') || 'None'}

Job Posting:
- Title: ${job.title}
- Company: ${job.company}
- Required Skills: ${job.requiredSkills?.join(', ') || 'None specified'}
- Min CGPA: ${job.minCGPA}
- Description: ${job.description}

Provide:
1. A match score percentage (0-100)
2. A brief explanation of why they match or don't match (2-3 sentences)
3. Two specific tips to improve eligibility

Respond in JSON format: { "score": number, "explanation": "string", "tips": ["string", "string"] }`;
};

const getResumeTipsPrompt = (studentProfile) => {
  return `You are a professional resume coach. Analyze this student profile and give 5 specific, actionable tips to improve their resume for software engineering roles. Be concise.

Student Profile:
- Name: ${studentProfile.userId?.name || 'Student'}
- Department: ${studentProfile.department}
- CGPA: ${studentProfile.cgpa}
- Skills: ${studentProfile.skills?.join(', ') || 'None listed'}
- Interests: ${studentProfile.interests?.join(', ') || 'None listed'}
- Internships: ${studentProfile.internships?.length || 0} internships
- Projects: ${studentProfile.projects?.length || 0} projects
- Certifications: ${studentProfile.certifications?.length || 0} certifications
- GitHub: ${studentProfile.github ? 'Yes' : 'No'}
- LinkedIn: ${studentProfile.linkedin ? 'Yes' : 'No'}

Respond in JSON format: { "tips": ["tip1", "tip2", "tip3", "tip4", "tip5"] }`;
};

const getCareerSuggestPrompt = (studentProfile) => {
  return `You are an expert career advisor. Based on this student's profile, suggest 3 career paths with a brief roadmap for each.

Student Profile:
- Department: ${studentProfile.department}
- Skills: ${studentProfile.skills?.join(', ') || 'None listed'}
- Interests: ${studentProfile.interests?.join(', ') || 'None listed'}
- CGPA: ${studentProfile.cgpa}
- Projects: ${studentProfile.projects?.map(p => `${p.title} (${p.techStack})`).join(', ') || 'None'}

Respond in JSON format: { "careers": [{ "title": "string", "description": "string", "roadmap": ["step1", "step2", "step3"], "expectedSalary": "string" }] }`;
};

module.exports = {
  generateAIResponse,
  getJobMatchPrompt,
  getResumeTipsPrompt,
  getCareerSuggestPrompt,
};
