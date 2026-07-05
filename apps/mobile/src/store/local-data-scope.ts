import { useSetlistStore } from "@/store/setlist-store";
import { useSongStore } from "@/store/song-store";

export type LocalDataScope = "guest" | `user:${string}`;

let activeScope: LocalDataScope | null = null;

export async function switchLocalDataScope(scope: LocalDataScope | null): Promise<void> {
  if (scope === activeScope) return;

  activeScope = scope;
  useSongStore.setState({ songs: [] });
  useSetlistStore.setState({ setlists: [] });

  if (!scope) return;

  useSongStore.persist.setOptions({ name: `aurelis:${scope}:songs` });
  useSetlistStore.persist.setOptions({ name: `aurelis:${scope}:setlists` });
  await Promise.all([
    Promise.resolve(useSongStore.persist.rehydrate()),
    Promise.resolve(useSetlistStore.persist.rehydrate()),
  ]);
}
