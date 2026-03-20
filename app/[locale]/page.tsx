import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <div className="overflow-x-hidden">
        <main id="main-content" className="pt-16">
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Contact />
        </main>

        <Footer />
      </div>
    </>
  );
}
