import { config } from 'dotenv';
config();

import '@/ai/flows/ats-scoring.ts';
import '@/ai/flows/mcq-test-generation.ts';
import '@/ai/flows/resume-enhancement.ts';
import '@/ai/flows/ai-mock-interviews.ts';
import '@/ai/flows/ai-personalized-tutoring.ts';