'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ShortLinkRedirectPage() {
    const router = useRouter();
    const params = useParams();
    const formId = params.formId as string;

    useEffect(() => {
        if (formId) {
            router.replace(`/view/${formId}`);
        }
    }, [formId, router]);

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
    );
}
