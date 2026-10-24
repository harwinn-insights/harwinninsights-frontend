import quantitative from "../assets/service-quantitative.jpg";
import qualitative from "../assets/service-qualitative.jpg";
import b2b from "../assets/service-b2b.jpg";
import consumer from "../assets/service-consumer.jpg";
import brand from "../assets/service-brand.jpg";
import market from "../assets/service-market.jpg";


const services = [
  {
    title: "Quantitative Research",
    image: quantitative,
    text: "Online surveys, CATI, face-to-face research, market sizing, brand tracking, pricing and segmentation.",
  },
  
  {
    title: "Qualitative Research",
    image: qualitative,
    text: "In-depth interviews, focus groups, online communities, ethnography, UX and behavioural research.",
  },
  {
    title: "B2B & Business Research",
    image: b2b,
    text: "Decision-maker research, expert interviews, competitive intelligence and market opportunity assessment.",
  },
  {
    title: "Consumer & Customer Intelligence",
    image: consumer,
    text: "Consumer insights, customer experience, brand perception, audience profiling and journey mapping.",
  },
  {
    title: "Brand & Marketing Research",
    image: brand,
    text: "Brand health, awareness, equity, campaign testing, creative testing, positioning and pricing.",
  },
  {
    title: "Market Intelligence",
    image: market,
    text: "Market assessment, market entry, competitor analysis, trends, opportunities and strategic intelligence.",
  },
];

function Services() {
  return (
    <section id="services" className="bg-[#faf8f3] py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a87920]">
              What We Do
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#8f0808] sm:text-5xl">
              Research Built Around Your Question.
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              From quantitative studies to strategic market intelligence,
              HARWINN provides research capabilities designed around your
              business objectives.
            </p>
          </div>

          <a
            href="#contact"
            className="w-fit text-sm font-bold text-[#8f0808] hover:text-[#a87920]"
          >
            Explore All Services →
          </a>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.title}
              className="group relative h-[390px] overflow-hidden rounded-[1.5rem] bg-slate-900 shadow-lg"
            >
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-sm font-black text-[#8f0808]">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-xl font-bold text-white">
                  {service.title}
                </h3>

                <p className="mt-3 max-h-0 overflow-hidden text-sm leading-6 text-white/75 opacity-0 transition-all duration-500 group-hover:max-h-28 group-hover:opacity-100">
                  {service.text}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#e0b85d]">
                    Explore
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8f0808]">
                    ↗
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Services;