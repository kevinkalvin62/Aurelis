export type Visibility = "private" | "organization" | "public";
export type OrganizationRole = "owner" | "admin" | "director" | "musician" | "guest";
export type SongContentType = "lyrics_chords" | "chords_only" | "wind_notes";
export type MusicNotation = "american" | "latin";
export type OrganizationType = "church" | "band" | "school" | "choir" | "group" | "personal";

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
  syncStatus?: "local" | "pending" | "synced";
  ownerUserId?: string;
  organizationId?: string;
  currentKey?: string;
  sourceInstrumentName: string;
}

export interface PersonalInstrument {
  id: string;
  userId: string;
  instrumentId: string;
  instrumentName: string;
  isPrimary: boolean;
  writtenOffset: number;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  username?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  ownerId: string;
  role?: OrganizationRole;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  displayName: string;
  email?: string;
  instruments: MemberInstrument[];
}

export interface MemberInstrument {
  id: string;
  organizationMemberId: string;
  instrumentId: string;
  instrumentName: string;
  transpositionKey?: string;
  isPrimary: boolean;
  writtenOffset: number;
}

export interface Setlist {
  id: string;
  title: string;
  dateLabel: string;
  time: string;
  location: string;
  songIds: string[];
  peopleCount: number;
  organizationId?: string;
  organizationName?: string;
  serviceDate?: string;
  notes?: string;
  sourceText?: string;
  createdBy?: string;
  items?: SetlistItem[];
  syncStatus?: "local" | "pending" | "synced";
}

export interface SetlistItem {
  id: string;
  setlistId: string;
  titleSnapshot: string;
  songId?: string;
  position: number;
  selectedKey?: string;
  notes?: string;
}

export interface SetlistDraftItem {
  titleSnapshot: string;
  songId?: string;
  selectedKey?: string;
  notes?: string;
}

export interface InstrumentMaterial {
  id: string;
  songId: string;
  instrumentId: string;
  instrumentName: string;
  key?: string;
  contentRaw?: string;
  notes?: string;
  adaptedFromInstrumentName?: string;
}

export interface Instrument {
  id: string;
  name: string;
  transpositionKey?: string;
  writtenOffset: number;
}
