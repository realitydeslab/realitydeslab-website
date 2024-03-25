export const fileIsPublished = (data) => {
  return (data && data.draft !== undefined && data.draft !== false) || data.published
}
