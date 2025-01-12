import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const popularChannels = [
  { id: 1, name: "I did a thing" },
  { id: 2, name: "Tom Scott" },
  { id: 3, name: "FaZe Rug" },
  { id: 4, name: "LazarBeam" },
  { id: 5, name: "Marques Brownlee" },
  { id: 6, name: "MrBeast" },
];

export default function PopularChannels() {
  return (
    <section className="py-12">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-10 text-center">
        Popular Channels
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {popularChannels.map((channel) => (
          <button
            key={channel.id}
            className="flex items-center gap-3 px-4 py-2.5 
                     bg-white/5 hover:bg-white/10 
                     border border-white/10 hover:border-white/20
                     rounded-full transition-all duration-200"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-gray-800 text-[11px] text-white">
                {channel.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300">{channel.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

