// src/app/project/om/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OfferingMemorandumRedirect() {
    const params = useParams();
    const router = useRouter();
    const projectId = params?.id as string;
    
    useEffect(() => {
        if (projectId) {
            router.replace(`/project/om/${projectId}/dashboard`);
        }
    }, [projectId, router]);
    
    return null;
}