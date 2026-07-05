import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: [
        "apps/mobile/src/features/music-engine/*.ts",
        "apps/mobile/src/features/organizations/instrument-material.ts",
        "apps/mobile/src/features/organizations/permissions.ts",
        "apps/mobile/src/features/setlists/next-setlist.ts",
        "apps/mobile/src/features/setlists/parser.ts",
        "apps/mobile/src/features/setlists/setlist-key.ts",
        "apps/mobile/src/features/setlists/setlist-source.ts",
        "apps/mobile/src/features/songs/song-mapper.ts",
        "apps/mobile/src/lib/dates.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 85,
        lines: 85,
      },
    },
  },
});
