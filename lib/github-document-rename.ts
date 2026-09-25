import { getDatedDocumentPath } from "./meeting-cms"

type RenameOptions = {
  apiUrl: string
  headers: Record<string, string>
  path: string
  date: string
  sha: string
  content: string
}

// The Contents API is used here instead of the lower-level Git Database API.
// The site's token is scoped for repository contents, while updating a Git ref
// requires additional permissions that are not needed for normal file edits.
export async function renameGitHubDocument(
  options: RenameOptions,
  fetcher = fetch,
) {
  const { apiUrl, headers, path, date, sha, content } = options
  const nextPath = getDatedDocumentPath(path, date)
  const encodePath = (value: string) =>
    value.split("/").map(encodeURIComponent).join("/")

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
  const ref = `?ref=${encodeURIComponent(branch)}`
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

  const created = await request<{ content?: { sha?: string } }>(
    `contents/${encodePath(nextPath)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: `Update document date: ${path} → ${nextPath}`,
        content,
        branch,
      }),
    },
  )
  const nextSha = created.content?.sha

  if (!nextSha) {
    throw new Error("O GitHub não retornou o SHA do novo arquivo.")
  }

  try {
    await request(`contents/${encodePath(path)}`, {
      method: "DELETE",
      body: JSON.stringify({
        message: `Remove old document name: ${path}`,
        sha,
        branch,
      }),
    })
  } catch (error) {
    try {
      await request(`contents/${encodePath(nextPath)}`, {
        method: "DELETE",
        body: JSON.stringify({
          message: `Rollback document rename: ${nextPath}`,
          sha: nextSha,
          branch,
        }),
      })
    } catch {
      throw new Error(
        "O novo nome foi criado, mas não foi possível remover o nome antigo nem desfazer a alteração. Verifique o repositório no GitHub.",
      )
    }

    throw error
  }

  return { path: nextPath, sha: nextSha }
}
