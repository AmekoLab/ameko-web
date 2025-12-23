"use client";

interface SoundTestProps {
  videoUrl: string;
  description: string;
}

export const SoundTestSection = ({ videoUrl, description }: SoundTestProps) => {
  return (
    <div className="relative w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] bg-[#0a0a0a] text-white py-24 mt-32 group overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary opacity-5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content bên trái */}
          <div className="text-left">
            <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-6 font-oswald leading-none">
              Experience
              <br />
              The Sound.
            </h2>
            <p className="text-gray-400 text-xl mb-10 max-w-md leading-relaxed">
              {description}
            </p>
            {/* Sound Wave Animation */}
            <div className="flex items-end gap-1 h-16 opacity-60">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-primary rounded-t-sm animate-sound-wave"
                  style={{ animationDelay: `-${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>

          {/* Video bên phải - Style phẳng, không viền */}
          <div className="relative w-full aspect-video bg-black shadow-2xl shadow-primary/20">
            <iframe
              width="100%"
              height="100%"
              src={videoUrl}
              title="Sound Test"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};
