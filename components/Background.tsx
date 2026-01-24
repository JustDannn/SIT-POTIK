export default function Background() {
  return (
    <>
      <div className="fixed inset-0 -z-50 h-full w-full bg-white bg-dot-pattern"></div>
      <div className="fixed top-[-10%] right-[-5%] h-125 w-125 rounded-full bg-orange-100/60 blur-[100px] mix-blend-multiply opacity-70 -z-40 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] h-150 w-150 rounded-full bg-blue-100/50 blur-[120px] mix-blend-multiply opacity-60 -z-40 pointer-events-none" />
    </>
  );
}
