import logo from "../images/logo.png";

function LoadingScreen() {
  return (
    <div className="h-app aurora flex flex-col items-center justify-center gap-6 bg-fog-50 dark:bg-ink-900">
      <img src={logo} alt="" width={56} height={56} className="animate-drift rounded-2xl" />
      <div className="flex gap-2" role="status" aria-label="Loading">
        <span className="dot h-2.5 w-2.5 rounded-full bg-iris-500" />
        <span className="dot h-2.5 w-2.5 rounded-full bg-iris-500" />
        <span className="dot h-2.5 w-2.5 rounded-full bg-iris-500" />
      </div>
    </div>
  );
}

export default LoadingScreen;
