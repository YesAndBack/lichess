import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-lichess-dark-lighter border-t border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>
            Powered by{' '}
            <a
              href="https://lichess.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lichess-green hover:underline"
            >
              Lichess API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
