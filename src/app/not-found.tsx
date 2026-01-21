import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold font-headline">404</h1>
        <p className="text-xl text-[var(--color-text-secondary)]">Page not found</p>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
          The page you're looking for doesn't exist. Make sure you're using the correct form link format: <code className="bg-[var(--color-border)] px-2 py-1 rounded">/view/formId</code>
        </p>
        <Link href="/">
          <Button className="mt-4">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
