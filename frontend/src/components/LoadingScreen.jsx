
import logo from "../images/logo.png";

function LoadingScreen() {
  return (
    <div className="aurora flex h-app flex-col items-center justify-center gap-7 bg-fog-50 dark:bg-ink-900">
      <img
        src={logo}
        alt="Whisper"
        width={64}
        height={64}
        className="animate-pulse rounded-2xl"
      />

      <div className="flex items-center gap-2" role="status" aria-label="Loading">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-2.5 w-2.5 rounded-full bg-iris-500"
            style={{
              animation: "whisperBounce 0.6s ease-in-out infinite alternate",
              animationDelay: `${dot * 0.2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes whisperBounce {
          from {
            transform: translateY(0);
            opacity: 0.4;
          }
          to {
            transform: translateY(-7px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default LoadingScreen;
