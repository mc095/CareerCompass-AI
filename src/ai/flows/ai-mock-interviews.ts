'use server';

/**
 * @fileOverview An AI agent for conducting mock interviews.
 *
 * - mockInterview - A function that conducts a mock interview based on a resume and job description.
 * - MockInterviewInput - The input type for the mockInterview function.
 * - MockInterviewOutput - The return type for the mockInterview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MockInterviewInputSchema = z.object({
  resume: z
    .string()
    .describe('The user\'s resume in plain text format.'),
  jobDescription: z
    .string()
    .describe('The job description in plain text format.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The conversation history.'),
});
export type MockInterviewInput = z.infer<typeof MockInterviewInputSchema>;

const MockInterviewOutputSchema = z.object({
  response: z
    .string()
    .describe('The next question or response from the AI interviewer.'),
});
export type MockInterviewOutput = z.infer<typeof MockInterviewOutputSchema>;

export async function mockInterview(input: MockInterviewInput): Promise<MockInterviewOutput> {
  return mockInterviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mockInterviewPrompt',
  input: {schema: MockInterviewInputSchema},
  output: {schema: MockInterviewOutputSchema},
  system: `You are an expert AI interviewer. Your goal is to conduct a realistic, text-based mock interview.

You will be given the candidate's resume and the job description.

Your task is to:
1. Start with a brief introduction and explain the interview format.
2. Ask one question at a time. Do not ask multiple questions in a single turn.
3. Wait for the user's response before asking the next question.
4. Your questions should be relevant to the resume and the job description.
5. Keep your responses conversational and engaging.
6. After a reasonable number of questions (5-7), conclude the interview professionally and ask if the candidate has any questions for you.

Here is the candidate's information:

Resume:
{{{resume}}}

Job Description:
{{{jobDescription}}}
`,
  prompt: `Continue the interview. Here is the history so far:
{{#if history}}
{{#each history}}
{{role}}: {{{content}}}
{{/each}}
{{/if}}`,
});

const mockInterviewFlow = ai.defineFlow(
  {
    name: 'mockInterviewFlow',
    inputSchema: MockInterviewInputSchema,
    outputSchema: MockInterviewOutputSchema,
  },
  async (input) => {
    const { history, ...rest } = input;
    const llmResponse = await prompt({
      ...rest,
      history: history || [],
    });

    const output = llmResponse.output?.response;
    if (!output) {
      throw new Error("The AI model did not return a valid response.");
    }
    
    return { response: output };
  }
);
