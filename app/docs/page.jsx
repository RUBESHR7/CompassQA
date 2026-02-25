"use client";
import React from 'react';
import Documentation from '../../components/Documentation';
import Layout from '../../components/Layout';
import { useRouter } from 'next/navigation';

export default function DocsPage() {
    const router = useRouter();

    return (
        <Layout
            onLogoClick={() => router.push('/')}
            onDocsClick={() => router.push('/docs')}
            onHistoryClick={() => router.push('/history')}
        >
            <Documentation />
        </Layout>
    );
}
