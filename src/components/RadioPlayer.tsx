import { useState, useRef, useEffect } from "react";
import { useAudioAnalysis } from "@/hooks/useAudioAnalysis";
import { useFireworks } from "@/hooks/useFireworks";
import { AudioData, MusicType } from "@/types/radio";
import PlayButton from "@/components/radio/PlayButton";
import VolumeControl from "@/components/radio/VolumeControl";
import LiveStats from "@/components/radio/LiveStats";
import FireworksEffect from "@/components/radio/FireworksEffect";
import Balloons from "@/components/radio/Balloons";

interface RadioPlayerProps {
  streamUrl?: string;
  likes?: number;
  dislikes?: number;
  listeners?: number;
}

const RadioPlayer = ({
  streamUrl = "https://myradio24.org/61673",
  likes = 0,
  dislikes = 0,
  listeners = 0,
}: RadioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [audioData, setAudioData] = useState<AudioData>({
    bassLevel: 0,
    midLevel: 0,
    trebleLevel: 0,
    overall: 0,
  });
  const [musicType, setMusicType] = useState<MusicType>("normal");
  const [showEffects, setShowEffects] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const { setupAudioAnalysis, analyzeAudio, stopAnalysis } = useAudioAnalysis();
  const {
    fireworks,
    heartEmojis,
    cryingEmojis,
    createFirework,
    createHeartEmoji,
    createCryingEmoji,
  } = useFireworks();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      // Улучшение качества звука
      audioRef.current.preload = "auto";
      audioRef.current.crossOrigin = "anonymous";
    }
  }, [volume]);

  useEffect(() => {
    const { bassLevel, midLevel, overall } = audioData;

    // Определение типа музыки на основе анализа
    if (bassLevel > 0.7 && midLevel > 0.6) {
      setMusicType("club");
    } else if (bassLevel > 0.6) {
      setMusicType("bass");
    } else if (overall < 0.3) {
      setMusicType("slow");
    } else {
      setMusicType("normal");
    }
  }, [audioData]);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        stopAnalysis();
        setShowEffects(false);

        // Создаем плачущие смайлики при остановке
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            createCryingEmoji(
              Math.random() * window.innerWidth,
              Math.random() * 100,
            );
          }, i * 200);
        }
      } else {
        try {
          // Быстрый старт воспроизведения
          await audioRef.current.play();
          setupAudioAnalysis(audioRef.current);
          analyzeAudio(setAudioData);
          setShowEffects(true);

          // Создаем фейерверки
          setTimeout(
            () =>
              createFirework(window.innerWidth * 0.2, window.innerHeight * 0.3),
            200,
          );
          setTimeout(
            () =>
              createFirework(window.innerWidth * 0.8, window.innerHeight * 0.4),
            400,
          );
          setTimeout(
            () =>
              createFirework(window.innerWidth * 0.5, window.innerHeight * 0.2),
            600,
          );

          setTimeout(() => setShowEffects(false), 3000);
        } catch (error) {
          console.error("Ошибка воспроизведения:", error);
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className={`flex flex-col items-center py-8 ${isPlaying ? "animate-pulse" : ""}`}
    >
      <audio
        ref={audioRef}
        src={streamUrl}
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Пульсирующий контейнер кнопки */}
      <div className={`mb-6 ${isPlaying ? "animate-pulse" : ""}`}>
        <PlayButton isPlaying={isPlaying} onToggle={togglePlay} />
      </div>

      {/* Регулятор громкости */}
      <VolumeControl volume={volume} onVolumeChange={setVolume} />

      {/* Живая статистика */}
      <LiveStats isPlaying={isPlaying} />

      {/* Эффекты */}
      <FireworksEffect
        fireworks={fireworks}
        heartEmojis={heartEmojis}
        cryingEmojis={cryingEmojis}
      />
      <Balloons show={showEffects} />
    </div>
  );
};

export default RadioPlayer;
