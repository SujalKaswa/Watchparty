import { Clapperboard, Circle, Wifi, WifiOff } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return <a className={`brand${light ? " brand--light" : ""}`} href="/" aria-label="ReelRoom home"><span className="brand-mark"><Clapperboard size={17} strokeWidth={2.2} /><i /></span><span>reel<span>room</span></span></a>;
}

export function LiveStatus({ connected, latency }: { connected: boolean; latency?: number | null }) {
  return <span className={`live-status${connected ? " is-live" : " is-offline"}`}><span className="live-status__dot">{connected ? <Circle size={7} fill="currentColor" /> : <WifiOff size={13} />}</span><span>{connected ? "In sync" : "Reconnecting"}</span>{connected && latency != null && <span className="latency-label"><Wifi size={12} /> {latency}ms</span>}</span>;
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function AvatarStack({ names }: { names: string[] }) {
  const colors = ["#c37a69", "#91a899", "#8582bf", "#d2a15e", "#bb89ad", "#719aa2"];
  return <div className="avatar-stack">{names.slice(0, 5).map((name, index) => <span key={`${name}-${index}`} className="avatar" style={{ background: colors[index % colors.length] }} title={name}>{name.slice(0, 1).toUpperCase()}</span>)}{names.length > 5 && <span className="avatar avatar--more">+{names.length - 5}</span>}</div>;
}
