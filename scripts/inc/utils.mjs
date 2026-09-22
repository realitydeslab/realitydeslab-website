export const fileIsPublished = (data) => {
  return data?.published === true
}

export const vault_root = process.env.VAULT_ROOT ?? 'vault'
export const cache_root = process.env.CACHE_ROOT ?? '.cache'
