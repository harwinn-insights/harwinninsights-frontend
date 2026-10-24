import globalMap from "../assets/global-map.jpg";

import travel from "../assets/industry-travel.jpg";
import technology from "../assets/industry-technology.jpg";
import retail from "../assets/industry-retail.jpg";
import finance from "../assets/industry-finance.jpg";
const regions = [
  {
    title: "Americas",
    image: travel ,
    countries: [
      "United States",
      "Canada",
      "Mexico",
      "Brazil",
      "Argentina",
      "Colombia",
      "Chile",
      "Peru",
    ],
  },
  
  {
    title: "Europe",
    image: technology,
    countries: [
      "United Kingdom",
      "Germany",
      "France",
      "Italy",
      "Spain",
      "Netherlands",
      "Switzerland",
      "Sweden",
      "Norway",
      "Denmark",
      "Belgium",
      "Poland",
      "Ireland",
    ],
  },
  {
    title: "Asia-Pacific",
    image: retail,
    countries: [
      "India",
      "China",
      "Japan",
      "Australia",
      "New Zealand",
      "Singapore",
      "Indonesia",
      "Malaysia",
      "Thailand",
      "Vietnam",
      "Philippines",
      "South Korea",
    ],
  },
  {
    title: "Middle East & Africa",
    image: finance,
    countries: [
      "UAE",
      "Saudi Arabia",
      "Qatar",
      "Kuwait",
      "Israel",
      "South Africa",
      "Nigeria",
      "Kenya",
      "Egypt",
      "Morocco",
    ],
  },
];

function GlobalCoverage() {
  return (
    <section
      id="industries"
      className="relative overflow-hidden bg-white py-24 sm:py-28"
    >
      {/* WORLD MAP BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={globalMap}
          alt=""
          className="absolute right-[-8%] top-0 h-[520px] w-[70%] object-cover opacity-[0.08] mix-blend-multiply"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* HEADER */}
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-[#a87920]" />

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a87920]">
                Our Global Presence
              </p>
            </div>

            <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-[#8f0808] sm:text-6xl">
              Global Reach.
              <br />
              <span className="text-[#a87920]">Local Insights.</span>
            </h2>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              HARWINN supports research across continents, countries,
              cultures, and consumer groups with a blend of global capability
              and local expertise.
            </p>

            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#8f0808] px-7 py-4 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#700606]"
            >
              Explore Global Coverage
              <span className="text-lg">→</span>
            </a>
          </div>

          {/* MAP VISUAL */}
          <div className="relative hidden min-h-[360px] lg:block">
            <img
              src={globalMap}
              alt="Global research coverage"
              className="absolute inset-0 h-full w-full object-contain opacity-100 mix-blend-multiply"
            />

            

            
          </div>
        </div>

        {/* REGION CARDS */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {regions.map((region) => (
            <article
              key={region.title}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={region.image}
                  alt={region.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                <h3 className="absolute bottom-5 left-5 text-xl font-black uppercase tracking-wide text-white">
                  {region.title}
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {region.countries.map((country) => (
                    <span
                      key={country}
                      className="text-xs leading-5 text-slate-600"
                    >
                      {country}
                    </span>
                  ))}
                </div>

                <a
                  href="#contact"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#8f0808] transition group-hover:text-[#a87920]"
                >
                  View Details
                  <span>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

       
      </div>
    </section>
  );
}

export default GlobalCoverage;