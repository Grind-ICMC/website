import { getDatedDocumentPath } from "./meeting-cms"

type RenameOptions = {
  apiUrl: string
  headers: Record<string, string>
  path: string
  date: string
  sha: string
  content: string
}

// Create and remove the two tree entries in a single commit. A non-fast-forward
// ref update fails if another writer changed the branch in the meantime.
export async function renameGitHubDocument(
  options: RenameOptions,
  fetcher = fetch,
) {
  const { apiUrl, headers, path, date, sha, content } = options
  const nextPath = getDatedDocumentPath(path, date)
  async function request<T>(resource: string, init?: RequestInit): Promise<T> {
    const response = await fetcher(`${apiUrl}/${resource}`, {
      cache: "no-store",
      ...init,
      headers,
    })
    if (!response.ok) {
      if (response.status === 409 || response.status === 422) {
        throw new Error(
          "O repositório mudou durante o salvamento. Recarregue o documento e tente novamente.",
        )
      }
      throw new Error(
        `Não foi possível salvar a nova data no GitHub (${response.status}).`,
      )
    }
    return response.json() as Promise<T>
  }
  const repo = await request<{ default_branch: string }>("")
  const branch = repo.default_branch
    .split("/")
    .map(encodeURIComponent)
    .join("/")
  const head = await request<{ object: { sha: string } }>(
    `git/ref/heads/${branch}`,
  )
  const commit = await request<{ tree: { sha: string } }>(
    `git/commits/${head.object.sha}`,
  )
  const encodePath = (value: string) =>
    value.split("/").map(encodeURIComponent).join("/")
  const ref = `?ref=${encodeURIComponent(head.object.sha)}`
  const source = await request<{ sha: string }>(
    `contents/${encodePath(path)}${ref}`,
  )
  if (source.sha !== sha) {
    throw new Error(
      "Este documento foi alterado por outra pessoa. Recarregue antes de salvar.",
    )
  }
  const destination = await fetcher(
    `${apiUrl}/contents/${encodePath(nextPath)}${ref}`,
    { cache: "no-store", headers },
  )
  if (destination.ok)
    throw new Error(
      "Já existe um documento com esse nome e essa data nesta pasta.",
    )
  if (destination.status !== 404)
    throw new Error("Não foi possível verificar o nome do documento no GitHub.")

  const blob = await request<{ sha: string }>("git/blobs", {
    method: "POST",
    body: JSON.stringify({ content, encoding: "base64" }),
  })
  const tree = await request<{ sha: string }>("git/trees", {
    method: "POST",
    body: JSON.stringify({
      base_tree: commit.tree.sha,
      tree: [
        { path, mode: "100644", type: "blob", sha: null },
        { path: nextPath, mode: "100644", type: "blob", sha: blob.sha },
      ],
    }),
  })
  const nextCommit = await request<{ sha: string }>("git/commits", {
    method: "POST",
    body: JSON.stringify({
      message: `Update document date: ${path} → ${nextPath}`,
      tree: tree.sha,
      parents: [head.object.sha],
    }),
  })
  await request(`git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: nextCommit.sha, force: false }),
  })
  return { path: nextPath, sha: blob.sha }
}
