import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import dynamic from 'next/dynamic';

// Load BackgroundWaves client-side only — it uses canvas/requestAnimationFrame
const BackgroundWaves = dynamic(() => import('../components/BackgroundWaves'), {
    ssr: false,
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
});

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-display',
});

export const metadata = {
    title: 'Compass QA - The Future of Test Automation',
    description: 'AI-powered test case generation and automation suite for QA engineers.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="antialiased">
                <BackgroundWaves />
                {children}
            </body>
        </html>
    );
}
