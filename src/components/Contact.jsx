import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

function Contact() {
  const form = useRef();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();

    setSending(true);
    setMessage("");

    
    emailjs
      .sendForm(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        form.current,
        {
          publicKey: "YOUR_PUBLIC_KEY",
        }
      )
      .then(
        () => {
          setMessage(
            "Thank you! Your research inquiry has been sent successfully."
          );

          form.current.reset();
          setSending(false);
        },
        (error) => {
          console.error("EmailJS Error:", error);

          setMessage(
            "Something went wrong. Please try again or contact us directly."
          );

          setSending(false);
        }
      );
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-white py-24 sm:py-28"
    >
      {/* Background Decoration */}
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#a87920]/5 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-[#8f0808]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-start gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

          {/* LEFT */}
          <div className="pt-4">

            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#a87920]" />

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a87920]">
                Let's Talk Insights.
              </p>
            </div>

            <h2 className="mt-7 text-5xl font-black leading-[1.05] tracking-tight text-[#8f0808] sm:text-6xl">
              Have a research
              <br />
              question?
            </h2>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-600">
              Tell us what you're trying to understand, and we'll help you
              build the right research approach.
            </p>

            <div className="mt-12 space-y-7">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a87920]">
                  Email
                </p>

                <a
                  href="mailto:admin@harwinninsights.com"
                  className="mt-2 block text-base font-semibold text-slate-700 hover:text-[#8f0808]"
                >
                  admin@harwinninsights.com
                </a>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a87920]">
                  Phone
                </p>

                <p className="mt-2 text-base font-semibold text-slate-700">
                  India +91 79828 05323
                </p>

              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a87920]">
                  Headquarters
                </p>

                <p className="mt-2 text-base font-semibold text-slate-700">
                  36, Phase I, Dundahera Village, Sector 20, Gurugram, Haryana – 122016
                </p>
              </div>

            </div>
          </div>

          {/* FORM */}
          <div className="rounded-[32px] border border-[#a87920]/20 bg-white p-7 shadow-[0_20px_70px_rgba(143,8,8,0.10)] sm:p-10">

            <div className="mb-8">
              <p className="text-2xl font-black text-[#8f0808] sm:text-3xl">
                Start Your Next Research Project
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Share a few details and our research team will get back to
                you.
              </p>
            </div>

            <form ref={form} onSubmit={sendEmail} className="space-y-6">

              {/* NAME + COMPANY */}
              <div className="grid gap-6 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-slate-200 bg-[#faf8f3] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#a87920] focus:bg-white focus:ring-4 focus:ring-[#a87920]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Company
                  </label>

                  <input
                    type="text"
                    name="company"
                    required
                    placeholder="Company name"
                    className="w-full rounded-2xl border border-slate-200 bg-[#faf8f3] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#a87920] focus:bg-white focus:ring-4 focus:ring-[#a87920]/10"
                  />
                </div>

              </div>

              {/* EMAIL + PHONE */}
              <div className="grid gap-6 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Work Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@company.com"
                    className="w-full rounded-2xl border border-slate-200 bg-[#faf8f3] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#a87920] focus:bg-white focus:ring-4 focus:ring-[#a87920]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-2xl border border-slate-200 bg-[#faf8f3] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#a87920] focus:bg-white focus:ring-4 focus:ring-[#a87920]/10"
                  />
                </div>

              </div>

              {/* RESEARCH REQUIREMENT */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Research Requirement
                </label>

                <textarea
                  name="research_requirement"
                  required
                  rows="6"
                  placeholder="Tell us about your research requirement..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-[#faf8f3] px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#a87920] focus:bg-white focus:ring-4 focus:ring-[#a87920]/10"
                />
              </div>

              {/* STATUS MESSAGE */}
              {message && (
                <div
                  className={`rounded-2xl px-5 py-4 text-sm font-semibold ${
                    message.includes("successfully")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={sending}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#8f0808] px-7 py-4 text-sm font-bold text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#700606] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sending ? "SENDING..." : "SEND INQUIRY"}

                {!sending && (
                  <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;