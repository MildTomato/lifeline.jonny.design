import type { LifelineEventSegment } from "@/components/lifeline"
import { defineLifeline, type LifelineRecord } from "@/lib/lifeline-data"

interface TimelineSource {
  label: string
  href: string
}

function milestone(
  title: string,
  description: string,
  ...sources: TimelineSource[]
): LifelineEventSegment[] {
  const [primarySource, ...additionalSources] = sources
  const segments: LifelineEventSegment[] = primarySource
    ? [
        { type: "link", value: title, href: primarySource.href },
        { type: "break" },
        { type: "text", value: description },
      ]
    : [
        { type: "emphasis", value: title },
        { type: "break" },
        { type: "text", value: description },
      ]

  additionalSources.forEach((source) => {
    segments.push({ type: "text", value: " · " })
    segments.push({ type: "link", value: `${source.label} ↗`, href: source.href })
  })

  return segments
}

function datedPosition(year: number, month: number, day = 1) {
  return year + (month - 1) / 12 + (day - 1) / 366
}

const postgresqlHistory = {
  label: "Source",
  href: "https://www.postgresql.org/docs/current/history.html",
}

export const postgresTimeline = defineLifeline({
  slug: "postgresql",
  name: "PostgreSQL",
  birthYear: 1986,
  endYear: 2026,
  description:
    "From a Berkeley research project to the world’s most advanced open-source relational database.",
  milestones: {
    1986: {
      id: "postgres-project-begins",
      age: "Origin",
      events: [
        milestone(
          "POSTGRES begins",
          "UC Berkeley starts building a successor to Ingres.",
          postgresqlHistory,
        ),
      ],
      photos: [
        {
          src: "/images/postgres/michael-stonebraker.jpg",
          alt: "Michael Stonebraker, leader of the POSTGRES research project.",
          x: 0,
          y: 108,
          width: 190,
        },
      ],
    },
    1989: {
      id: "postgres-version-one",
      events: [
        milestone(
          "Version 1",
          "POSTGRES reaches its first external users.",
          postgresqlHistory,
        ),
      ],
    },
    1994: {
      id: "postgres95-sql",
      events: [
        milestone(
          "SQL arrives",
          "PostQUEL is replaced, creating the Postgres95 line.",
          postgresqlHistory,
        ),
      ],
      photos: [
        {
          src: "/images/postgres/postgres95-jolly-chen-andrew-yu.jpg",
          alt: "Postgres95 developers Jolly Chen and Andrew Yu.",
          x: 0,
          y: 116,
          width: 150,
        },
      ],
    },
    1996: {
      id: "postgres-public-development",
      events: [
        milestone(
          "Public development begins",
          "A volunteer community forms around the first public CVS server.",
          {
            label: "Source",
            href: "https://www.postgresql.org/about/news/happy-birthday-postgresql-978/",
          },
        ),
      ],
      photos: [
        {
          src: "/images/postgres/postgresql-1996-logo.jpg",
          alt: "The Postgres95 logo used around the project’s 1996 transition.",
          x: 0,
          y: 124,
          width: 220,
        },
      ],
    },
    1997: {
      id: "postgresql-six",
      events: [
        milestone(
          "PostgreSQL 6.0",
          "Postgres95 gets the name it still carries today.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/6.0.0/",
          },
        ),
      ],
    },
    2000: {
      id: "postgresql-seven",
      events: [
        milestone(
          "PostgreSQL 7.0",
          "Foreign keys and SQL-92 joins deepen standards support.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/7.0.0/",
          },
        ),
      ],
      photos: [
        {
          src: "/images/postgres/postgresql-core-team-2000.jpg",
          alt: "The PostgreSQL core team around 2000.",
          x: 0,
          y: 110,
          width: 185,
        },
      ],
    },
    2001: {
      id: "postgresql-wal-toast",
      events: [
        milestone(
          "WAL and TOAST",
          "Write-ahead logging and large-value storage land in 7.1.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/7.1.0/",
          },
        ),
      ],
    },
    2005: {
      id: "postgresql-eight",
      events: [
        milestone(
          "PostgreSQL 8.0",
          "Native Windows support and point-in-time recovery arrive.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/8.0.0/",
          },
        ),
      ],
    },
    2006: {
      id: "postgresql-tenth-anniversary",
      events: [
        milestone(
          "PostgreSQL turns ten",
          "The community meets in Toronto for its first anniversary summit.",
          {
            label: "Anniversary summit",
            href: "https://www.postgresql.org/about/event/postgresql-anniversary-summit-351/",
          },
        ),
      ],
      photos: [
        {
          src: "/images/postgres/postgresql-anniversary-2006.jpg",
          alt: "PostgreSQL Anniversary Summit attendees in Toronto in 2006.",
          x: 0,
          y: 106,
          width: 220,
        },
      ],
    },
    2009: {
      id: "postgresql-analytical-sql",
      events: [
        milestone(
          "Modern analytical SQL",
          "Window functions, CTEs, and recursive queries ship in 8.4.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/8.4.0/",
          },
        ),
      ],
    },
    2010: {
      id: "postgresql-replication",
      events: [
        milestone(
          "Built-in replication",
          "Streaming replication and hot standby arrive in 9.0.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/9.0.0/",
          },
        ),
      ],
      photos: [
        {
          src: "/images/postgres/postgresql-9-community-2010.jpg",
          alt: "PostgreSQL community members at a conference booth in 2010.",
          x: 0,
          y: 112,
          width: 190,
        },
      ],
    },
    2011: {
      id: "postgresql-extensions",
      events: [
        milestone(
          "Extensions and foreign tables",
          "9.1 makes PostgreSQL dramatically easier to extend.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/9.1.0/",
          },
        ),
      ],
    },
    2012: {
      id: "postgresql-json",
      events: [
        milestone(
          "Native JSON",
          "PostgreSQL 9.2 adds a JSON data type.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/9.2.0/",
          },
        ),
      ],
    },
    2014: {
      id: "postgresql-jsonb",
      events: [
        milestone(
          "JSONB and logical decoding",
          "Binary JSON becomes indexable in PostgreSQL 9.4.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/9.4.0/",
          },
        ),
      ],
    },
    2016: {
      id: "postgresql-nine-five-six",
      events: [
        milestone(
          "UPSERT and row-level security",
          "9.5 adds ON CONFLICT, RLS, and BRIN indexes.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/9.5.0/",
          },
        ),
        milestone(
          "Parallel query",
          "9.6 starts running scans, joins, and aggregates in parallel.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/9.6.0/",
          },
        ),
      ],
    },
    2017: {
      id: "postgresql-ten",
      events: [
        milestone(
          "PostgreSQL 10",
          "Logical replication and declarative partitioning arrive.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/10.0/",
          },
        ),
      ],
    },
    2018: {
      id: "postgresql-eleven",
      events: [
        milestone(
          "Procedures and JIT",
          "PostgreSQL 11 adds transactional procedures and optional JIT.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/11.0/",
          },
        ),
      ],
    },
    2020: {
      id: "postgresql-thirteen",
      events: [
        milestone(
          "Leaner indexes",
          "PostgreSQL 13 adds B-tree deduplication and incremental sorting.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/13.0/",
          },
        ),
      ],
    },
    2022: {
      id: "postgresql-fifteen",
      events: [
        milestone(
          "SQL MERGE",
          "PostgreSQL 15 adds the SQL-standard MERGE command.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/15.0/",
          },
        ),
      ],
    },
    2024: {
      id: "postgresql-seventeen",
      events: [
        milestone(
          "Incremental backups",
          "PostgreSQL 17 also brings JSON_TABLE and failover controls.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/17.0/",
          },
        ),
      ],
    },
    2025: {
      id: "postgresql-eighteen",
      events: [
        milestone(
          "Asynchronous I/O",
          "PostgreSQL 18 adds AIO, skip scans, UUIDv7, and OAuth.",
          {
            label: "Notes",
            href: "https://www.postgresql.org/docs/release/18.0/",
          },
        ),
      ],
    },
    2026: {
      id: "postgresql-thirty-years",
      events: [
        milestone(
          "The community marks 30 years",
          "PGConf.dev gathers contributors around the project’s anniversary.",
          {
            label: "Source",
            href: "https://www.postgresql.org/message-id/177389504953.809.15334131174550128853%40wrigleys.postgresql.org",
          },
        ),
      ],
      photos: [
        {
          src: "/images/postgres/postgresql-community-2026.jpg",
          alt: "PostgreSQL community group portrait in 2026.",
          x: 0,
          y: 104,
          width: 200,
        },
      ],
    },
  },
})

export const supabaseTimeline: LifelineRecord = {
  slug: "supabase",
  name: "Supabase",
  birthYear: 2019,
  endYear: 2026,
  description:
    "From a Postgres Realtime experiment to an open-source data platform used by millions of developers.",
  markers: [
    {
      id: "supabase-origin",
      year: datedPosition(2019, 11),
      age: "Origin",
      label: "2019",
      periodLabel: "Nov 1, 2019",
      events: [
        milestone(
          "Realtime plants the seed",
          "An open-source Postgres engine becomes the starting point for Supabase.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-dot-com",
          },
        ),
      ],
    },
    {
      id: "supabase-founded",
      year: datedPosition(2020, 1),
      age: "1y",
      label: "2020",
      periodLabel: "Jan 1, 2020",
      events: [
        milestone(
          "Supabase is founded",
          "Paul Copplestone and Ant Wilson join Y Combinator S20.",
          {
            label: "Source",
            href: "https://www.ycombinator.com/companies/supabase",
          },
        ),
      ],
    },
    {
      id: "supabase-offsite-2020",
      year: datedPosition(2020, 1, 15),
      age: "1y",
      label: "2020",
      periodLabel: "Jan 15, 2020",
      events: [
        milestone(
          "2020 Team Off Site",
          "The early team meets in person.",
        ),
      ],
      photos: [
        {
          src: "/images/supabase/early-work-2020.jpg",
          alt: "The early Supabase team working together on September 4, 2020.",
          aspectRatio: 1600 / 2133,
          x: 0,
          y: 96,
          width: 180,
        },
      ],
    },
    {
      id: "supabase-alpha-launch",
      year: datedPosition(2020, 5, 27),
      age: "1y",
      label: "2020",
      periodLabel: "May 27, 2020",
      events: [
        milestone(
          "The alpha escapes",
          "An unplanned Hacker News launch quickly passes 1,000 databases.",
          {
            label: "Source",
            href: "https://supabase.com/blog/alpha-launch-postmortem",
          },
        ),
      ],
    },
    {
      id: "supabase-auth",
      year: datedPosition(2020, 8, 5),
      age: "1y",
      label: "2020",
      periodLabel: "Aug 5, 2020",
      events: [
        milestone(
          "Supabase Auth",
          "GoTrue authentication joins PostgREST and Row Level Security.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-auth",
          },
        ),
      ],
    },
    {
      id: "supabase-beta",
      year: datedPosition(2021, 1, 2),
      age: "1y",
      label: "2021",
      periodLabel: "Jan 2, 2021",
      events: [
        milestone(
          "Beta and seed round",
          "Supabase enters beta and announces $6 million in funding.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-beta-december-2020",
          },
        ),
      ],
      photos: [
        {
          src: "/images/supabase/early-team-apartment-2020.jpg",
          alt: "The early Supabase team working together on December 7, 2020.",
          aspectRatio: 4 / 3,
          x: 0,
          y: 104,
          width: 210,
        },
      ],
    },
    {
      id: "supabase-offsite-2021",
      year: datedPosition(2021, 1, 15),
      age: "1y",
      label: "2021",
      periodLabel: "Jan 15, 2021",
      events: [
        milestone(
          "2021 team offsite",
          "The growing remote team gets together.",
        ),
      ],
      photos: [
        {
          src: "/images/supabase/team-working-2021.png",
          alt: "The Supabase team working together on June 2, 2021.",
          aspectRatio: 16 / 9,
          x: 0,
          y: 96,
          width: 220,
        },
      ],
    },
    {
      id: "supabase-storage",
      year: datedPosition(2021, 3, 30),
      age: "1y",
      label: "2021",
      periodLabel: "Mar 30, 2021",
      events: [
        milestone(
          "Storage launches",
          "Files and database rows share the same access rules.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-storage",
          },
        ),
      ],
    },
    {
      id: "supabase-series-a",
      year: datedPosition(2021, 10, 28),
      age: "2y",
      label: "2021",
      periodLabel: "Oct 28, 2021",
      events: [
        milestone(
          "$30M Series A",
          "Hosted usage reaches 50,000 databases and 40,000 developers.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-series-a",
          },
        ),
      ],
    },
    {
      id: "supabase-studio-open-source",
      year: datedPosition(2021, 11, 30),
      age: "2y",
      label: "2021",
      periodLabel: "Nov 30, 2021",
      events: [
        milestone(
          "Supabase Studio is released",
          "Supabase publishes the dashboard as open source.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-studio",
          },
        ),
      ],
    },
    {
      id: "supabase-logflare",
      year: datedPosition(2021, 12, 2),
      age: "2y",
      label: "2021",
      periodLabel: "Dec 2, 2021",
      events: [
        milestone(
          "Logflare joins Supabase",
          "Observability becomes part of the platform.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-acquires-logflare",
          },
        ),
      ],
    },
    {
      id: "supabase-offsite-2022",
      year: datedPosition(2022, 1, 15),
      age: "2y",
      label: "2022",
      periodLabel: "Jan 15, 2022",
      events: [
        milestone(
          "2022 team offsite",
          "The distributed team meets for workshops and time together.",
        ),
      ],
    },
    {
      id: "supabase-edge-functions",
      year: datedPosition(2022, 3, 31),
      age: "2y",
      label: "2022",
      periodLabel: "Mar 31, 2022",
      events: [
        milestone(
          "Edge Functions launch",
          "Globally distributed TypeScript functions join the stack.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-edge-functions",
          },
        ),
      ],
    },
    {
      id: "supabase-series-b",
      year: datedPosition(2022, 8, 12),
      age: "3y",
      label: "2022",
      periodLabel: "Aug 12, 2022",
      events: [
        milestone(
          "$80M Series B",
          "Hosted database launches pass 150,000.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-series-b",
          },
        ),
      ],
    },
    {
      id: "supabase-offsite-2023",
      year: datedPosition(2023, 1, 15),
      age: "4y",
      label: "2023",
      periodLabel: "Jan 15, 2023",
      events: [
        milestone(
          "The company meets in Bali",
          "The annual 11-day offsite brings the remote team together.",
          {
            label: "Source",
            href: "https://supabase.com/blog/why-supabase-remote",
          },
        ),
      ],
    },
    {
      id: "supabase-offsite-2024",
      year: datedPosition(2024, 1, 15),
      age: "4y",
      label: "2024",
      periodLabel: "Jan 15, 2024",
      events: [
        milestone(
          "2024 company offsite",
          "The distributed company meets in person.",
          {
            label: "Source",
            href: "https://supabase.com/blog/why-supabase-remote",
          },
        ),
      ],
    },
    {
      id: "supabase-general-availability",
      year: datedPosition(2024, 4, 15),
      age: "4y",
      label: "2024",
      periodLabel: "Apr 15, 2024",
      events: [
        milestone(
          "General Availability",
          "Supabase leaves beta after reaching one million databases.",
          {
            label: "Source",
            href: "https://supabase.com/ga",
          },
        ),
      ],
    },
    {
      id: "supabase-series-c",
      year: datedPosition(2024, 9, 25),
      age: "4y",
      label: "2024",
      periodLabel: "Sep 25, 2024",
      events: [
        milestone(
          "$80M Series C",
          "Total funding reaches $196 million.",
          {
            label: "Source",
            href: "https://supabase.com/changelog/29828-developer-update-september-2024",
          },
        ),
      ],
    },
    {
      id: "supabase-offsite-2025",
      year: datedPosition(2025, 1, 15),
      age: "5y",
      label: "2025",
      periodLabel: "Jan 15, 2025",
      events: [
        milestone(
          "2025 company offsite",
          "The distributed company meets in person.",
          {
            label: "Source",
            href: "https://supabase.com/blog/why-supabase-remote",
          },
        ),
      ],
    },
    {
      id: "supabase-series-d",
      year: datedPosition(2025, 4, 22),
      age: "5y",
      label: "2025",
      periodLabel: "Apr 22, 2025",
      events: [
        milestone(
          "$200M Series D",
          "Accel leads the round at a $2 billion valuation.",
          {
            label: "Source",
            href: "https://www.accel.com/news/supabase-powering-the-next-generation-of-ai-applications",
          },
        ),
      ],
    },
    {
      id: "supabase-multigres",
      year: datedPosition(2025, 6, 10),
      age: "5y",
      label: "2025",
      periodLabel: "Jun 10, 2025",
      events: [
        milestone(
          "Multigres is announced",
          "Supabase starts building a Postgres-native scale-out system.",
          {
            label: "Source",
            href: "https://supabase.com/blog/multigres-vitess-for-postgres",
          },
        ),
      ],
    },
    {
      id: "supabase-series-e",
      year: datedPosition(2025, 10, 3),
      age: "5y",
      label: "2025",
      periodLabel: "Oct 3, 2025",
      events: [
        milestone(
          "$100M Series E",
          "The round values Supabase at $5 billion pre-money.",
          {
            label: "Source",
            href: "https://supabase.com/blog/supabase-series-e",
          },
        ),
      ],
    },
    {
      id: "supabase-hydra",
      year: datedPosition(2026, 2, 10),
      age: "6y",
      label: "2026",
      periodLabel: "Feb 10, 2026",
      events: [
        milestone(
          "Hydra joins Supabase",
          "The team starts an open warehouse architecture around Postgres.",
          {
            label: "Source",
            href: "https://supabase.com/blog/hydra-joins-supabase",
          },
        ),
      ],
    },
    {
      id: "supabase-hundred-thousand-stars",
      year: datedPosition(2026, 4, 2),
      age: "6y",
      label: "2026",
      periodLabel: "Apr 2, 2026",
      events: [
        milestone(
          "100K GitHub stars",
          "Supabase reports eight million developers.",
          {
            label: "Source",
            href: "https://supabase.com/blog/100000-github-stars",
          },
        ),
      ],
    },
    {
      id: "supabase-branching-default",
      year: datedPosition(2026, 5, 4),
      age: "6y",
      label: "2026",
      periodLabel: "May 4, 2026",
      events: [
        milestone(
          "Branching without Git becomes default",
          "Dashboard-native database branches reach every project.",
          {
            label: "Source",
            href: "https://supabase.com/blog/branching-without-git-is-now-the-default",
          },
        ),
      ],
    },
    {
      id: "supabase-series-f",
      year: datedPosition(2026, 6, 4),
      age: "6y",
      label: "2026",
      periodLabel: "Jun 4, 2026",
      events: [
        milestone(
          "$500M Series F",
          "Multigres v0.1 ships alongside the funding round.",
          {
            label: "Source",
            href: "https://supabase.com/blog/series-f",
          },
        ),
      ],
    },
  ],
}

export const databaseTimelines = {
  postgres: postgresTimeline,
  supabase: supabaseTimeline,
} as const

export type DatabaseTimelineId = keyof typeof databaseTimelines
