'use server';

/**
 * @fileOverview A resume enhancement AI agent.
 *
 * - enhanceResume - A function that handles the resume enhancement process.
 * - EnhanceResumeInput - The input type for the enhanceResume function.
 * - EnhanceResumeOutput - The return type for the enhanceResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceResumeInputSchema = z.object({
  resumeText: z
    .string()
    .describe('The text content of the resume to be enhanced.'),
  jobDescription: z.string().describe('The job description to match the resume against.'),
});
export type EnhanceResumeInput = z.infer<typeof EnhanceResumeInputSchema>;

const EnhanceResumeOutputSchema = z.object({
  enhancedResume: z
    .string()
    .describe('The enhanced resume text with improvements.'),
  suggestions: z
    .string()
    .describe(
      'A list of suggestions for improving the resume, focusing on keywords, formatting, and content optimization.'
    ),
});
export type EnhanceResumeOutput = z.infer<typeof EnhanceResumeOutputSchema>;

export async function enhanceResume(input: EnhanceResumeInput): Promise<EnhanceResumeOutput> {
  return enhanceResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceResumePrompt',
  input: {schema: EnhanceResumeInputSchema},
  output: {schema: EnhanceResumeOutputSchema},
  prompt: `You are an expert resume writer and career advisor. Your task is to enhance the given resume to better match the provided job description. Focus on optimizing keywords, formatting, and content to improve its chances of passing through Applicant Tracking Systems (ATS) and impressing human recruiters.

Resume:
{{{resumeText}}}

Job Description:
{{{jobDescription}}}

Provide an enhanced version of the resume, incorporating relevant keywords from the job description, improving formatting for readability and ATS compatibility, and optimizing content to highlight the candidate's qualifications and achievements relevant to the job. Also, provide a list of specific suggestions for further improvement.

Enhanced Resume:`, //The prompt is now complete
});

const enhanceResumeFlow = ai.defineFlow(
  {
    name: 'enhanceResumeFlow',
    inputSchema: EnhanceResumeInputSchema,
    outputSchema: EnhanceResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
