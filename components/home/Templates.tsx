const templates = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
];

export default function Templates() {
  return (
    <section id="templates" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16">
          <h2 className="text-5xl font-black">
            Trending Templates
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((image, index) => (
            <div
              key={index}
              className="group overflow-hidden rounded-[2rem] border border-white/10"
            >
              <img
                src={image}
                alt="template"
                className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}