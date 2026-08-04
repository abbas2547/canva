export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold text-white">
            eluue
          </h2>

          <p className="mt-2 text-slate-400">
            Professional design platform.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-slate-400">
          <a href="tel:8755621235">
            📞 8755621235
          </a>

          <a href="mailto:abbaszaidi028@gmail.com">
            📧 abbaszaidi028@gmail.com
          </a>

          <a
            href="https://instagram.com/abbaszaidi_03"
            target="_blank"
          >
            📷 abbaszaidi_03
          </a>
        </div>
      </div>
    </footer>
  );
}