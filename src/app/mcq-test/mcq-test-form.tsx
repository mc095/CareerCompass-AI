"use client";

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateMCQTest, GenerateMCQTestOutput } from '@/ai/flows/mcq-test-generation';
import { updateUserScores } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required.'),
});

type FormValues = z.infer<typeof formSchema>;

const testAnswersSchema = z.object({
    answers: z.record(z.string()),
});
type TestAnswersValues = z.infer<typeof testAnswersSchema>;

export function McqTestForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [test, setTest] = useState<GenerateMCQTestOutput | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: '',
    },
  });

  const testFormMethods = useForm<TestAnswersValues>({
    resolver: zodResolver(testAnswersSchema),
  });

  const handleGenerateTest = async (values: FormValues) => {
    setIsLoading(true);
    setTest(null);
    setSubmitted(false);
    testFormMethods.reset({ answers: {} });
    try {
      const response = await generateMCQTest(values);
      setTest(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an error generating the test. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTest = async (data: TestAnswersValues) => {
    if (!test) return;
    
    let correctAnswers = 0;
    test.questions.forEach((q, index) => {
        if (data.answers[index] === q.correctAnswer) {
            correctAnswers++;
        }
    });

    const calculatedScore = Math.round((correctAnswers / test.questions.length) * 100);
    setScore(calculatedScore);
    setSubmitted(true);

    const jobSkills = {
        "Software Engineer": { "Technical": calculatedScore, "Problem Solving": calculatedScore > 70 ? calculatedScore - 15 : calculatedScore },
        "Product Manager": { "Project Mgmt": calculatedScore, "Communication": calculatedScore > 70 ? calculatedScore - 15 : calculatedScore },
        "UX Designer": { "Problem Solving": calculatedScore, "Teamwork": calculatedScore > 70 ? calculatedScore - 15 : calculatedScore },
    };
    const currentJob = form.getValues("jobTitle");
    const skillsToUpdate = jobSkills[currentJob as keyof typeof jobSkills] || { "Technical": calculatedScore };
    
    try {
        await updateUserScores(skillsToUpdate);
         toast({
            title: "Scores Saved!",
            description: "Your new skill scores have been saved to your profile."
        });
    } catch (e) {
        console.error("Could not update scores in database", e);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not save your scores.',
        });
    }
  };

  return (
    <div className='space-y-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleGenerateTest)}>
          <Card>
            <CardHeader>
                <CardTitle>Generate a Test</CardTitle>
                <CardDescription>Enter a job title to create a custom quiz.</CardDescription>
            </CardHeader>
            <CardContent>
            <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            </CardContent>
            <CardFooter>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Test
            </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      {isLoading && (
        <Card className="mt-6 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <CardTitle className="font-headline">Generating Test...</CardTitle>
          <CardDescription>Our AI is crafting your quiz. This may take a few moments.</CardDescription>
        </Card>
      )}

      {test && (
        <FormProvider {...testFormMethods}>
          <form onSubmit={testFormMethods.handleSubmit(handleSubmitTest)}>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">MCQ Test: {form.getValues('jobTitle')}</CardTitle>
                <CardDescription>Answer the questions below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  {test.questions.map((q, index) => {
                      const fieldName = `answers.${index}`;
                      const userAnswer = testFormMethods.watch(fieldName);

                      return (
                        <div key={index} className="mb-6">
                          <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                          <FormField
                              control={testFormMethods.control}
                              name={fieldName as any}
                              render={({ field }) => (
                                  <FormItem>
                                      <FormControl>
                                          <RadioGroup 
                                              onValueChange={field.onChange}
                                              defaultValue={field.value}
                                              disabled={submitted} 
                                              className='flex flex-col gap-2'
                                          >
                                              {q.options.map((option, i) => {
                                                  const isCorrect = option === q.correctAnswer;
                                                  const isSelected = userAnswer === option;
                                                  
                                                  return (
                                                      <FormItem key={i}>
                                                          <FormControl>
                                                              <Label htmlFor={`q${index}-o${i}`} className={cn("flex items-center space-x-3 p-3 rounded-md border w-full font-normal cursor-pointer",
                                                                  submitted && isCorrect && "bg-green-100 border-green-300",
                                                                  submitted && isSelected && !isCorrect && "bg-red-100 border-red-300",
                                                              )}>
                                                                  <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                                                                  <span>{option}</span>
                                                              </Label>
                                                          </FormControl>
                                                      </FormItem>
                                                  );
                                              })}
                                          </RadioGroup>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          {submitted && (
                              <Accordion type="single" collapsible className="w-full mt-2">
                                  <AccordionItem value="item-1">
                                      <AccordionTrigger className="text-sm">View Explanation</AccordionTrigger>
                                      <AccordionContent className="text-sm text-muted-foreground">
                                      The correct answer is <strong>{q.correctAnswer}</strong>.
                                      </AccordionContent>
                                  </AccordionItem>
                              </Accordion>
                          )}
                        </div>
                      );
                  })}
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                {!submitted ? (
                  <Button type="submit">Submit Test</Button>
                ) : (
                    <div className="p-4 bg-muted rounded-lg w-full">
                        <h3 className="text-xl font-bold font-headline">Test Complete!</h3>
                        <p className="text-muted-foreground">You scored <strong>{score}%</strong>.</p>
                    </div>
                )}
              </CardFooter>
            </Card>
          </form>
        </FormProvider>
      )}
    </div>
  );
}
