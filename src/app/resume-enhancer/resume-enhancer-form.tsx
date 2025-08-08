"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { enhanceResume, EnhanceResumeOutput } from '@/ai/flows/resume-enhancement';
import { getUserProfile } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const formSchema = z.object({
  jobDescription: z.string().min(1, 'Job description is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function ResumeEnhancerForm() {
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [result, setResult] = useState<EnhanceResumeOutput | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [hasResume, setHasResume] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      setIsFormLoading(true);
      try {
        const profile = await getUserProfile();
        if (profile.resumeText) {
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
    setIsEnhancing(true);
    setResult(null);
    try {
      const response = await enhanceResume({
          resumeText,
          jobDescription: values.jobDescription,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an error enhancing your resume. Please try again.',
      });
    } finally {
      setIsEnhancing(false);
    }
  };
  
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
            <CardHeader>
                <CardTitle>Enhance Your Resume</CardTitle>
                <CardDescription>Paste a job description to get AI-powered suggestions. Your saved resume will be used automatically.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the job description here..."
                        className="min-h-[300px] font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isEnhancing}>
                {isEnhancing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enhance Resume
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {isEnhancing && (
        <Card className="mt-6 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <CardTitle className="font-headline">Enhancing...</CardTitle>
          <CardDescription>Our AI is supercharging your resume. This might take a moment.</CardDescription>
        </Card>
      )}

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-md">
                  <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-headline">Your Enhanced Resume</CardTitle>
            </div>
            <CardDescription>Here is the AI-enhanced version of your resume and suggestions for improvement.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Enhanced Resume</h3>
              <Textarea readOnly value={result.enhancedResume} className="min-h-[300px] font-mono bg-muted" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Suggestions</h3>
              <div className="prose prose-sm text-sm text-muted-foreground p-4 bg-muted rounded-md min-h-[300px]">
                {result.suggestions.split('\n').map((line, i) => {
                    if (line.trim().startsWith('-')) {
                        return <p key={i} className="mb-2">{line}</p>;
                    }
                    return <p key={i}>{line}</p>;
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
