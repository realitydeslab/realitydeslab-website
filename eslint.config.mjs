import nextVitals from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier/flat'
export default [
  ...nextVitals,
  prettier,
  { ignores: ['.next/**', '.contentlayer/**', '.cache/**', 'vault/**', 'public/**', 'output/**', 'node_modules/**'] },
]
