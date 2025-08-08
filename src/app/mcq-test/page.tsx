import { AppLayout } from "@/components/app-layout";
import { McqTestForm } from "./mcq-test-form";

export default function McqTestPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline tracking-tight">MCQ Test Generation</h1>
            <p className="text-muted-foreground">Enter a job title to generate a multiple-choice quiz and test your knowledge.</p>
        </div>
        <McqTestForm />
      </div>
    </AppLayout>
  );
}
