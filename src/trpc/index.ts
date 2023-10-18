import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  test: publicProcedure.query(() => {
    return 2;
  }),
});

export type AppRouter = typeof appRouter;