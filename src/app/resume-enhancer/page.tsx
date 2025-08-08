import { AppLayout } from "@/components/app-layout";
import { ResumeEnhancerForm } from "./resume-enhancer-form";

export default function ResumeEnhancerPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline tracking-tight">Resume Enhancer</h1>
          <p className="text-muted-foreground">
            Paste your resume and a job description to get AI-powered suggestions for improvement.
          </p>
        </div>
        <ResumeEnhancerForm />
      </div>
    </AppLayout>
  );
}
