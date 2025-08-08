import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Sparkles, Target, HelpCircle, BookUser, MessagesSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserProgress } from "./user-progress";


const features = [
    {
      icon: FileText,
      title: "Resume Builder",
      description: "Upload and manage your resume to be used across the entire application.",
      href: "/resume-builder",
      cta: "Manage Resume",
    },
    {
      icon: Sparkles,
      title: "Resume Enhancement",
      description: "Get AI-powered suggestions to improve your resume for a specific job.",
      href: "/resume-enhancer",
      cta: "Enhance Resume",
    },
    {
      icon: Target,
      title: "ATS Score Checker",
      description: "See how your resume scores against a job description and get feedback.",
      href: "/ats-checker",
      cta: "Check Score",
    },
    {
      icon: HelpCircle,
      title: "MCQ Test Generation",
      description: "Generate a multiple-choice quiz based on a job title to test your knowledge.",
      href: "/mcq-test",
      cta: "Start Test",
    },
    {
      icon: BookUser,
      title: "Personalized Tutoring",
      description: "Our AI tutor will help you master concepts for your desired job role.",
      href: "/tutoring",
      cta: "Get Tutoring",
    },
    {
      icon: MessagesSquare,
      title: "AI Mock Interview",
      description: "Practice your interview skills with an AI that asks relevant questions.",
      href: "/mock-interview",
      cta: "Start Interview",
    },
  ];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to CareerCompass. Here are your tools to land your dream job.</p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Your Progress</CardTitle>
                <CardDescription>A summary of your skills based on your activities.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserProgress />
            </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3 rounded-md">
                        <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <Link href={feature.href}>
                    {feature.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
