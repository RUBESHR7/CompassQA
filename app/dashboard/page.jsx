"use client";
import React from 'react';
import Dashboard from '../../components/Dashboard';
import Layout from '../../components/Layout';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    return (
        <Layout
            onLogoClick={() => router.push('/')}
            onDocsClick={() => router.push('/docs')}
            onHistoryClick={() => router.push('/history')}
        >
            <Dashboard />
        </Layout>
    );
}
