import { useState } from "react";
import logo from "../assets/harwinn-logo-fav.jpeg";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "About Us", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Global Coverage", href: "#industries" },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#8f0808]/10 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        <a href="#home">
          <img
            src={logo}
            alt="HARWINN INSIGHTS"
            className="h-16 w-auto object-contain"
          />
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-slate-700 transition hover:text-[#8f0808]"
            >
              {item.name}
            </a>
          ))}

          <a
            href="#contact"
            className="rounded-full bg-[#8f0808] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#700606]"
          >
            Contact Us
          </a>
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-xl md:hidden"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 shadow-xl md:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-[#fff5f5] hover:text-[#8f0808]"
              >
                {item.name}
              </a>
            ))}

            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-xl bg-[#8f0808] px-4 py-3 text-center text-sm font-bold text-white"
            >
              Contact Us
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;