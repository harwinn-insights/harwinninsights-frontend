import banner from "../assets/harwinn-banner.png";

function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-[#8f0808]"
    >
      <div className="absolute inset-0">
        <img
          src={banner}
          alt="HARWINN Insights"
          className="h-full w-full object-cover object-center"
        />
        
        <div className="absolute inset-0 bg-white/5" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 py-28 sm:px-8 lg:px-10">
        <div className="max-w-2xl">

          <p className="mb-5 inline-flex rounded-full border border-[#a87920]/40 bg-white/85 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8f0808] shadow-lg">
            Global Market Research & Consumer Intelligence
          </p>

          <h1 className="text-5xl font-black leading-[1] tracking-tight text-[#8f0808] sm:text-6xl lg:text-7xl">
            HARWINN
          </h1>

          <h2 className="mt-4 text-2xl font-bold text-[#a87920] sm:text-3xl">
            Harness Insights. Win Decisions.
          </h2>

          <p className="mt-6 max-w-xl text-base font-medium leading-8 text-slate-800 sm:text-lg">
            From one market to the entire world, HARWINN helps businesses
            understand consumers, markets, competitors, and opportunities
            through reliable, actionable research.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Quantitative",
              "Qualitative",
              "B2B",
              "Consumer",
              "Brand",
              "UX",
              "Market Intelligence",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#8f0808]/20 bg-white/75 px-3 py-1.5 text-xs font-semibold text-[#8f0808]"
              >
                {item}
              </span>
            ))}
          </div>

          <p className="mt-7 font-bold text-[#8f0808]">
            Global Reach. Local Understanding. Actionable Insights.
          </p>

          <a
            href="#contact"
            className="mt-8 inline-flex rounded-full bg-[#920909] px-8 py-4 text-sm font-bold text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-[#720606]"
          >
            Start a Project →
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;