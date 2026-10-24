import aboutImage from "../assets/about-global.jpg";

function About() {
  return (
    <section id="about" className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">

          {/* LEFT CONTENT */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#a87920]">
              About Harwinn
            </p>
            

            <h2 className="mt-7 max-w-3xl text-5xl font-black leading-[1.08] tracking-tight text-[#8f0808] sm:text-6xl">
              Research Without
              <br />
              Borders.
              <br />
              <span className="text-[#b07b18]">
                Insights Without Limits.
              </span>
            </h2>

            <div className="mt-8 max-w-3xl space-y-5 text-[17px] leading-8 text-slate-600">
              <p>
                HARWINN is a global market research and consumer intelligence
                company helping organizations make smarter, more confident
                business decisions.
              </p>

              <p>
                We work across markets, industries, audiences, and cultures,
                combining research expertise, technology, data, and human
                understanding to uncover what truly drives people and
                businesses.
              </p>

              <p>
                Whether you need to understand your customers, evaluate a new
                concept, enter a new market, measure your brand, understand
                competitors, or identify your next growth opportunity —
                HARWINN builds the research around your question.
              </p>
            </div>

            <a
              href="#services"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#8f0808] px-8 py-4 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#700606]"
            >
              Learn More
              <span className="text-lg">→</span>
            </a>
          </div>

          {/* RIGHT IMAGE BOX */}
          <div className="relative overflow-hidden rounded-[38px] bg-[#8f0808] shadow-2xl">
            <img
              src={aboutImage}
              alt="HARWINN Global Intelligence"
              className="h-[570px] w-full object-cover"
            />

            {/* subtle overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#8f0808]/20 via-transparent to-transparent" />

            

            {/* TEXT */}
            <div className="absolute bottom-8 left-8 max-w-[310px] text-white">
              <p className="text-2xl font-black">
                Global Intelligence.
              </p>

              <p className="mt-3 text-sm leading-6 text-white/80">
                Built around your business question, audience and market.
              </p>

              <div className="my-6 h-px w-full bg-white/20" />

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e0b85d]">
                Our Philosophy
              </p>

              <p className="mt-4 text-2xl font-black leading-tight">
                Understand better.
                <br />
                Decide smarter.
                <br />
                Win bigger.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default About;