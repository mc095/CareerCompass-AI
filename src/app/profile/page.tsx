import { AppLayout } from "@/components/app-layout";
import { ProfileForm } from "./profile-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline tracking-tight">User Profile</h1>
            <p className="text-muted-foreground">Manage your information and resume.</p>
        </div>
        <ProfileForm />
      </div>
    </AppLayout>
  );
}
