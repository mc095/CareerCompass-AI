import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Compass className="h-6 w-6 text-accent" />
      <h1 className="text-xl font-bold font-headline text-foreground">
        CareerCompass AI
      </h1>
    </div>
  );
}
