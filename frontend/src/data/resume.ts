import { ExperienceItem, ProjectItem, SkillCategory } from '../types';

export const PERSONAL_INFO = {
  name: "Rulin (Charlotte) Ma",
  title: "Data Scientist & AI Engineer",
  email: "charlotte.ma0728@gmail.com",
  phone: "416-624-6820",
  location: "Ontario, Canada",
  linkedin: "https://www.linkedin.com/in/charlotte-ma-219720225",
  about: "I am a passionate AI and Data Scientist with a Master's from the University of Waterloo and a Bachelor's from NYU. My expertise lies in building RAG pipelines, LLM applications, and scalable full-stack interfaces. I thrive in bridging the gap between complex machine learning models and user-friendly applications.",
};

export const SKILLS: SkillCategory[] = [
  {
    name: "Languages & Core",
    skills: ["Python", "SQL", "JavaScript/TypeScript", "HTML/CSS", "C++"],
  },
  {
    name: "AI & Machine Learning",
    skills: [
      "PyTorch", "TensorFlow", "LangChain", "RAG", "LLMs", "NLP", 
      "Deep Learning", "Computer Vision", "Time Series Modeling"
    ],
  },
  {
    name: "Web & Backend",
    skills: ["React.js", "FastAPI", "Node.js", "Tailwind CSS", "Flask"],
  },
  {
    name: "Cloud & DevOps",
    skills: ["Azure", "AWS Bedrock", "Docker", "Kubernetes", "Redis", "Microservices"],
  },
  {
    name: "Tools & Platforms",
    skills: ["Git", "Selenium", "Power Automate", "Microsoft Copilot Studio", "Figma"],
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "cgi-2025",
    type: "work",
    title: "AI Scientist",
    company: "CGI Inc.",
    location: "Markham, Canada",
    period: "May 2025 - Dec 2025",
    description: [
      "Developing an AI-powered helpdesk chatbot to automate IT ticket resolution through interactive visual guidance.",
      "Built a RAG pipeline using LangChain and Azure AI Search with hybrid retrieval and recursive chunking.",
      "Developed a full-stack interface using React, TailwindCSS, and FastAPI to generate real-time workflow diagrams.",
      "Optimized latency by 35% using Redis caching; deployed across Microsoft Teams and Amazon Bedrock.",
      "Reduced ticket resolution time by 80%, enabling 3× higher throughput."
    ],
    skills: ["LangChain", "Azure AI", "React", "FastAPI", "Redis"]
  },
  {
    id: "un-2025",
    type: "work",
    title: "Data Scientist Intern",
    company: "United Nations Investigations Section (Global Fund Unit)",
    location: "New York, US",
    period: "Jan 2025 - May 2025",
    description: [
      "Designed and trained a multi-layer anomaly detection pipeline using Isolation Forest and LOF to identify transaction fraud.",
      "Uncovered fraud patterns based on timing, amount, identity, and approval behavior on historical data.",
      "Identified 23 confirmed fraud cases, halting over $1.3 million in disbursements.",
      "Deployed a LangGraph-based agent system that translated natural language prompts into SQL for investigator reporting.",
      "Improved investigative reporting efficiency by ~60% with a 96% satisfaction score."
    ],
    skills: ["Isolation Forest", "LOF", "LangGraph", "SQL", "Fraud Detection"]
  },
  {
    id: "uwaterloo-2024",
    type: "education",
    title: "Master of Data Science and Artificial Intelligence",
    company: "University of Waterloo",
    location: "Ontario, Canada",
    period: "Sept 2024 - May 2026",
    description: [
      "GPA: 4.0/4.0",
      "Focus on Advanced Machine Learning, Large Language Model, and Big Data Infrastructure."
    ],
  },
  {
    id: "xfusion-2024",
    type: "work",
    title: "Software Development Intern",
    company: "xFusion Technologies",
    location: "Zhengzhou, Henan, China",
    period: "May 2024 - Aug 2024",
    description: [
      "Enhanced a cluster management system dashboard by integrating key features into the Rancher Dashboard to streamline Kubernetes cluster management, improving local infrastructure operations.",
      "Spearheaded front-end development for CloudPlatform using Vue2.js and SCSS, delivering features for creation, editing, deletion, and real-time status management, boosting user experience and enhancing status supervision in our HCI product."
    ],
    skills: ["Vue.js", "Kubernetes", "Rancher", "SCSS"]
  },
  {
    id: "nyu-2024",
    type: "education",
    title: "Bachelor of Computer Science and Data Science",
    company: "New York University",
    location: "New York, NY",
    period: "Sept 2020 - May 2024",
    description: [
      "GPA: 3.76/4.0",
      "Minor: Mathematics, Web Programming and Applications.",
      "Relevant Coursework: Machine Learning, Deep Learning, Operating Systems, Algorithms."
    ],
  },
  {
    id: "aersys-2023",
    type: "work",
    title: "Software Development Intern",
    company: "Aersys Inc.",
    location: "New Jersey, US",
    period: "May 2023 - Aug 2023",
    description: [
      "Collaborate to establish a cohesive framework for designing and presenting the interconnected workflows of various modules.",
      "Take the initiative in constructing kiosk ui and AMPLL inventory manager modules using Vite, React, and ensure seamless integration through the utilization of Tailwind CSS and Figma."
    ],
    skills: ["React", "Vite", "Tailwind CSS", "Figma"]
  },
  {
    id: "nyu-it-2022",
    type: "work",
    title: "Student Technology Assistant",
    company: "New York University",
    location: "New York, NY",
    period: "Feb 2022 - May 2024",
    description: [
      "Provide customer service to clients through troubleshooting issues with hardware (poster printers, projectors, consoles), software (Adobe Suite, Microsoft Office Suite, Unity), and other related tasks for Student Center and NYU IT service.",
      "Design and perform technological upgrades and maintenance plans. Execute technological plans to support NYU-featured events and activities."
    ],
    skills: ["Troubleshooting", "Customer Service", "Unity"]
  }
];

export const PROJECTS: ProjectItem[] = [
  {
    id: "emotion-classifier",
    title: "Real-Time Speech Emotion Classifier",
    description: "Built a real-time speech emotion recognition pipeline based on Wav2Vec 2.0. Reached 81% accuracy across 7 categories and implemented real-time testing with a MongoDB backend.",
    techStack: ["Python", "Wav2Vec 2.0", "MongoDB", "Deep Learning"],
    link: "https://github.com/charlottema-dev/speech-emotion-recognition"
  },
  {
    id: "email-ticket-automation",
    title: "AI Email Ticket Creation System",
    description: "AI-powered system to automate IT ticket creation. Built a Power Automate workflow to extract fields from emails and create tickets in BMC Helix. Integrated Azure OpenAI to structure JSON and auto-generate follow-up emails.",
    techStack: ["Power Automate", "Azure OpenAI", "REST APIs", "BMC Helix"],
    link: "#"
  }
];

export const GENERATE_SYSTEM_PROMPT = () => {
  const expString = EXPERIENCE.map(e => 
    `Time Period: ${e.period}\nRole: ${e.title} at ${e.company}\nLocation: ${e.location}\nKey Achievements/Duties:\n${e.description.map(d => `- ${d}`).join('\n')}\nSkills Used: ${e.skills?.join(', ') || 'N/A'}`
  ).join('\n\n');

  const skillsString = SKILLS.map(s => `Category: ${s.name}\nSkills: ${s.skills.join(', ')}`).join('\n\n');

  const projectsString = PROJECTS.map(p => `Project: ${p.title}\nDescription: ${p.description}\nTech Stack: ${p.techStack.join(', ')}`).join('\n\n');

  return `You are an advanced AI Professional Assistant for Charlotte (Rulin) Ma. You are embedded in her personal portfolio website.

  **YOUR OBJECTIVE:**
  To impress potential employers (recruiters, hiring managers, technical leads) and advocate for Charlotte's candidacy as a Data Scientist, AI Engineer, or Software Developer. You must be knowledgeable, professional, and persuasive.

  **YOUR RULES (STRICT):**
  1. **Topic Restriction:** You must ONLY answer questions related to Charlotte Ma's professional background, skills, projects, education, and experience.
  2. **Refusal Strategy:** If a user asks about anything else (e.g., general knowledge, recipes, weather, politics), politely refuse. Example: "I am designed specifically to answer questions about Charlotte's professional experience and qualifications. Would you like to know about her work with RAG pipelines?"
  3. **Evidence-Based:** Always support your claims with evidence from the provided context. If you say she knows Python, mention her Speech Emotion Classifier project or her work at CGI.
  4. **Tone:** Professional, enthusiastic, confident, yet concise. Use first-person plural when referring to "us" as her team, but preferably speak about "Charlotte" in the third person (e.g., "Charlotte developed...", "She led...").
  5. **Call to Action:** If appropriate, encourage the user to download her resume or contact her via email.

  **CHARLOTTE'S CONTEXT:**

  [Contact Details]
  Email: ${PERSONAL_INFO.email}
  Phone: ${PERSONAL_INFO.phone}
  Location: ${PERSONAL_INFO.location}

  LinkedIn: ${PERSONAL_INFO.linkedin}
  Summary: ${PERSONAL_INFO.about}

  [Education]
  - Master of Data Science and AI, University of Waterloo (GPA 4.0/4.0), 2024-2026. Focus: Advanced ML, AI Ethics.
  - Bachelor of Computer Science and Data Science, NYU (GPA 3.76/4.0), 2020-2024. Minor: Math, Web Programming.

  [Work Experience]
  ${expString}

  [Technical Skills]
  ${skillsString}

  [Key Projects]
  ${projectsString}

  **SAMPLE Q&A:**
  Q: "What is her experience with AI?"
  A: "Charlotte is an expert in AI, currently working as an AI Scientist at CGI where she builds RAG pipelines using LangChain and Azure AI. She also implemented anomaly detection algorithms at the UN to prevent fraud."

  Q: "Can she do frontend work?"
  A: "Yes, Charlotte is a versatile developer. At xFusion, she spearheaded frontend development using Vue2.js, and at Aersys, she built kiosk UIs using React and Tailwind CSS."
  `;
};