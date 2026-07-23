# PostgreSQL and Supabase timelines

This Next.js app presents the histories of PostgreSQL and Supabase as
interactive timelines. It adapts the open-source
[Lifeline component](https://github.com/evilrabbit/lifeline) for a black,
editorial layout with concise milestones and dated media.

## Run locally

Install the dependencies and start the development server:

```bash
pnpm install
pnpm dev -- -p 3457
```

Open `http://localhost:3457/postgres` or
`http://localhost:3457/supabase`.

## Project structure

The main project files are organized as follows:

- `lib/database-timelines.ts` contains both timeline datasets.
- `components/lifeline/` contains the timeline component source.
- `components/timeline-page.tsx` provides the shared page layout.
- `public/images/` contains the media shown on each timeline.

The Supabase timeline renders only the three approved images. Other Supabase
photos remain local and are excluded from Git until they are reviewed.

## Component registry

The repository also includes a local
[shadcn registry](https://ui.shadcn.com/docs/registry) definition for the
Lifeline component. Rebuild its generated output after changing registry
files:

```bash
npx shadcn build
```

## License

The project uses the [MIT License](./LICENSE).
