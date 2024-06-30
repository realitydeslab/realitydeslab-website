export const fileIsPublished = (data) => {
  return (data && data.draft !== undefined && data.draft !== false) || data.published
}

export const vault_root = process.env.VAULT_ROOT ?? 'vault'
export const cache_root = process.env.CACHE_ROOT ?? '.cache'
