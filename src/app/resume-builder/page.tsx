import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const templates = [
    { name: "Deedy", url: "https://www.overleaf.com/latex/templates/deedy-resume/bjryvfsjdyxz", imageUrl: "https://writelatex.s3.amazonaws.com/published_ver/10516.jpeg?X-Amz-Expires=14400&X-Amz-Date=20250808T114844Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAWJBOALPNFPV7PVH5/20250808/us-east-1/s3/aws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=7457a0c116c333a29abef95b69780b1388941dab04b1229b56430f1a35ebebef", dataAiHint: "resume template" },
    { name: "FAANG", url: "https://www.overleaf.com/latex/templates/faangpath-simple-template/npsfpdqnxmbc", imageUrl: "https://writelatex.s3.amazonaws.com/published_ver/26352.jpeg?X-Amz-Expires=14400&X-Amz-Date=20250808T114927Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAWJBOALPNFPV7PVH5/20250808/us-east-1/s3/aws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=62ffc7b04c273004fbe55f54af3ea0314d80839ab7ecbd42d0877d8bbb2080e4", dataAiHint: "resume template" },
    { name: "IIT", url: "https://www.overleaf.com/latex/templates/nit-patna-resume-template-v2-dot-1/hkwrzcwrfgqj", imageUrl: "https://writelatex.s3.amazonaws.com/published_ver/37887.jpeg?X-Amz-Expires=14400&X-Amz-Date=20250808T115011Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAWJBOALPNFPV7PVH5/20250808/us-east-1/s3/aws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=b6a6aaf90f86c2d9bfc67a6dddcb6a04fb7f3f00ba1f0cf475e7e64c5f9a098a", dataAiHint: "resume template" }
];


export default function ResumeBuilderPage() {
  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Resume Resources</h1>
            <p className="text-muted-foreground">Manage your resume in your profile, or choose a template below to get started.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Manage Your Resume</CardTitle>
                <CardDescription>Your saved resume is used by the AI features across the app. You can view or edit it on your profile page.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </CardContent>
        </Card>

        <div>
            <div className="space-y-1 mb-4">
                <h2 className="text-2xl font-bold font-headline tracking-tight">ATS-Friendly Templates</h2>
                <p className="text-muted-foreground">Need a professional resume? Start with one of these popular LaTeX templates from Overleaf.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <Card key={template.name} className="overflow-hidden group">
                        <CardContent className="p-0">
                           <Link href={template.url} target="_blank" rel="noopener noreferrer">
                                <Image 
                                    src={template.imageUrl}
                                    alt={`${template.name} resume template`}
                                    width={400}
                                    height={520}
                                    className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                                    data-ai-hint={template.dataAiHint}
                                />
                           </Link>
                        </CardContent>
                        <CardHeader>
                            <CardTitle className="font-headline">{template.name}</CardTitle>
                            <CardDescription>
                                <Link href={template.url} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/80">
                                    View on Overleaf
                                </Link>
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
