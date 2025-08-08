import { AppLayout } from "@/components/app-layout";
import { AtsCheckerForm } from "./ats-checker-form";

export default function AtsCheckerPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline tracking-tight">ATS Score Checker</h1>
            <p className="text-muted-foreground">Upload your resume and a job description to see how you score against the competition.</p>
        </div>
        <AtsCheckerForm />
      </div>
    </AppLayout>
  );
}
