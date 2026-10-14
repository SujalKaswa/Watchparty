export function emitSocketEvent(
  socket: { emit: unknown },
  eventName: string,
  payload: Record<string, unknown>,
): void {
  if (typeof socket.emit !== "function") throw new TypeError("Room socket does not provide an emit function.");
  Reflect.apply(socket.emit, socket, [eventName, payload]);
}
