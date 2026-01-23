import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="pt-24">
      {" "}
      {/* Padding top biar konten gak ketutupan navbar */}
      {/* Hero Section Dummy */}
      <section className="h-screen bg-gray-50 flex items-center justify-center">
        <h1 className="text-4xl font-bold">
          Scroll ke bawah untuk lihat magic-nya! 👇
        </h1>
      </section>
      {/* Konten Panjang Dummy */}
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-20">
        {[1, 2, 3].map((i) => (
          <section key={i} className="h-96 bg-blue-100 rounded-xl p-10">
            <h2 className="text-2xl font-semibold mb-4">Content Section {i}</h2>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          </section>
        ))}
      </div>
    </div>
  );
}
