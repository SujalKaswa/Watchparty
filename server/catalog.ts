import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./_core/trpc";
import { getCatalogMovies } from "./catalog-data";

export const catalogRouter = router({
  list: publicProcedure.query(async () => {
    try {
      return await getCatalogMovies();
    } catch (error) {
      console.error("[Catalog] Failed to read movie catalog:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The movie catalog is temporarily unavailable." });
    }
  }),
});
