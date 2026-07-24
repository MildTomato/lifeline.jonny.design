import { readFile } from "node:fs/promises"
import path from "node:path"
import { cache } from "react"

import type { StargazerPoint } from "@/lib/stargazer-data"

function dateToDecimalYear(date: string) {
  const [year, month, day] = date.split("-").map(Number)
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year + 1, 0, 1)
  const dateValue = Date.UTC(year, month - 1, day)

  return year + (dateValue - start) / (end - start)
}

export const getSupabaseStargazers = cache(
  async (): Promise<StargazerPoint[]> => {
    const filePath = path.join(
      process.cwd(),
      "data",
      "supabase-stargazers.tsv",
    )
    const source = await readFile(filePath, "utf8")

    return source
      .trim()
      .split("\n")
      .slice(1)
      .map((row) => {
        const columns = row.split("\t")
        const stargazers = Number(columns[2])
        const date = columns[3]

        return {
          date,
          year: dateToDecimalYear(date),
          stargazers,
          measurement: columns[4],
        }
      })
      .filter(
        (point) =>
          point.date &&
          Number.isFinite(point.year) &&
          Number.isFinite(point.stargazers),
      )
  },
)
