import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Hero } from "../components/features/Hero";
import { SourcesStrip } from "../components/features/SourcesStrip";
import { Features } from "../components/features/Features";

export default function Home() {
  return (
    <div className="pageLayout">
      <Header />
      <main>
        <Hero />
        <SourcesStrip />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
