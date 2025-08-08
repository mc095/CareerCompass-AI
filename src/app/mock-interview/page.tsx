import { AppLayout } from "@/components/app-layout";
import { MockInterviewForm } from "./mock-interview-form";

export default function MockInterviewPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold font-headline tracking-tight">AI Mock Interview</h1>
        <p className="text-muted-foreground">
          Practice your interview skills with an AI that asks relevant questions based on your resume and a job description.
        </p>
        <MockInterviewForm />
      </div>
    </AppLayout>
  );
}
