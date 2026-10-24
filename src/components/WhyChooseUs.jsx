const reasons = [
  {
    number: "01",
    title: "Quality First",
    text: "Every research engagement is handled with a strong focus on respondent quality, data reliability and execution.",
  },
  {
    number: "02",
    title: "Research Expertise",
    text: "Our approach combines fieldwork experience, market understanding and practical research thinking.",
  },

  {
    number: "03",
    title: "Fast & Flexible",
    text: "We adapt our research approach to project timelines, audience requirements and changing business needs.",
  },
  {
    number: "04",
    title: "Actionable Insights",
    text: "We focus on findings that can support real business decisions instead of simply producing data.",
  },
];

function WhyChooseUs() {
  return (
    <section className="bg-slate-950 py-24 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
              Why Harwinn
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              More than data.
              <span className="block text-cyan-300">Meaningful insight.</span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-8 text-slate-400">
              We combine people, research and technology to help businesses see
              their markets more clearly.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => (
              <div
                key={reason.number}
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-cyan-300">
                    {reason.number}
                  </span>

                  <span className="text-xl text-slate-600 transition group-hover:text-cyan-300">
                    ↗
                  </span>
                </div>

                <h3 className="mt-10 text-xl font-bold">{reason.title}</h3>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {reason.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
