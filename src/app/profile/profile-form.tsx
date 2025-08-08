"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, updateUserProfile } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, 'Name cannot be empty.'),
  resumeText: z.string().min(1, 'Resume text cannot be empty.'),
  profilePicUrl: z.string().url().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileForm() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      resumeText: '',
      profilePicUrl: '',
    },
  });

  const profilePicUrl = form.watch("profilePicUrl");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const profile = await getUserProfile();
        if (profile) {
          form.reset({
            email: profile.email,
            resumeText: profile.resumeText || '',
            profilePicUrl: profile.profilePicUrl || '',
            name: profile.name
          });
        }
      } catch (error) {
         toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your profile.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [form, toast]);

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
        await updateUserProfile(values);
        toast({
          title: 'Profile Saved',
          description: 'Your information has been updated successfully.',
        });
        // Force a reload of the page to update the user nav
        window.location.reload();
    } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save your profile.',
        });
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Information</CardTitle>
          <CardDescription>This information will be used across the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p>Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Your Information</CardTitle>
                <CardDescription>This information will be used across the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="profilePicUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Picture</FormLabel>
                          <div className='flex items-center gap-4'>
                            <Avatar className='h-16 w-16'>
                              <AvatarImage src={profilePicUrl} alt='Profile Picture' />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <FormControl>
                                <Input placeholder="https://example.com/your-image.png" {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="resumeText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Resume</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Paste your resume here..."
                                    className="min-h-[400px] font-mono"
                                    {...field}
                                />
                                </FormControl>
                                 <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </Form>
  );
}
