"use client";
import React from 'react';
import AutomationCycle from '../../components/AutomationCycle';
import Layout from '../../components/Layout';
import { useRouter } from 'next/navigation';

export default function AutomationCyclePage() {
    const router = useRouter();

    return (
        <Layout
            onLogoClick={() => router.push('/')}
            onDocsClick={() => router.push('/docs')}
            onHistoryClick={() => router.push('/history')}
        >
            <AutomationCycle />
        </Layout>
    );
}
