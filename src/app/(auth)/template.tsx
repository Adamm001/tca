export default function BooksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-between">
      <header className="w-full bg-[#202020] h-20 flex items-center justify-center border-b-1 border-[#2b2b2b] shadow-md ">
        <h1 className="text-white text-5xl font-bold ">NOMZO</h1>
      </header>
      <main className="shadow-xl text-white p-5 bg-[#252525] rounded-2xl overflow-y-auto w-100  h-auto flex flex-col items-center justify-center gap-5">
        {children}
      </main>
    </div>
  );
}
