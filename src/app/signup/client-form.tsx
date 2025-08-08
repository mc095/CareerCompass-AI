'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signupUser } from "@/app/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ClientSignupForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    try {
      const name = formData.get('full-name') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      
      if (!name || !email || !password) {
        setError('All fields are required');
        return;
      }

      await signupUser({ name, email, password });
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    }
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-2 rounded-md">
          {error}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="full-name">Full Name</Label>
        <Input id="full-name" name="full-name" placeholder="John Doe" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
        Create an account
      </Button>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/" className="underline">
          Login
        </Link>
      </div>
    </form>
  );
}
