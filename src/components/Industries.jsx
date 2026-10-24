const industries = [
  "BFSI",
  "FMCG",
  "Consumer Technology",
  "Gaming",
  "Food & Beverage",
  "Healthcare",
  "Retail",
  "Automotive",
];

function Industries() {
  return (
    <section id="industries" className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">


          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
              Industries
            </p>

            <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Insights across industries.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">
              We work across diverse sectors to understand changing
              behaviours, customer expectations and market opportunities.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {industries.map((industry, index) => (
              <div
                key={industry}
                className={`group flex min-h-32 items-end rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
                  index === 1
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-950 hover:bg-slate-100"
                }`}
              >
                <div>
                  <span
                    className={`text-xs ${
                      index === 1 ? "text-cyan-300" : "text-slate-400"
                    }`}
                  >
                    0{index + 1}
                  </span>

                  <h3 className="mt-2 text-base font-bold">
                    {industry}
                  </h3>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

export default Industries;