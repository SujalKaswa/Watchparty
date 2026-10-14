import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./_core/trpc";
import { createRoom } from "./realtime/store";

export const roomRouter = router({
  create: publicProcedure
    .input(z.object({
      participantId: z.string().uuid(),
      participantToken: z.string().regex(/^[0-9a-f]{64}$/i),
      displayName: z.string().trim().min(1).max(32),
    }))
    .mutation(async ({ input }) => {
      try {
        return await createRoom(input);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.startsWith("Choose a display name") || message.startsWith("This participant session is invalid")) {
          throw new TRPCError({ code: "BAD_REQUEST", message });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The room service is unavailable. No room was created; try again shortly." });
      }
    }),
});
