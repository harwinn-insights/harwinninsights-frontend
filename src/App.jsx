import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import GlobalCoverage from "./components/GlobalCoverage";
import Blogs from "./components/Blogs";
import Contact from "./components/Contact";
import Footer from "./components/Footer";


function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* 01 — Hero */}
        <Hero />

        {/* 02 — About */}
        <About />

        {/* 03 — Services */}
        <Services />

        {/* 04 — Global Coverage + Industries */}
        <GlobalCoverage />

        {/* Blog / Insights */}
        <Blogs />

        {/* 05 — Contact */}
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

export default App;