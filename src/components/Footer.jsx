function Footer() {
  return (
    <footer className="bg-[#650606] text-white">

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">

          <div>
            <h2 className="text-3xl font-black tracking-[0.12em]">
              HARWINN
            </h2>


            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#d8b45b]">
              Insights
            </p>

            <p className="mt-6 max-w-md text-sm leading-7 text-white/60">
              Global Market Research & Consumer Intelligence.
            </p>

            <p className="mt-4 text-sm font-semibold text-white/80">
              Harness Insights. Win Decisions.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d8b45b]">
              Navigate
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/60">
              <a href="#home" className="hover:text-white">
                Home
              </a>

              <a href="#about" className="hover:text-white">
                About Us
              </a>

              <a href="#services" className="hover:text-white">
                Services
              </a>

              <a href="#industries" className="hover:text-white">
                Global Coverage
              </a>

              <a href="#contact" className="hover:text-white">
                Contact
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d8b45b]">
              Contact
            </h3>

            <div className="mt-5 text-sm leading-7 text-white/60">
              <p>36, Phase I, Dundahera Village, Sector 20, Gurugram, Haryana – 122016</p>

              <a
                href="mailto:admin@harwinninsights.com"
                className="mt-2 block hover:text-white"
              >
                admin@harwinninsights.com
              </a>
            </div>
          </div>

        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} HARWINN INSIGHTS. All rights reserved.
          </p>

          <p>
            Global Reach. Local Understanding. Actionable Insights.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;