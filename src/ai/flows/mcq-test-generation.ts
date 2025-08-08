'use server';

/**
 * @fileOverview Generates a multiple-choice question (MCQ) test based on a job title.
 *
 * - generateMCQTest - A function that generates an MCQ test.
 * - GenerateMCQTestInput - The input type for the generateMCQTest function.
 * - GenerateMCQTestOutput - The return type for the generateMCQTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMCQTestInputSchema = z.object({
  jobTitle: z.string().describe('The job title for which to generate the MCQ test.'),
});
export type GenerateMCQTestInput = z.infer<typeof GenerateMCQTestInputSchema>;

const GenerateMCQTestOutputSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().describe('The MCQ question.'),
        options: z.array(z.string()).describe('The possible answer options.'),
        correctAnswer: z.string().describe('The correct answer to the question.'),
      })
    )
    .describe('A list of MCQ questions.'),
});
export type GenerateMCQTestOutput = z.infer<typeof GenerateMCQTestOutputSchema>;

export async function generateMCQTest(input: GenerateMCQTestInput): Promise<GenerateMCQTestOutput> {
  return generateMCQTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMCQTestPrompt',
  input: {schema: GenerateMCQTestInputSchema},
  output: {schema: GenerateMCQTestOutputSchema},
  prompt: `You are an expert in creating multiple-choice questions (MCQs) for various job roles.

  Based on the job title provided, generate 30 MCQs that assess the candidate's knowledge and understanding of relevant topics.
  Each question should have 4 options, with only one correct answer. Provide the correct answer along with the question and options.

  Job Title: {{{jobTitle}}}

  Ensure the questions are challenging and cover a range of topics relevant to the job title.
  Format the output as a JSON object with a 'questions' array. Each object in the array should have 'question', 'options', and 'correctAnswer' fields.
  Here is an example of a question:
{
"question": "What is the time complexity of binary search in big O notation?",
"options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
"correctAnswer": "O(log n)"
}

Here is an example of the output:
{
  "questions": [
    {
      "question": "Question 1",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1"
    },
    {
      "question": "Question 2",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 2"
    }
  ]
}
  `,
});

const generateMCQTestFlow = ai.defineFlow(
  {
    name: 'generateMCQTestFlow',
    inputSchema: GenerateMCQTestInputSchema,
    outputSchema: GenerateMCQTestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
