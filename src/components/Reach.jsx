function Reach() {
  const locations = [
    "Delhi NCR",
    "Mumbai",
    "Bengaluru",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Chandigarh",
    "Pan India",
  ];

  
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white sm:py-28">
      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
              Our Reach
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Research reach
              <span className="block text-cyan-300">
                across India.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400">
              From major cities to emerging markets, our network helps
              research teams connect with the right people and execute
              fieldwork efficiently.
            </p>

            <div className="mt-9 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-bold">Pan</p>
                <p className="mt-1 text-sm text-slate-400">India Coverage</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-bold">360°</p>
                <p className="mt-1 text-sm text-slate-400">Research Support</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 sm:p-9">
            <div className="mb-7 flex items-center justify-between">
              <h3 className="text-lg font-bold">Coverage Network</h3>
              <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                INDIA
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {locations.map((location, index) => (
                <div
                  key={location}
                  className={`rounded-xl border px-4 py-4 text-sm font-medium transition hover:-translate-y-1 ${
                    index === locations.length - 1
                      ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-300"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                  }`}
                >
                  <span className="mr-2 text-cyan-300">•</span>
                  {location}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Reach;