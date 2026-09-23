import assert from "node:assert/strict"
import test from "node:test"
import {
  formatDocumentDate,
  getDatedDocumentPath,
  getDocumentDate,
  getDocumentNameWithoutDate,
  getGeneratedMeetingPath,
  getMeetingFrontmatterForForm,
  normalizeMeetingFrontmatter,
} from "../lib/meeting-cms"
import { renameGitHubDocument } from "../lib/github-document-rename"

test("dates are read only from a valid filename prefix, regardless of old metadata", () => {
  assert.equal(getDocumentDate("pasta/2024-02-29-reuniao.md"), "2024-02-29")
  for (const path of [
    "reuniao.md",
    "2025-02-29-reuniao.md",
    "2026-13-02-notas.md",
    "2026-09-23.md",
    "notas-2026-09-23.md",
    "2026-09-23/notas.md",
  ]) {
    assert.equal(getDocumentDate(path), "", path)
  }
  assert.equal(
    getMeetingFrontmatterForForm({ date: "2020-01-01" }, "Notas", "notas.md")
      .date,
    "",
  )
  assert.equal(
    getMeetingFrontmatterForForm(
      { date: "2020-01-01" },
      "Notas",
      "2026-09-23-notas.md",
    ).date,
    "2026-09-23",
  )
  assert.equal(formatDocumentDate(""), "?")
  assert.equal(formatDocumentDate("2026-09-23"), "23/09/2026")
})

test("creating and editing a date preserves the folder and document basename", () => {
  assert.equal(
    getGeneratedMeetingPath("2026-09-23", "Reunião da direção"),
    "2026-09-23-reuniao-da-direcao.md",
  )
  assert.equal(
    getDatedDocumentPath("Pasta/Notas.MD", "2026-09-23"),
    "Pasta/2026-09-23-Notas.MD",
  )
  assert.equal(
    getDatedDocumentPath("Pasta/2025-02-28-Notas.MD", "2026-09-23"),
    "Pasta/2026-09-23-Notas.MD",
  )
  assert.equal(getDatedDocumentPath("Pasta/Notas.MD", ""), "Pasta/Notas.MD")
  assert.equal(
    getDocumentNameWithoutDate("Pasta/2026-09-23-Notas.MD"),
    "Notas.MD",
  )
  assert.throws(() => getDatedDocumentPath("notas.md", "2026-02-30"))
})

test("legacy documents can remain undated, while new documents require a date", () => {
  const input = {
    title: " Notas ",
    author: " Autor ",
    date: "",
    category: "Geral",
    tags: ["old"],
  }
  assert.deepEqual(normalizeMeetingFrontmatter(input), {
    title: "Notas",
    author: "Autor",
    date: "",
  })
  assert.throws(() => normalizeMeetingFrontmatter(input, { requireDate: true }))
})

const options = {
  apiUrl: "https://example.test/repos/test/docs",
  headers: {},
  path: "pasta/notas.md",
  date: "2026-09-23",
  sha: "old-blob",
  content: Buffer.from("# Texto\n").toString("base64"),
}
function mockGitHub({
  collision = false,
  stale = false,
  concurrent = false,
  targetStatus = 404,
} = {}) {
  const writes: { resource: string; body: Record<string, unknown> }[] = []
  const reads: string[] = []
  const fetcher = (async (input, init) => {
    const resource = String(input).replace(`${options.apiUrl}/`, "")
    const respond = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status })
    if (init?.method) {
      const body = JSON.parse(init.body as string)
      writes.push({ resource, body })
      if (resource === "git/blobs") return respond({ sha: "new-blob" })
      if (resource === "git/trees") return respond({ sha: "new-tree" })
      if (resource === "git/commits") return respond({ sha: "new-commit" })
      if (resource === "git/refs/heads/main")
        return respond({}, concurrent ? 422 : 200)
    }
    reads.push(resource)
    if (resource === "") return respond({ default_branch: "main" })
    if (resource === "git/ref/heads/main")
      return respond({ object: { sha: "head-commit" } })
    if (resource === "git/commits/head-commit")
      return respond({ tree: { sha: "base-tree" } })
    if (resource === "contents/pasta/notas.md?ref=head-commit")
      return respond({ sha: stale ? "changed-blob" : "old-blob" })
    if (resource === "contents/pasta/2026-09-23-notas.md?ref=head-commit")
      return respond({}, collision ? 200 : targetStatus)
    throw new Error(`Unexpected request: ${resource}`)
  }) as typeof fetch
  return { fetcher, writes, reads }
}

test("changing the date commits the rename and content together, with no forced updates", async () => {
  const mock = mockGitHub()
  const result = await renameGitHubDocument(options, mock.fetcher)
  assert.deepEqual(result, {
    path: "pasta/2026-09-23-notas.md",
    sha: "new-blob",
  })
  assert.deepEqual(
    mock.writes.find((write) => write.resource === "git/trees")?.body,
    {
      base_tree: "base-tree",
      tree: [
        { path: "pasta/notas.md", mode: "100644", type: "blob", sha: null },
        { path: result.path, mode: "100644", type: "blob", sha: "new-blob" },
      ],
    },
  )
  assert.deepEqual(mock.writes.at(-1)?.body, {
    sha: "new-commit",
    force: false,
  })
  assert.equal(
    mock.writes.filter((write) => write.resource.includes("refs/")).length,
    1,
  )
})

for (const [label, scenario] of Object.entries({
  collision: { collision: true },
  stale: { stale: true },
  permission: { targetStatus: 403 },
})) {
  test(`rename refuses ${label} without writing to the repository`, async () => {
    const mock = mockGitHub(scenario)
    await assert.rejects(renameGitHubDocument(options, mock.fetcher))
    assert.equal(mock.writes.length, 0)
  })
}

test("a concurrent branch change fails safely instead of forcing the new commit", async () => {
  const mock = mockGitHub({ concurrent: true })
  await assert.rejects(
    renameGitHubDocument(options, mock.fetcher),
    /Recarregue/,
  )
  assert.deepEqual(mock.writes.at(-1)?.body, {
    sha: "new-commit",
    force: false,
  })
})
