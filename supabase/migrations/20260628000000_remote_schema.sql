--
-- PostgreSQL database dump
--

-- \restrict Ij4hLZkBvADHRuIC5f8TC8ISm0rxabUjFj0U1Zo0ChjPuTXIpIkWxTEWIgv9WA2

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: content_visibility; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."content_visibility" AS ENUM (
    'private',
    'organization',
    'community',
    'public'
);


ALTER TYPE "public"."content_visibility" OWNER TO "postgres";

--
-- Name: organization_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."organization_role" AS ENUM (
    'owner',
    'admin',
    'director',
    'musician'
);


ALTER TYPE "public"."organization_role" OWNER TO "postgres";

--
-- Name: organization_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."organization_type" AS ENUM (
    'church',
    'band',
    'school',
    'community',
    'choir',
    'group',
    'personal'
);


ALTER TYPE "public"."organization_type" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: organization_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."organization_role" DEFAULT 'musician'::"public"."organization_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";

--
-- Name: add_organization_member_by_email("uuid", "text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."add_organization_member_by_email"("target_org" "uuid", "target_email" "text") RETURNS "public"."organization_members"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  target_user uuid;
  created public.organization_members;
begin
  if not exists(
    select 1 from public.organization_members
    where organization_id = target_org
      and user_id = auth.uid()
      and role in ('owner', 'admin', 'director')
  ) then raise exception 'insufficient permissions'; end if;

  select id into target_user from auth.users
  where lower(email) = lower(trim(target_email)) limit 1;
  if target_user is null then raise exception 'profile not found'; end if;

  insert into public.organization_members(organization_id, user_id, role)
  values(target_org, target_user, 'musician')
  on conflict (organization_id, user_id) do update set user_id = excluded.user_id
  returning * into created;
  return created;
end;
$$;


ALTER FUNCTION "public"."add_organization_member_by_email"("target_org" "uuid", "target_email" "text") OWNER TO "postgres";

--
-- Name: can_manage_setlist("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."can_manage_setlist"("target_setlist" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ select exists(select 1 from public.setlists s where s.id = target_setlist and public.has_org_role(s.organization_id, array['owner','admin','director']::public.organization_role[])) $$;


ALTER FUNCTION "public"."can_manage_setlist"("target_setlist" "uuid") OWNER TO "postgres";

--
-- Name: can_manage_song("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."can_manage_song"("target_song" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ select exists(select 1 from public.songs s where s.id = target_song and (s.user_id = auth.uid() or (s.organization_id is not null and public.has_org_role(s.organization_id, array['owner','admin','director']::public.organization_role[])))) $$;


ALTER FUNCTION "public"."can_manage_song"("target_song" "uuid") OWNER TO "postgres";

--
-- Name: can_view_setlist("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."can_view_setlist"("target_setlist" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ select exists(select 1 from public.setlists s where s.id = target_setlist and public.is_org_member(s.organization_id)) $$;


ALTER FUNCTION "public"."can_view_setlist"("target_setlist" "uuid") OWNER TO "postgres";

--
-- Name: can_view_song("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."can_view_song"("target_song" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ select exists(select 1 from public.songs s where s.id = target_song and (s.user_id = auth.uid() or s.visibility = 'public' or (s.organization_id is not null and public.is_org_member(s.organization_id)))) $$;


ALTER FUNCTION "public"."can_view_song"("target_song" "uuid") OWNER TO "postgres";

--
-- Name: get_organization_members("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."get_organization_members"("target_org" "uuid") RETURNS TABLE("member_id" "uuid", "user_id" "uuid", "role" "text", "display_name" "text", "email" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select om.id, om.user_id, om.role::text,
    coalesce(up.display_name, split_part(au.email, '@', 1), 'Músico'),
    au.email::text
  from public.organization_members om
  left join public.user_profiles up on up.user_id = om.user_id
  left join auth.users au on au.id = om.user_id
  where om.organization_id = target_org
    and public.is_org_member(target_org)
  order by om.created_at;
$$;


ALTER FUNCTION "public"."get_organization_members"("target_org" "uuid") OWNER TO "postgres";

--
-- Name: has_org_role("uuid", "public"."organization_role"[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."has_org_role"("target_org" "uuid", "allowed" "public"."organization_role"[]) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ select exists(select 1 from public.organization_members m where m.organization_id = target_org and m.user_id = auth.uid() and m.role = any(allowed)) $$;


ALTER FUNCTION "public"."has_org_role"("target_org" "uuid", "allowed" "public"."organization_role"[]) OWNER TO "postgres";

--
-- Name: is_org_member("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."is_org_member"("target_org" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ select exists(select 1 from public.organization_members m where m.organization_id = target_org and m.user_id = auth.uid()) $$;


ALTER FUNCTION "public"."is_org_member"("target_org" "uuid") OWNER TO "postgres";

--
-- Name: set_organization_member_role("uuid", "text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."set_organization_member_role"("target_member" "uuid", "target_role" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  member_row public.organization_members;
  caller_role text;
begin
  select * into member_row from public.organization_members where id = target_member;
  select role into caller_role from public.organization_members
  where organization_id = member_row.organization_id and user_id = auth.uid();
  if caller_role not in ('owner', 'admin') then raise exception 'insufficient permissions'; end if;
  if target_role not in ('admin', 'director', 'musician') then raise exception 'invalid role'; end if;
  if member_row.role = 'owner' then raise exception 'owner role cannot be changed'; end if;
  update public.organization_members
  set role = target_role::public.organization_role
  where id = target_member;
end;
$$;


ALTER FUNCTION "public"."set_organization_member_role"("target_member" "uuid", "target_role" "text") OWNER TO "postgres";

--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$ begin new.updated_at = now(); return new; end $$;


ALTER FUNCTION "public"."touch_updated_at"() OWNER TO "postgres";

--
-- Name: instruments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."instruments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "tuning" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "transposition_key" "text",
    "written_offset" smallint DEFAULT 0 NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "instruments_name_check" CHECK ((("char_length"("name") >= 1) AND ("char_length"("name") <= 80))),
    CONSTRAINT "instruments_transposition_key_check" CHECK ((("transposition_key" IS NULL) OR ("transposition_key" ~ '^[A-G](#|b)?$'::"text"))),
    CONSTRAINT "instruments_written_offset_check" CHECK ((("written_offset" >= '-11'::integer) AND ("written_offset" <= 11)))
);


ALTER TABLE "public"."instruments" OWNER TO "postgres";

--
-- Name: member_instruments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."member_instruments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_member_id" "uuid" NOT NULL,
    "instrument_id" "uuid" NOT NULL,
    "transposition_key" "text",
    "is_primary" boolean DEFAULT false NOT NULL,
    CONSTRAINT "member_instruments_transposition_key_check" CHECK ((("transposition_key" IS NULL) OR ("transposition_key" ~ '^[A-G](#|b)?$'::"text")))
);


ALTER TABLE "public"."member_instruments" OWNER TO "postgres";

--
-- Name: member_song_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."member_song_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "song_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instrument_id" "uuid",
    "notes" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."member_song_notes" OWNER TO "postgres";

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "type" "public"."organization_type" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organizations_name_check" CHECK ((("char_length"("name") >= 2) AND ("char_length"("name") <= 120))),
    CONSTRAINT "organizations_slug_check" CHECK (("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::"text"))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";

--
-- Name: saved_transpositions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."saved_transpositions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "original_key" "text" NOT NULL,
    "target_key" "text" NOT NULL,
    "input_notes" "text" NOT NULL,
    "output_notes" "text" NOT NULL,
    "instrument_id" "uuid",
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "is_favorite" boolean DEFAULT false NOT NULL,
    "visibility" "public"."content_visibility" DEFAULT 'private'::"public"."content_visibility" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_transpositions" OWNER TO "postgres";

--
-- Name: setlist_item_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."setlist_item_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setlist_item_id" "uuid" NOT NULL,
    "instrument_id" "uuid" NOT NULL,
    "assigned_key" "text",
    "material_id" "uuid",
    "notes" "text" DEFAULT ''::"text" NOT NULL,
    CONSTRAINT "setlist_item_assignments_assigned_key_check" CHECK ((("assigned_key" IS NULL) OR ("assigned_key" ~ '^[A-G](#|b)?$'::"text")))
);


ALTER TABLE "public"."setlist_item_assignments" OWNER TO "postgres";

--
-- Name: setlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."setlist_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setlist_id" "uuid" NOT NULL,
    "song_id" "uuid",
    "source_title" "text" NOT NULL,
    "position" integer NOT NULL,
    "selected_key" "text",
    "notes" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title_snapshot" "text" NOT NULL,
    CONSTRAINT "setlist_items_position_check" CHECK (("position" >= 0)),
    CONSTRAINT "setlist_items_selected_key_check" CHECK ((("selected_key" IS NULL) OR ("selected_key" ~ '^[A-G](#|b)?m?$'::"text")))
);


ALTER TABLE "public"."setlist_items" OWNER TO "postgres";

--
-- Name: setlist_private_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."setlist_private_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setlist_item_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instrument_id" "uuid",
    "notes" "text" DEFAULT ''::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."setlist_private_notes" OWNER TO "postgres";

--
-- Name: setlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."setlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "service_date" "date" NOT NULL,
    "source_text" "text" DEFAULT ''::"text" NOT NULL,
    "leader_notes" "text" DEFAULT ''::"text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "setlists_source_text_check" CHECK (("octet_length"("source_text") <= 100000)),
    CONSTRAINT "setlists_title_check" CHECK ((("char_length"("title") >= 1) AND ("char_length"("title") <= 160)))
);


ALTER TABLE "public"."setlists" OWNER TO "postgres";

--
-- Name: song_instrument_parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."song_instrument_parts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "song_id" "uuid" NOT NULL,
    "instrument_id" "uuid" NOT NULL,
    "key" "text",
    "content_raw" "text" DEFAULT ''::"text" NOT NULL,
    "content_structured" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "notes" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "song_instrument_parts_content_structured_check" CHECK (("jsonb_typeof"("content_structured") = 'array'::"text")),
    CONSTRAINT "song_instrument_parts_key_check" CHECK ((("key" IS NULL) OR ("key" ~ '^[A-G](#|b)?$'::"text")))
);


ALTER TABLE "public"."song_instrument_parts" OWNER TO "postgres";

--
-- Name: song_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."song_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "song_id" "uuid" NOT NULL,
    "version" integer NOT NULL,
    "content_raw" "text" NOT NULL,
    "content_structured" "jsonb" NOT NULL,
    "key" "text" NOT NULL,
    "change_note" "text" DEFAULT ''::"text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source_instrument_name" "text" DEFAULT 'Concert'::"text" NOT NULL,
    CONSTRAINT "song_versions_key_supported" CHECK ((("key" IS NULL) OR ("key" ~ '^[A-G](#|b)?m?$'::"text"))),
    CONSTRAINT "song_versions_version_check" CHECK (("version" > 0))
);


ALTER TABLE "public"."song_versions" OWNER TO "postgres";

--
-- Name: songs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."songs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid",
    "forked_from_id" "uuid",
    "title" "text" NOT NULL,
    "artist" "text",
    "original_key" "text" NOT NULL,
    "current_key" "text" NOT NULL,
    "accidental_preference" "text" DEFAULT 'sharps'::"text" NOT NULL,
    "content_raw" "text" DEFAULT ''::"text" NOT NULL,
    "content_structured" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "visibility" "public"."content_visibility" DEFAULT 'private'::"public"."content_visibility" NOT NULL,
    "is_favorite" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "songs_accidental_preference_check" CHECK (("accidental_preference" = ANY (ARRAY['sharps'::"text", 'flats'::"text"]))),
    CONSTRAINT "songs_artist_check" CHECK (("char_length"("artist") <= 160)),
    CONSTRAINT "songs_check" CHECK ((("visibility" <> ALL (ARRAY['organization'::"public"."content_visibility", 'community'::"public"."content_visibility"])) OR ("organization_id" IS NOT NULL))),
    CONSTRAINT "songs_content_raw_check" CHECK (("octet_length"("content_raw") <= 200000)),
    CONSTRAINT "songs_content_structured_check" CHECK (("jsonb_typeof"("content_structured") = 'array'::"text")),
    CONSTRAINT "songs_current_key_supported" CHECK ((("current_key" IS NULL) OR ("current_key" ~ '^[A-G](#|b)?m?$'::"text"))),
    CONSTRAINT "songs_original_key_supported" CHECK ((("original_key" IS NULL) OR ("original_key" ~ '^[A-G](#|b)?m?$'::"text"))),
    CONSTRAINT "songs_title_check" CHECK ((("char_length"("title") >= 1) AND ("char_length"("title") <= 160)))
);


ALTER TABLE "public"."songs" OWNER TO "postgres";

--
-- Name: user_instruments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."user_instruments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "instrument_name" "text" NOT NULL,
    "transpose_offset" integer DEFAULT 0 NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_instruments" OWNER TO "postgres";

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "username" "text",
    "display_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_profiles_display_name_check" CHECK (("char_length"("display_name") <= 80)),
    CONSTRAINT "user_profiles_username_check" CHECK ((("char_length"("username") >= 3) AND ("char_length"("username") <= 30)))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";

--
-- Name: instruments instruments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."instruments"
    ADD CONSTRAINT "instruments_pkey" PRIMARY KEY ("id");


--
-- Name: member_instruments member_instruments_organization_member_id_instrument_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."member_instruments"
    ADD CONSTRAINT "member_instruments_organization_member_id_instrument_id_key" UNIQUE ("organization_member_id", "instrument_id");


--
-- Name: member_instruments member_instruments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."member_instruments"
    ADD CONSTRAINT "member_instruments_pkey" PRIMARY KEY ("id");


--
-- Name: member_song_notes member_song_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."member_song_notes"
    ADD CONSTRAINT "member_song_notes_pkey" PRIMARY KEY ("id");


--
-- Name: member_song_notes member_song_notes_song_id_user_id_instrument_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."member_song_notes"
    ADD CONSTRAINT "member_song_notes_song_id_user_id_instrument_id_key" UNIQUE NULLS NOT DISTINCT ("song_id", "user_id", "instrument_id");


--
-- Name: organization_members organization_members_organization_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_user_id_key" UNIQUE ("organization_id", "user_id");


--
-- Name: organization_members organization_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");


--
-- Name: organizations organizations_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");


--
-- Name: saved_transpositions saved_transpositions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."saved_transpositions"
    ADD CONSTRAINT "saved_transpositions_pkey" PRIMARY KEY ("id");


--
-- Name: setlist_item_assignments setlist_item_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_item_assignments"
    ADD CONSTRAINT "setlist_item_assignments_pkey" PRIMARY KEY ("id");


--
-- Name: setlist_item_assignments setlist_item_assignments_setlist_item_id_instrument_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_item_assignments"
    ADD CONSTRAINT "setlist_item_assignments_setlist_item_id_instrument_id_key" UNIQUE ("setlist_item_id", "instrument_id");


--
-- Name: setlist_items setlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_items"
    ADD CONSTRAINT "setlist_items_pkey" PRIMARY KEY ("id");


--
-- Name: setlist_items setlist_items_setlist_id_position_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_items"
    ADD CONSTRAINT "setlist_items_setlist_id_position_key" UNIQUE ("setlist_id", "position");


--
-- Name: setlist_private_notes setlist_private_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_private_notes"
    ADD CONSTRAINT "setlist_private_notes_pkey" PRIMARY KEY ("id");


--
-- Name: setlist_private_notes setlist_private_notes_setlist_item_id_user_id_instrument_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_private_notes"
    ADD CONSTRAINT "setlist_private_notes_setlist_item_id_user_id_instrument_id_key" UNIQUE NULLS NOT DISTINCT ("setlist_item_id", "user_id", "instrument_id");


--
-- Name: setlists setlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlists"
    ADD CONSTRAINT "setlists_pkey" PRIMARY KEY ("id");


--
-- Name: song_instrument_parts song_instrument_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."song_instrument_parts"
    ADD CONSTRAINT "song_instrument_parts_pkey" PRIMARY KEY ("id");


--
-- Name: song_instrument_parts song_instrument_parts_song_id_instrument_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."song_instrument_parts"
    ADD CONSTRAINT "song_instrument_parts_song_id_instrument_id_key" UNIQUE ("song_id", "instrument_id");


--
-- Name: song_versions song_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."song_versions"
    ADD CONSTRAINT "song_versions_pkey" PRIMARY KEY ("id");


--
-- Name: song_versions song_versions_song_id_version_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."song_versions"
    ADD CONSTRAINT "song_versions_song_id_version_key" UNIQUE ("song_id", "version");


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."songs"
    ADD CONSTRAINT "songs_pkey" PRIMARY KEY ("id");


--
-- Name: user_instruments user_instruments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_instruments"
    ADD CONSTRAINT "user_instruments_pkey" PRIMARY KEY ("id");


--
-- Name: user_instruments user_instruments_user_id_instrument_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_instruments"
    ADD CONSTRAINT "user_instruments_user_id_instrument_name_key" UNIQUE ("user_id", "instrument_name");


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");


--
-- Name: user_profiles user_profiles_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_username_key" UNIQUE ("username");


--
-- Name: organization_members_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "organization_members_user_idx" ON "public"."organization_members" USING "btree" ("user_id", "organization_id");


--
-- Name: setlists_org_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "setlists_org_date_idx" ON "public"."setlists" USING "btree" ("organization_id", "service_date" DESC);


--
-- Name: songs_org_updated_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "songs_org_updated_idx" ON "public"."songs" USING "btree" ("organization_id", "updated_at" DESC) WHERE ("organization_id" IS NOT NULL);


--
-- Name: songs_public_updated_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "songs_public_updated_idx" ON "public"."songs" USING "btree" ("updated_at" DESC) WHERE ("visibility" = 'public'::"public"."content_visibility");


--
-- Name: songs_tags_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "songs_tags_idx" ON "public"."songs" USING "gin" ("tags");


--
-- Name: songs_user_updated_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "songs_user_updated_idx" ON "public"."songs" USING "btree" ("user_id", "updated_at" DESC);


--
-- Name: user_instruments_one_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_instruments_one_primary" ON "public"."user_instruments" USING "btree" ("user_id") WHERE "is_primary";


--
-- Name: user_instruments_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_instruments_user_idx" ON "public"."user_instruments" USING "btree" ("user_id");


--
-- Name: organizations touch_organizations; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "touch_organizations" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();


--
-- Name: song_instrument_parts touch_parts; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "touch_parts" BEFORE UPDATE ON "public"."song_instrument_parts" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();


--
-- Name: setlists touch_setlists; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "touch_setlists" BEFORE UPDATE ON "public"."setlists" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();


--
-- Name: songs touch_songs; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "touch_songs" BEFORE UPDATE ON "public"."songs" FOR EACH ROW EXECUTE FUNCTION "public"."touch_updated_at"();


--
-- Name: instruments instruments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."instruments"
    ADD CONSTRAINT "instruments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: member_instruments member_instruments_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."member_instruments"
    ADD CONSTRAINT "member_instruments_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE CASCADE;


--
-- Name: member_instruments member_instruments_organization_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."member_instruments"
    ADD CONSTRAINT "member_instruments_organization_member_id_fkey" FOREIGN KEY ("organization_member_id") REFERENCES "public"."organization_members"("id") ON DELETE CASCADE;


--
-- Name: member_song_notes member_song_notes_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."member_song_notes"
    ADD CONSTRAINT "member_song_notes_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE CASCADE;


--
-- Name: member_song_notes member_song_notes_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."member_song_notes"
    ADD CONSTRAINT "member_song_notes_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE;


--
-- Name: member_song_notes member_song_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."member_song_notes"
    ADD CONSTRAINT "member_song_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: organization_members organization_members_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;


--
-- Name: organization_members organization_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: organizations organizations_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;


--
-- Name: saved_transpositions saved_transpositions_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."saved_transpositions"
    ADD CONSTRAINT "saved_transpositions_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE SET NULL;


--
-- Name: saved_transpositions saved_transpositions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."saved_transpositions"
    ADD CONSTRAINT "saved_transpositions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: setlist_item_assignments setlist_item_assignments_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_item_assignments"
    ADD CONSTRAINT "setlist_item_assignments_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE CASCADE;


--
-- Name: setlist_item_assignments setlist_item_assignments_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_item_assignments"
    ADD CONSTRAINT "setlist_item_assignments_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."song_instrument_parts"("id") ON DELETE SET NULL;


--
-- Name: setlist_item_assignments setlist_item_assignments_setlist_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_item_assignments"
    ADD CONSTRAINT "setlist_item_assignments_setlist_item_id_fkey" FOREIGN KEY ("setlist_item_id") REFERENCES "public"."setlist_items"("id") ON DELETE CASCADE;


--
-- Name: setlist_items setlist_items_setlist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_items"
    ADD CONSTRAINT "setlist_items_setlist_id_fkey" FOREIGN KEY ("setlist_id") REFERENCES "public"."setlists"("id") ON DELETE CASCADE;


--
-- Name: setlist_items setlist_items_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_items"
    ADD CONSTRAINT "setlist_items_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE RESTRICT;


--
-- Name: setlist_private_notes setlist_private_notes_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_private_notes"
    ADD CONSTRAINT "setlist_private_notes_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE CASCADE;


--
-- Name: setlist_private_notes setlist_private_notes_setlist_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_private_notes"
    ADD CONSTRAINT "setlist_private_notes_setlist_item_id_fkey" FOREIGN KEY ("setlist_item_id") REFERENCES "public"."setlist_items"("id") ON DELETE CASCADE;


--
-- Name: setlist_private_notes setlist_private_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlist_private_notes"
    ADD CONSTRAINT "setlist_private_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: setlists setlists_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlists"
    ADD CONSTRAINT "setlists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;


--
-- Name: setlists setlists_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."setlists"
    ADD CONSTRAINT "setlists_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;


--
-- Name: song_instrument_parts song_instrument_parts_instrument_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."song_instrument_parts"
    ADD CONSTRAINT "song_instrument_parts_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instruments"("id") ON DELETE CASCADE;


--
-- Name: song_instrument_parts song_instrument_parts_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."song_instrument_parts"
    ADD CONSTRAINT "song_instrument_parts_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE;


--
-- Name: song_versions song_versions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."song_versions"
    ADD CONSTRAINT "song_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;


--
-- Name: song_versions song_versions_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."song_versions"
    ADD CONSTRAINT "song_versions_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE;


--
-- Name: songs songs_forked_from_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."songs"
    ADD CONSTRAINT "songs_forked_from_id_fkey" FOREIGN KEY ("forked_from_id") REFERENCES "public"."songs"("id") ON DELETE SET NULL;


--
-- Name: songs songs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."songs"
    ADD CONSTRAINT "songs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;


--
-- Name: songs songs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."songs"
    ADD CONSTRAINT "songs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: user_instruments user_instruments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_instruments"
    ADD CONSTRAINT "user_instruments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: setlist_item_assignments assignments leaders manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "assignments leaders manage" ON "public"."setlist_item_assignments" USING ((EXISTS ( SELECT 1
   FROM "public"."setlist_items" "i"
  WHERE (("i"."id" = "setlist_item_assignments"."setlist_item_id") AND "public"."can_manage_setlist"("i"."setlist_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."setlist_items" "i"
  WHERE (("i"."id" = "setlist_item_assignments"."setlist_item_id") AND "public"."can_manage_setlist"("i"."setlist_id")))));


--
-- Name: setlist_item_assignments assignments members select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "assignments members select" ON "public"."setlist_item_assignments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."setlist_items" "i"
  WHERE (("i"."id" = "setlist_item_assignments"."setlist_item_id") AND "public"."can_view_setlist"("i"."setlist_id")))));


--
-- Name: instruments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."instruments" ENABLE ROW LEVEL SECURITY;

--
-- Name: instruments instruments own delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "instruments own delete" ON "public"."instruments" FOR DELETE USING (("user_id" = "auth"."uid"()));


--
-- Name: instruments instruments own insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "instruments own insert" ON "public"."instruments" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));


--
-- Name: instruments instruments own update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "instruments own update" ON "public"."instruments" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));


--
-- Name: instruments instruments permitted select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "instruments permitted select" ON "public"."instruments" FOR SELECT USING ((("user_id" IS NULL) OR ("user_id" = "auth"."uid"())));


--
-- Name: member_instruments member instruments org select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "member instruments org select" ON "public"."member_instruments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "m"
  WHERE (("m"."id" = "member_instruments"."organization_member_id") AND "public"."is_org_member"("m"."organization_id")))));


--
-- Name: member_instruments member instruments self manage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "member instruments self manage" ON "public"."member_instruments" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "m"
  WHERE (("m"."id" = "member_instruments"."organization_member_id") AND (("m"."user_id" = "auth"."uid"()) OR "public"."has_org_role"("m"."organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "m"
  WHERE (("m"."id" = "member_instruments"."organization_member_id") AND (("m"."user_id" = "auth"."uid"()) OR "public"."has_org_role"("m"."organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role"]))))));


--
-- Name: member_song_notes member notes own delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "member notes own delete" ON "public"."member_song_notes" FOR DELETE USING (("user_id" = "auth"."uid"()));


--
-- Name: member_song_notes member notes own insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "member notes own insert" ON "public"."member_song_notes" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND "public"."can_view_song"("song_id")));


--
-- Name: member_song_notes member notes own select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "member notes own select" ON "public"."member_song_notes" FOR SELECT USING (("user_id" = "auth"."uid"()));


--
-- Name: member_song_notes member notes own update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "member notes own update" ON "public"."member_song_notes" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));


--
-- Name: member_instruments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."member_instruments" ENABLE ROW LEVEL SECURITY;

--
-- Name: member_song_notes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."member_song_notes" ENABLE ROW LEVEL SECURITY;

--
-- Name: organization_members members managers insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members managers insert" ON "public"."organization_members" FOR INSERT WITH CHECK (("public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role"]) OR (EXISTS ( SELECT 1
   FROM "public"."organizations" "o"
  WHERE (("o"."id" = "organization_members"."organization_id") AND ("o"."owner_id" = "auth"."uid"()) AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = 'owner'::"public"."organization_role"))))));


--
-- Name: organization_members members managers update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members managers update" ON "public"."organization_members" FOR UPDATE USING ("public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role"]));


--
-- Name: organization_members members organization select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members organization select" ON "public"."organization_members" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_org_member"("organization_id")));


--
-- Name: organization_members members self or managers delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "members self or managers delete" ON "public"."organization_members" FOR DELETE USING ((("user_id" = "auth"."uid"()) OR "public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role"])));


--
-- Name: organization_members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations organizations managers update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "organizations managers update" ON "public"."organizations" FOR UPDATE USING ((("owner_id" = "auth"."uid"()) OR "public"."has_org_role"("id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role"])));


--
-- Name: organizations organizations member select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "organizations member select" ON "public"."organizations" FOR SELECT USING ((("owner_id" = "auth"."uid"()) OR "public"."is_org_member"("id")));


--
-- Name: organizations organizations owner delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "organizations owner delete" ON "public"."organizations" FOR DELETE USING (("owner_id" = "auth"."uid"()));


--
-- Name: organizations organizations owner insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "organizations owner insert" ON "public"."organizations" FOR INSERT WITH CHECK (("owner_id" = "auth"."uid"()));


--
-- Name: song_instrument_parts parts song managers delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "parts song managers delete" ON "public"."song_instrument_parts" FOR DELETE USING ("public"."can_manage_song"("song_id"));


--
-- Name: song_instrument_parts parts song managers insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "parts song managers insert" ON "public"."song_instrument_parts" FOR INSERT WITH CHECK ("public"."can_manage_song"("song_id"));


--
-- Name: song_instrument_parts parts song managers update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "parts song managers update" ON "public"."song_instrument_parts" FOR UPDATE USING ("public"."can_manage_song"("song_id"));


--
-- Name: song_instrument_parts parts song viewers select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "parts song viewers select" ON "public"."song_instrument_parts" FOR SELECT USING ("public"."can_view_song"("song_id"));


--
-- Name: setlist_private_notes private setlist notes own delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "private setlist notes own delete" ON "public"."setlist_private_notes" FOR DELETE USING (("user_id" = "auth"."uid"()));


--
-- Name: setlist_private_notes private setlist notes own insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "private setlist notes own insert" ON "public"."setlist_private_notes" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."setlist_items" "i"
  WHERE (("i"."id" = "setlist_private_notes"."setlist_item_id") AND "public"."can_view_setlist"("i"."setlist_id"))))));


--
-- Name: setlist_private_notes private setlist notes own select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "private setlist notes own select" ON "public"."setlist_private_notes" FOR SELECT USING (("user_id" = "auth"."uid"()));


--
-- Name: setlist_private_notes private setlist notes own update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "private setlist notes own update" ON "public"."setlist_private_notes" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));


--
-- Name: user_profiles profiles own insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "profiles own insert" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: user_profiles profiles own select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "profiles own select" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));


--
-- Name: user_profiles profiles own update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "profiles own update" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: saved_transpositions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."saved_transpositions" ENABLE ROW LEVEL SECURITY;

--
-- Name: setlist_items setlist items leaders delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "setlist items leaders delete" ON "public"."setlist_items" FOR DELETE USING ("public"."can_manage_setlist"("setlist_id"));


--
-- Name: setlist_items setlist items leaders insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "setlist items leaders insert" ON "public"."setlist_items" FOR INSERT WITH CHECK ("public"."can_manage_setlist"("setlist_id"));


--
-- Name: setlist_items setlist items leaders update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "setlist items leaders update" ON "public"."setlist_items" FOR UPDATE USING ("public"."can_manage_setlist"("setlist_id"));


--
-- Name: setlist_items setlist items members select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "setlist items members select" ON "public"."setlist_items" FOR SELECT USING ("public"."can_view_setlist"("setlist_id"));


--
-- Name: setlist_item_assignments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."setlist_item_assignments" ENABLE ROW LEVEL SECURITY;

--
-- Name: setlist_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."setlist_items" ENABLE ROW LEVEL SECURITY;

--
-- Name: setlist_private_notes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."setlist_private_notes" ENABLE ROW LEVEL SECURITY;

--
-- Name: setlists; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."setlists" ENABLE ROW LEVEL SECURITY;

--
-- Name: setlists setlists leaders delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "setlists leaders delete" ON "public"."setlists" FOR DELETE USING ("public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role", 'director'::"public"."organization_role"]));


--
-- Name: setlists setlists leaders insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "setlists leaders insert" ON "public"."setlists" FOR INSERT WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role", 'director'::"public"."organization_role"])));


--
-- Name: setlists setlists leaders update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "setlists leaders update" ON "public"."setlists" FOR UPDATE USING ("public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role", 'director'::"public"."organization_role"]));


--
-- Name: setlists setlists members select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "setlists members select" ON "public"."setlists" FOR SELECT USING ("public"."is_org_member"("organization_id"));


--
-- Name: song_instrument_parts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."song_instrument_parts" ENABLE ROW LEVEL SECURITY;

--
-- Name: song_versions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."song_versions" ENABLE ROW LEVEL SECURITY;

--
-- Name: songs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."songs" ENABLE ROW LEVEL SECURITY;

--
-- Name: songs songs authorized delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "songs authorized delete" ON "public"."songs" FOR DELETE USING ((("user_id" = "auth"."uid"()) OR (("organization_id" IS NOT NULL) AND "public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role", 'director'::"public"."organization_role"]))));


--
-- Name: songs songs authorized insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "songs authorized insert" ON "public"."songs" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND (("organization_id" IS NULL) OR "public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role", 'director'::"public"."organization_role"]))));


--
-- Name: songs songs authorized update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "songs authorized update" ON "public"."songs" FOR UPDATE USING ((("user_id" = "auth"."uid"()) OR (("organization_id" IS NOT NULL) AND "public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role", 'director'::"public"."organization_role"])))) WITH CHECK ((("user_id" = "auth"."uid"()) OR (("organization_id" IS NOT NULL) AND "public"."has_org_role"("organization_id", ARRAY['owner'::"public"."organization_role", 'admin'::"public"."organization_role", 'director'::"public"."organization_role"]))));


--
-- Name: songs songs permitted select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "songs permitted select" ON "public"."songs" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("visibility" = 'public'::"public"."content_visibility") OR (("organization_id" IS NOT NULL) AND "public"."is_org_member"("organization_id"))));


--
-- Name: saved_transpositions transpositions own delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "transpositions own delete" ON "public"."saved_transpositions" FOR DELETE USING (("user_id" = "auth"."uid"()));


--
-- Name: saved_transpositions transpositions own insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "transpositions own insert" ON "public"."saved_transpositions" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));


--
-- Name: saved_transpositions transpositions own update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "transpositions own update" ON "public"."saved_transpositions" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));


--
-- Name: saved_transpositions transpositions permitted select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "transpositions permitted select" ON "public"."saved_transpositions" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR ("visibility" = 'public'::"public"."content_visibility")));


--
-- Name: user_instruments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_instruments" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_instruments user_instruments_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user_instruments_delete_own" ON "public"."user_instruments" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));


--
-- Name: user_instruments user_instruments_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user_instruments_insert_own" ON "public"."user_instruments" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));


--
-- Name: user_instruments user_instruments_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user_instruments_select_own" ON "public"."user_instruments" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));


--
-- Name: user_instruments user_instruments_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user_instruments_update_own" ON "public"."user_instruments" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));


--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: song_versions versions song managers insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "versions song managers insert" ON "public"."song_versions" FOR INSERT WITH CHECK ((("created_by" = "auth"."uid"()) AND "public"."can_manage_song"("song_id")));


--
-- Name: song_versions versions song viewers select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "versions song viewers select" ON "public"."song_versions" FOR SELECT USING ("public"."can_view_song"("song_id"));


--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: TABLE "organization_members"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";


--
-- Name: FUNCTION "add_organization_member_by_email"("target_org" "uuid", "target_email" "text"); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."add_organization_member_by_email"("target_org" "uuid", "target_email" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_organization_member_by_email"("target_org" "uuid", "target_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_organization_member_by_email"("target_org" "uuid", "target_email" "text") TO "service_role";


--
-- Name: FUNCTION "can_manage_setlist"("target_setlist" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."can_manage_setlist"("target_setlist" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_manage_setlist"("target_setlist" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_manage_setlist"("target_setlist" "uuid") TO "service_role";


--
-- Name: FUNCTION "can_manage_song"("target_song" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."can_manage_song"("target_song" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_manage_song"("target_song" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_manage_song"("target_song" "uuid") TO "service_role";


--
-- Name: FUNCTION "can_view_setlist"("target_setlist" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."can_view_setlist"("target_setlist" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_view_setlist"("target_setlist" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_view_setlist"("target_setlist" "uuid") TO "service_role";


--
-- Name: FUNCTION "can_view_song"("target_song" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."can_view_song"("target_song" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_view_song"("target_song" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_view_song"("target_song" "uuid") TO "service_role";


--
-- Name: FUNCTION "get_organization_members"("target_org" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."get_organization_members"("target_org" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_organization_members"("target_org" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_organization_members"("target_org" "uuid") TO "service_role";


--
-- Name: FUNCTION "has_org_role"("target_org" "uuid", "allowed" "public"."organization_role"[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."has_org_role"("target_org" "uuid", "allowed" "public"."organization_role"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."has_org_role"("target_org" "uuid", "allowed" "public"."organization_role"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_org_role"("target_org" "uuid", "allowed" "public"."organization_role"[]) TO "service_role";


--
-- Name: FUNCTION "is_org_member"("target_org" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."is_org_member"("target_org" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_org_member"("target_org" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_org_member"("target_org" "uuid") TO "service_role";


--
-- Name: FUNCTION "set_organization_member_role"("target_member" "uuid", "target_role" "text"); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."set_organization_member_role"("target_member" "uuid", "target_role" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_organization_member_role"("target_member" "uuid", "target_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_organization_member_role"("target_member" "uuid", "target_role" "text") TO "service_role";


--
-- Name: FUNCTION "touch_updated_at"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."touch_updated_at"() TO "service_role";


--
-- Name: TABLE "instruments"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."instruments" TO "authenticated";
GRANT ALL ON TABLE "public"."instruments" TO "service_role";
GRANT SELECT ON TABLE "public"."instruments" TO "anon";


--
-- Name: TABLE "member_instruments"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."member_instruments" TO "authenticated";
GRANT ALL ON TABLE "public"."member_instruments" TO "service_role";


--
-- Name: TABLE "member_song_notes"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."member_song_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."member_song_notes" TO "service_role";


--
-- Name: TABLE "organizations"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";


--
-- Name: TABLE "saved_transpositions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."saved_transpositions" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_transpositions" TO "service_role";


--
-- Name: TABLE "setlist_item_assignments"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."setlist_item_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."setlist_item_assignments" TO "service_role";


--
-- Name: TABLE "setlist_items"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."setlist_items" TO "authenticated";
GRANT ALL ON TABLE "public"."setlist_items" TO "service_role";


--
-- Name: TABLE "setlist_private_notes"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."setlist_private_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."setlist_private_notes" TO "service_role";


--
-- Name: TABLE "setlists"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."setlists" TO "authenticated";
GRANT ALL ON TABLE "public"."setlists" TO "service_role";


--
-- Name: TABLE "song_instrument_parts"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."song_instrument_parts" TO "authenticated";
GRANT ALL ON TABLE "public"."song_instrument_parts" TO "service_role";
GRANT SELECT ON TABLE "public"."song_instrument_parts" TO "anon";


--
-- Name: TABLE "song_versions"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."song_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."song_versions" TO "service_role";
GRANT SELECT ON TABLE "public"."song_versions" TO "anon";


--
-- Name: TABLE "songs"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."songs" TO "authenticated";
GRANT ALL ON TABLE "public"."songs" TO "service_role";
GRANT SELECT ON TABLE "public"."songs" TO "anon";


--
-- Name: TABLE "user_instruments"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_instruments" TO "anon";
GRANT ALL ON TABLE "public"."user_instruments" TO "authenticated";
GRANT ALL ON TABLE "public"."user_instruments" TO "service_role";


--
-- Name: TABLE "user_profiles"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- PostgreSQL database dump complete
--

-- \unrestrict Ij4hLZkBvADHRuIC5f8TC8ISm0rxabUjFj0U1Zo0ChjPuTXIpIkWxTEWIgv9WA2
