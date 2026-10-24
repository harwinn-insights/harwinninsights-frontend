import { useState } from "react";

const faqs = [
  {
    question: "What does HARWINN INSIGHTS do?",
    answer:
      "HARWINN INSIGHTS provides market research fieldwork, participant recruitment, qualitative and quantitative research support, and consulting solutions for brands, agencies and insight teams.",
  },
  {
    question: "What types of research projects do you support?",
    answer:
      "We support consumer research, user research, field interviews, quantitative studies, recruitment-led assignments and customised research projects.",
  },
  
  {
    question: "Do you offer both fieldwork and research consulting?",
    answer:
      "Yes. Our capabilities can cover participant sourcing, fieldwork coordination, research execution and consulting support depending on the project requirements.",
  },
  {
    question: "Which industries do you serve?",
    answer:
      "We work across BFSI, FMCG, consumer technology, gaming, food and beverage, IT and digital services, healthcare, education, e-commerce, automotive and other sectors.",
  },
  {
    question: "Do you support research across India?",
    answer:
      "Yes. Our research model is designed to support projects across cities, towns and wider Indian markets through fieldwork and recruitment networks.",
  },
  {
    question: "How can I start a research project?",
    answer:
      "Simply get in touch with our team and share your research objective, target audience, location and timeline. We can then recommend a suitable research approach.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="bg-white py-24 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">

        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
            FAQ
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-14 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="text-sm font-bold text-slate-950 sm:text-base">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-lg transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 px-6 py-5">
                    <p className="text-sm leading-7 text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default FAQ;