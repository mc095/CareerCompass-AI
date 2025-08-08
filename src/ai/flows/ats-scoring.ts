// This file uses server-side code.
'use server';

/**
 * @fileOverview This file defines the ATS scoring flow, which evaluates a resume's compatibility with a job description.
 *
 * - atsScoring - A function that handles the ATS scoring process.
 * - AtsScoringInput - The input type for the atsScoring function.
 * - AtsScoringOutput - The return type for the atsScoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AtsScoringInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      'The resume content as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  jobDescription: z.string().describe('The job description to compare the resume against.'),
});
export type AtsScoringInput = z.infer<typeof AtsScoringInputSchema>;

const AtsScoringOutputSchema = z.object({
  score: z.number().describe('The ATS score, representing the compatibility between the resume and the job description (0-100).'),
  areasForImprovement: z.string().describe('Specific areas in the resume that need improvement to better match the job description.'),
  matchRateExplanation: z.string().describe('A detailed explanation of the match rate and how it was determined.'),
});
export type AtsScoringOutput = z.infer<typeof AtsScoringOutputSchema>;

export async function atsScoring(input: AtsScoringInput): Promise<AtsScoringOutput> {
  return atsScoringFlow(input);
}

const atsScoringPrompt = ai.definePrompt({
  name: 'atsScoringPrompt',
  input: {schema: AtsScoringInputSchema},
  output: {schema: AtsScoringOutputSchema},
  prompt: `You are an AI-powered Applicant Tracking System (ATS) expert. You will evaluate a resume against a given job description and provide an ATS score, areas for improvement, and a match rate explanation.

  Score is on the scale of 0 to 100, with 100 being the best possible score.

  Provide areas for improvement and a detailed explanation of the match rate.

  Resume:
  {{media url=resumeDataUri}}

  Job Description:
  {{jobDescription}}`,
});

const atsScoringFlow = ai.defineFlow(
  {
    name: 'atsScoringFlow',
    inputSchema: AtsScoringInputSchema,
    outputSchema: AtsScoringOutputSchema,
  },
  async input => {
    const {output} = await atsScoringPrompt(input);
    return output!;
  }
);
