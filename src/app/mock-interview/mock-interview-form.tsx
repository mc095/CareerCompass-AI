"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mockInterview } from '@/ai/flows/ai-mock-interviews';
import { getUserProfile } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

const formSchema = z.object({
  jobDescription: z.string().min(1, 'Job description is required.'),
});

type FormValues = z.infer<typeof formSchema>;

type Message = {
    role: 'user' | 'model';
    content: string;
}

export function MockInterviewForm() {
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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

  const handleStartInterview = async (values: FormValues) => {
    setIsInterviewLoading(true);
    setMessages([]);
    try {
      const response = await mockInterview({
        resume: resumeText,
        jobDescription: values.jobDescription,
        history: [],
      });
      setMessages([{ role: 'model', content: response.response }]);
      setIsStarted(true);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an error starting the interview. Please try again.',
      });
    } finally {
      setIsInterviewLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!userResponse.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userResponse }];
    setMessages(newMessages);
    setUserResponse('');
    setIsInterviewLoading(true);

    try {
        const response = await mockInterview({
            resume: resumeText,
            jobDescription: form.getValues('jobDescription'),
            history: newMessages,
        });
        setMessages(m => [...m, { role: 'model', content: response.response }]);
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'The interviewer is having some trouble. Please try again.',
        });
        setMessages(m => m.slice(0, -1)); // Remove the user's message if AI fails
    } finally {
        setIsInterviewLoading(false);
    }
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }
  }, [messages]);

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

  if (!hasResume && !isStarted) {
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
      {!isStarted && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleStartInterview)}>
            <Card>
                <CardHeader>
                    <CardTitle>Prepare for your Interview</CardTitle>
                    <CardDescription>Provide the job description to begin. Your saved resume will be used automatically.</CardDescription>
                </CardHeader>
              <CardContent className="grid gap-6">
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
                <Button type="submit" disabled={isInterviewLoading}>
                  {isInterviewLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start Interview
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}

      {isInterviewLoading && messages.length === 0 && (
        <Card className="mt-6 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <CardTitle className="font-headline">Starting Interview...</CardTitle>
          <CardDescription>The AI interviewer is preparing your questions.</CardDescription>
        </Card>
      )}

      {isStarted && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-headline">Mock Interview in Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border" ref={scrollAreaRef}>
              <div className="p-4 space-y-4">
                {messages.map((message, index) => {
                  const isInterviewer = message.role === 'model';
                  return (
                    <div key={index} className={`flex items-start gap-3 ${isInterviewer ? '' : 'flex-row-reverse'}`}>
                       <div className={`p-2 rounded-full ${isInterviewer ? 'bg-muted' : 'bg-primary'}`}>
                        {isInterviewer ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6 text-primary-foreground" />}
                      </div>
                      <div className={`p-3 rounded-lg max-w-[75%] ${isInterviewer ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  );
                })}
                 {isInterviewLoading && messages.length > 0 && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-muted">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div className="p-3 rounded-lg max-w-[75%] bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Textarea
              placeholder="Type your response..."
              value={userResponse}
              disabled={isInterviewLoading}
              onChange={(e) => setUserResponse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isInterviewLoading) handleSendResponse();
                }
              }}
            />
            <Button onClick={handleSendResponse} disabled={isInterviewLoading}>
                {isInterviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
