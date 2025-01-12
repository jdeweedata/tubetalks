export default function HomePage() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1">
        <Hero />
        <div className="container mx-auto space-y-32 px-4 sm:px-6 lg:px-8 py-12">
          <PopularChannels />
          <ProSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}

