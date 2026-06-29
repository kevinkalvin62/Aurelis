export type Visibility = 'private' | 'organization' | 'public';
export type OrganizationRole = 'owner' | 'admin' | 'director' | 'musician' | 'guest';
export type SongContentType = 'lyrics_chords' | 'chords_only' | 'wind_notes';
export type MusicNotation = 'american' | 'latin';

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  bpm: number;
  visibility: Visibility;
  updatedAt: string;
  content: string;
  contentType: SongContentType;
  notation: MusicNotation;
  favorite?: boolean;
  remoteId?: string;
  syncStatus?: 'local' | 'pending' | 'synced';
}

export interface Setlist {
  id: string;
  title: string;
  dateLabel: string;
  time: string;
  location: string;
  songIds: string[];
  peopleCount: number;
}

export interface Instrument {
  id: string;
  name: string;
  family: string;
  transposition: number;
  primary?: boolean;
}
