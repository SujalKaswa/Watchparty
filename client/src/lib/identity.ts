const ID_KEY = "reelroom-participant-id";
const TOKEN_KEY = "reelroom-participant-token";
const NAME_KEY = "reelroom-display-name";
const CUSTOM_NAME_KEY = "reelroom-display-name-custom";

export function createAnonymousName(random = Math.random()) {
  const bounded = Number.isFinite(random) ? Math.min(0.999999999, Math.max(0, random)) : 0;
  return `anonymous${10_000_000 + Math.floor(bounded * 90_000_000)}`;
}

function createToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

export function getParticipantId() {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function getParticipantToken() {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = createToken();
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    return createToken();
  }
}

export function getDisplayName() {
  try {
    const stored = localStorage.getItem(NAME_KEY)?.trim();
    const explicitlySaved = localStorage.getItem(CUSTOM_NAME_KEY) === "1";
    if (stored && (explicitlySaved || stored.toLowerCase() !== "alex")) return stored;
    const generated = createAnonymousName();
    localStorage.setItem(NAME_KEY, generated);
    return generated;
  } catch { return createAnonymousName(); }
}

export function saveDisplayName(name: string) {
  const clean = name.trim().replace(/[<>\u0000-\u001f]/g, "").slice(0, 32);
  if (!clean) return getDisplayName();
  try {
    localStorage.setItem(NAME_KEY, clean);
    localStorage.setItem(CUSTOM_NAME_KEY, "1");
  } catch { /* identity remains session-local */ }
  return clean;
}
