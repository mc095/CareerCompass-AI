"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { atsScoring, AtsScoringOutput } from '@/ai/flows/ats-scoring';
import { getUserProfile } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import Link from 'next/link';

const formSchema = z.object({
  jobDescription: z.string().min(1, 'Job description is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function AtsCheckerForm() {
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [result, setResult] = useState<AtsScoringOutput | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [hasResume, setHasResume] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      setIsFormLoading(true);
      try {
        const profile = await getUserProfile();
        if (profile && profile.resumeText) {
            setResumeText(profile.resumeText);
            setHasResume(true);
        } else {
            setHasResume(false);
        }
      } catch (error) {
         setHasResume(false);
      } finally {
        setIsFormLoading(false);
      }
    }
    loadProfile();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsScoring(true);
    setResult(null);
    try {
        const response = await atsScoring({
            resumeDataUri: `data:text/plain;base64,${btoa(resumeText)}`,
            jobDescription: values.jobDescription,
        });
        setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an error scoring your resume. Please try again.',
      });
    } finally {
      setIsScoring(false);
    }
  };

  const scoreData = result ? [{ name: 'score', value: result.score }] : [];

  if (isFormLoading) {
      return (
        <Card className="text-center p-8">
            <CardHeader>
                <CardTitle className="font-headline">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
      );
  }

  if (!hasResume) {
    return (
        <Card className="text-center p-8">
            <CardHeader>
                <CardTitle className="font-headline">Resume Required</CardTitle>
                <CardDescription>
                    Please go to your profile to add your resume before using this feature.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardContent className="p-6 grid gap-6">
                         <FormField
                            control={form.control}
                            name="jobDescription"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Job Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                    placeholder="Paste the job description here..."
                                    className="min-h-[200px]"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                         <Button type="submit" disabled={isScoring}>
                            {isScoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Check Score
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
        {isScoring && (
            <Card className="mt-6 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <CardTitle className="font-headline">Analyzing...</CardTitle>
                <CardDescription>Our AI is checking your resume against the job description. This might take a moment.</CardDescription>
            </Card>
        )}
        {result && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="font-headline">Your ATS Score</CardTitle>
                    <CardDescription>Here is how your resume scores against the job description.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-6">
                        <div className="h-40 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={scoreData} layout="vertical" margin={{ left: -20 }}>
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" barSize={40} radius={[4, 4, 4, 4]}>
                                        <LabelList dataKey="value" position="inside" className="fill-primary-foreground text-2xl font-bold" formatter={(value: number) => `${value}%`} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Areas for Improvement</h3>
                        <p className="text-sm text-muted-foreground">{result.areasForImprovement}</p>
                        <h3 className="text-lg font-semibold mt-4 mb-2">Match Rate Explanation</h3>
                        <p className="text-sm text-muted-foreground">{result.matchRateExplanation}</p>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
