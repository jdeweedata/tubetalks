export default function ProSection() {
  return (
    <section className="py-12">
      <div className="bg-[#4F46E5] rounded-2xl p-8 sm:p-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-white/10 rounded-lg p-2">
            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">T</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">TUBETALKS</h2>
          <span className="px-2 py-0.5 text-xs bg-white/10 text-white rounded-full">
            PRO
          </span>
        </div>
        <p className="text-lg sm:text-xl text-white/90 max-w-xl mx-auto mb-8">
          Get More Views With The Best Tools For YouTube
        </p>
        <button className="px-6 py-3 bg-white hover:bg-white/90 text-[#4F46E5] 
                       rounded-full font-medium transition-colors">
          Upgrade Now
        </button>
      </div>
    </section>
  );
}

