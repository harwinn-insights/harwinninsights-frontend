

import blog1 from "../assets/blog-1.jpg";
import blog2 from "../assets/blog-2.jpg";
import blog3 from "../assets/blog-3.jpg";

const blogs = [
  {
    image: blog1,
    category: "MARKET RESEARCH",
    date: "05 SEP 2026",
    title: "How Market Research Helps Businesses Make Smarter Decisions",
    text: "Understanding customers, competitors and market opportunities can turn uncertainty into confident business decisions.",
  },
  
  {
    image: blog2,
    category: "CONSUMER INSIGHTS",
    date: "28 AUG 2026",
    title: "Understanding Consumer Behaviour in a Changing Market",
    text: "Consumer expectations continue to evolve. Research helps businesses understand what people value and why they choose.",
  },
  {
    image: blog3,
    category: "GLOBAL INSIGHTS",
    date: "20 AUG 2026",
    title: "Why Global Research Needs Local Understanding",
    text: "Successful international research combines global consistency with local culture, context and consumer understanding.",
  },
];

function Blogs() {
  return (
    <section
      id="insights"
      className="bg-[#faf8f3] py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a87920]">
              Insights & Ideas
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#8f0808] sm:text-5xl">
              Latest Research Insights.
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              Perspectives, ideas and research thinking to help you understand
              markets, consumers and opportunities.
            </p>
          </div>

          <button className="w-fit rounded-full border border-[#8f0808]/20 px-6 py-3 text-sm font-bold text-[#8f0808] transition hover:bg-[#8f0808] hover:text-white">
            Explore All Blogs →
          </button>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article
              key={blog.title}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                <span className="absolute bottom-4 left-4 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold tracking-wider text-[#8f0808]">
                  {blog.category}
                </span>
              </div>

              <div className="p-7">
                <p className="text-xs font-bold tracking-wider text-[#a87920]">
                  {blog.date}
                </p>

                <h3 className="mt-4 text-xl font-bold leading-7 text-[#8f0808] transition group-hover:text-[#a87920]">
                  {blog.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  {blog.text}
                </p>

                <button className="mt-6 text-sm font-bold text-[#8f0808]">
                  Read Article →
                </button>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Blogs;