const steps = [
  {
    number: "01",
    title: "Understand",
    text: "We start by understanding your research objectives, audience and business question.",
  },
  {
    number: "02",
    title: "Design",
    text: "We create a practical research approach aligned with your requirements.",
  },
  {
    number: "03",
    title: "Execute",
    text: "Our team manages recruitment, fieldwork and research execution with quality checks.",
  },
  
  {
    number: "04",
    title: "Deliver",
    text: "We turn research findings into clear, useful and actionable insights.",
  },
];

function Process() {
  return (
    <section className="bg-slate-50 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
            Our Process
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            From question to insight.
          </h2>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">

              {index !== steps.length - 1 && (
                <div className="absolute left-[calc(100%+4px)] top-8 hidden h-px w-5 bg-slate-200 lg:block" />
              )}

              <div className="h-full rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-cyan-300">
                  {step.number}
                </div>

                <h3 className="mt-8 text-xl font-bold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {step.text}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Process;
