'use client';
import dynamic from 'next/dynamic';

// Dynamically load BackgroundWaves on client only
// Canvas & requestAnimationFrame don't exist on the server
const BackgroundWaves = dynamic(() => import('./BackgroundWaves'), {
    ssr: false,
});

export default function BackgroundWavesWrapper() {
    return <BackgroundWaves />;
}
