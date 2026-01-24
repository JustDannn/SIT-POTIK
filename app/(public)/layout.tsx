import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Background from "@/components/Background";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <Background />
      <Navbar />
      <main className="relative z-10">{children}</main>

      <Footer />
    </div>
  );
}
