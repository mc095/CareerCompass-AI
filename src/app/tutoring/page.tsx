import { AppLayout } from "@/components/app-layout";
import { TutoringForm } from "./tutoring-form";

export default function TutoringPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold font-headline tracking-tight">AI Personalized Tutor</h1>
        <p className="text-muted-foreground">
            Struggled on a test? Provide your results, resume, and the job description to get personalized feedback.
        </p>
        <TutoringForm />
      </div>
    </AppLayout>
  );
}
