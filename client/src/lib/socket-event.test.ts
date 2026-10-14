import { describe, expect, it } from "vitest";
import { emitSocketEvent } from "./socket-event";

describe("emitSocketEvent", () => {
  it("calls the Socket.IO emitter with the originating socket as its receiver", () => {
    const calls: Array<{ transport: string; event: string; payload: Record<string, unknown> }> = [];
    const socket = {
      _opts: { transport: "websocket" },
      emit(event: string, payload: Record<string, unknown>) {
        calls.push({ transport: this._opts.transport, event, payload });
      },
    };
    const payload = { code: "H6NFUQ", actionId: "test-action" };

    emitSocketEvent(socket, "playback:control", payload);

    expect(calls).toEqual([{ transport: "websocket", event: "playback:control", payload }]);
  });
});
