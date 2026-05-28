import Groq from "groq-sdk";
import type { AssignmentInput, GeneratedPaper, QuestionType } from "../types/index.js";

function getGroq(): Groq {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const SECTION_MAP: Record<QuestionType, { title: string; instruction: string }> = {
  mcq: {
    title: "Multiple Choice Questions",
    instruction: "Choose the correct option for each question. Each question has only one correct answer.",
  },
  true_false: {
    title: "True or False",
    instruction: "State whether the following statements are True or False.",
  },
  short_answer: {
    title: "Short Answer Questions",
    instruction: "Answer the following questions briefly in 2-3 sentences.",
  },
  long_answer: {
    title: "Long Answer Questions",
    instruction: "Answer the following questions in detail.",
  },
};

const SECTION_LABELS = ["A", "B", "C", "D"];

export function buildPrompt(input: AssignmentInput): string {
  const {
    subject,
    topic,
    questionTypes,
    numberOfQuestions,
    marksPerQuestion,
    difficulty,
    additionalInstructions,
    pdfText,
  } = input;

  const questionsPerType = Math.floor(numberOfQuestions / questionTypes.length);
  const remainder = numberOfQuestions % questionTypes.length;

  const typeDistribution = questionTypes.map((type, i) => ({
    type,
    count: questionsPerType + (i < remainder ? 1 : 0),
    marks: marksPerQuestion[type] || 1,
    label: SECTION_LABELS[i] || String.fromCharCode(65 + i),
  }));

  const totalMarks = typeDistribution.reduce((sum, td) => sum + td.count * td.marks, 0);

  let difficultyInstruction: string;
  if (difficulty === "mixed") {
    difficultyInstruction = `Distribute questions across difficulties:
    - Approximately 30% Easy questions
    - Approximately 40% Medium questions
    - Approximately 30% Hard questions`;
  } else {
    difficultyInstruction = `All questions should be ${difficulty} difficulty.`;
  }

  const sectionDescriptions = typeDistribution
    .map((td) => {
      const section = SECTION_MAP[td.type];
      return `- Section ${td.label} (${section.title}): ${td.count} questions, ${td.marks} mark(s) each`;
    })
    .join("\n");

  const pdfContext = pdfText
    ? `\n\nREFERENCE MATERIAL (use this content to generate relevant questions):\n---\n${pdfText.slice(0, 4000)}\n---`
    : "";

  return `You are an expert exam paper creator for educational institutions. Generate a structured exam paper based on the following specifications.

SUBJECT: ${subject}
TOPIC: ${topic}
TOTAL QUESTIONS: ${numberOfQuestions}
TOTAL MARKS: ${totalMarks}

SECTIONS:
${sectionDescriptions}

DIFFICULTY DISTRIBUTION:
${difficultyInstruction}

${additionalInstructions ? `ADDITIONAL INSTRUCTIONS FROM TEACHER:\n${additionalInstructions}\n` : ""}${pdfContext}

IMPORTANT RULES:
1. Generate EXACTLY the number of questions specified for each section.
2. Each question must be unique, clear, and academically appropriate.
3. For MCQ questions, provide exactly 4 options labeled a), b), c), d). Only one option should be correct.
4. For True/False questions, ensure the correct answer is clearly determinable.
5. Tag each question with its difficulty level: "easy", "medium", or "hard".
6. Questions should test different cognitive levels (recall, understanding, application, analysis).
7. EVERY question MUST include a "correctAnswer" field:
   - For MCQ: the correct option (e.g. "b) Option 2")
   - For True/False: "True" or "False"
   - For Short Answer: a concise model answer (2-3 sentences)
   - For Long Answer: a detailed model answer (1-2 paragraphs)
8. Respond with ONLY valid JSON, no markdown, no code blocks, no explanation.

REQUIRED JSON FORMAT:
{
  "title": "${subject} - ${topic}",
  "totalMarks": ${totalMarks},
  "duration": "calculate appropriate duration based on question count and types",
  "generalInstructions": [
    "All questions are compulsory.",
    "Read each question carefully before answering.",
    "Marks for each question are indicated on the right."
  ],
  "sections": [
    {
      "sectionLabel": "A",
      "sectionTitle": "Multiple Choice Questions",
      "instructions": "Choose the correct option for each question.",
      "totalMarks": 5,
      "questions": [
        {
          "questionNumber": 1,
          "questionText": "The question text here",
          "questionType": "mcq",
          "difficulty": "easy",
          "marks": 1,
          "options": ["a) Option 1", "b) Option 2", "c) Option 3", "d) Option 4"],
          "correctAnswer": "b) Option 2"
        },
        {
          "questionNumber": 2,
          "questionText": "Explain the concept briefly.",
          "questionType": "short_answer",
          "difficulty": "medium",
          "marks": 2,
          "correctAnswer": "A concise model answer in 2-3 sentences."
        }
      ]
    }
  ]
}

Generate the exam paper now. Output ONLY the JSON object.`;
}

export async function generatePaper(input: AssignmentInput): Promise<GeneratedPaper> {
  
  const prompt = buildPrompt(input);

  const completion = await getGroq().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are an expert exam paper creator. You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanation — just the raw JSON object.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 8192,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq");

  return parseResponse(text);
}

// Normalize questionType using keyword matching — LLMs return every possible variant
function normalizeQuestionType(raw: string): string {
  const s = raw.toLowerCase().replace(/[^a-z]/g, ""); // strip all non-alpha
  if (s.includes("long")) return "long_answer";
  if (s.includes("short") || s === "saq") return "short_answer";
  if (s.includes("true") || s.includes("false") || s === "tf") return "true_false";
  if (s.includes("mcq") || s.includes("multi") || s.includes("choice")) return "mcq";
  if (s === "laq") return "long_answer";
  return "mcq"; // safe fallback
}

function normalizeDifficulty(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s.includes("easy")) return "easy";
  if (s.includes("hard") || s.includes("difficult")) return "hard";
  return "medium"; // medium, moderate, or anything else
}

export function parseResponse(raw: string): GeneratedPaper {
  let cleaned = raw.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  // Parse as 'any' so we can freely mutate before casting
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error(
      `Failed to parse LLM response as JSON: ${(e as Error).message}. Raw: ${raw.slice(0, 200)}`
    );
  }

  if (!parsed.title || !parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error("LLM response missing required fields (title, sections)");
  }

  for (const section of parsed.sections) {
    if (!section.questions || !Array.isArray(section.questions)) {
      throw new Error(`Section ${section.sectionLabel} missing questions array`);
    }
    for (const q of section.questions) {
      if (!q.questionText || !q.questionType || !q.difficulty || !q.marks) {
        throw new Error(`Question ${q.questionNumber} missing required fields`);
      }
      q.questionType = normalizeQuestionType(q.questionType);
      q.difficulty = normalizeDifficulty(q.difficulty);
    }
  }

  return parsed as GeneratedPaper;
}
