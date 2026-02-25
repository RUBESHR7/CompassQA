import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import BackgroundWavesWrapper from '../components/BackgroundWavesWrapper';

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
                <BackgroundWavesWrapper />
                {children}
            </body>
        </html>
    );
}
