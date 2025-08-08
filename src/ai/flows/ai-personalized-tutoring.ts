'use server';
/**
 * @fileOverview Implements the AI-powered personalized tutoring flow.
 *
 * - aiPersonalizedTutoring - A function that initiates the personalized tutoring process.
 * - AIPersonalizedTutoringInput - The input type for the aiPersonalizedTutoring function.
 * - AIPersonalizedTutoringOutput - The return type for the aiPersonalizedTutoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPersonalizedTutoringInputSchema = z.object({
  jobRole: z.string().describe('The job role the user wants to learn about.'),
  userResume: z.string().describe('The user’s resume.'),
});
export type AIPersonalizedTutoringInput = z.infer<typeof AIPersonalizedTutoringInputSchema>;

const AIPersonalizedTutoringOutputSchema = z.object({
  tutoringSession: z.string().describe('The AI tutor’s initial response and learning plan.'),
});
export type AIPersonalizedTutoringOutput = z.infer<typeof AIPersonalizedTutoringOutputSchema>;

export async function aiPersonalizedTutoring(input: AIPersonalizedTutoringInput): Promise<AIPersonalizedTutoringOutput> {
  return aiPersonalizedTutoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPersonalizedTutoringPrompt',
  input: {schema: AIPersonalizedTutoringInputSchema},
  output: {schema: AIPersonalizedTutoringOutputSchema},
  prompt: `You are an AI Tutor. Your goal is to help a user learn the concepts required for a specific job role, based on their current resume.

  Analyze the user's resume and the target job role. Identify the key skills and knowledge gaps.
  
  Your first response should be:
  1. A friendly introduction.
  2. A brief analysis of their resume in relation to the job role.
  3. A step-by-step learning plan to cover the knowledge gaps.
  4. Your first lesson or question to kick off the tutoring session.

  Engage the user in a conversational, one-by-one teaching style.

  Job Role: {{{jobRole}}}
  User Resume: {{{userResume}}}
  
  Begin the tutoring session now.`,
});

const aiPersonalizedTutoringFlow = ai.defineFlow(
  {
    name: 'aiPersonalizedTutoringFlow',
    inputSchema: AIPersonalizedTutoringInputSchema,
    outputSchema: AIPersonalizedTutoringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
