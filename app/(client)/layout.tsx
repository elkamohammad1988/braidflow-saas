import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 motion-safe:animate-fade-in-up">
        {children}
      </main>
      <Footer />
    </div>
  );
}
