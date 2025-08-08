"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { aiPersonalizedTutoring } from '@/ai/flows/ai-personalized-tutoring';
import { getUserProfile } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

const formSchema = z.object({
  jobRole: z.string().min(1, 'Job role is required.'),
});

type FormValues = z.infer<typeof formSchema>;

type Message = {
    role: 'tutor' | 'user';
    content: string;
}

// Simple markdown to React component renderer
const SimpleMarkdown = ({ text }: { text: string }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <p className="text-sm whitespace-pre-wrap">
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </p>
    );
};

export function TutoringForm() {
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [hasResume, setHasResume] = useState(false);
  const [resumeText, setResumeText] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    async function loadProfile() {
      setIsFormLoading(true);
      try {
        const profile = await getUserProfile();
        if (profile.resumeText) {
          setHasResume(true);
          setResumeText(profile.resumeText);
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
      jobRole: '',
    },
  });

  const handleStartSession = async (values: FormValues) => {
    setIsSessionLoading(true);
    setMessages([]);
    try {
      const response = await aiPersonalizedTutoring({
        jobRole: values.jobRole,
        userResume: resumeText,
      });
      setMessages([{role: 'tutor', content: response.tutoringSession}]);
      setSessionStarted(true);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an error starting the tutoring session. Please try again.',
      });
    } finally {
      setIsSessionLoading(false);
    }
  };

   const handleSendResponse = () => {
    if (!userResponse.trim()) return;
    const newMessages: Message[] = [...messages, {role: 'user', content: userResponse}];
    setMessages(newMessages);
    setUserResponse('');
    
    // TODO: Implement real conversation logic with the AI tutor flow
    // For now, we'll just mock a response.
    setIsSessionLoading(true);
    setTimeout(() => {
        setMessages(d => [...d, {role: 'tutor', content: "That's a great question! Let's dive deeper into that."}]);
        setIsSessionLoading(false);
    }, 1500)
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

  if (!hasResume) {
    return (
        <Card className="text-center p-8">
            <CardHeader>
                <CardTitle className="font-headline">Resume Required</CardTitle>
                <CardDescription>
                    Please go to your profile to add your resume before starting a tutoring session.
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
      {!sessionStarted && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleStartSession)}>
            <Card>
                <CardHeader>
                    <CardTitle>Start a Tutoring Session</CardTitle>
                    <CardDescription>Enter your desired job role and the AI will create a personalized learning plan based on your resume.</CardDescription>
                </CardHeader>
              <CardContent>
                 <FormField
                  control={form.control}
                  name="jobRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Job Role</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Product Manager"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSessionLoading}>
                  {isSessionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start Tutoring
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}

      {isSessionLoading && !sessionStarted && (
        <Card className="mt-6 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <CardTitle className="font-headline">Building Your Learning Plan...</CardTitle>
          <CardDescription>The AI Tutor is reviewing your resume and the job role.</CardDescription>
        </Card>
      )}

      {sessionStarted && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-headline">Tutoring Session</CardTitle>
             <CardDescription>Chat with your AI tutor to learn new concepts.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border" ref={scrollAreaRef}>
              <div className="p-4 space-y-4">
                {messages.map((message, index) => {
                  const isTutor = message.role === 'tutor';
                  return (
                    <div key={index} className={`flex items-start gap-3 ${isTutor ? '' : 'flex-row-reverse'}`}>
                      <div className={`p-2 rounded-full ${isTutor ? 'bg-muted' : 'bg-primary'}`}>
                        {isTutor ? <Sparkles className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-primary-foreground" />}
                      </div>
                      <div className={`p-3 rounded-lg max-w-[75%] ${isTutor ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                        <SimpleMarkdown text={message.content} />
                      </div>
                    </div>
                  );
                })}
                 {isSessionLoading && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-muted">
                            <Sparkles className="h-6 w-6 text-primary" />
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
              placeholder="Ask a question or respond..."
              value={userResponse}
              disabled={isSessionLoading}
              onChange={(e) => setUserResponse(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!isSessionLoading) handleSendResponse();
                }
              }}
            />
            <Button onClick={handleSendResponse} disabled={isSessionLoading}>
                {isSessionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
