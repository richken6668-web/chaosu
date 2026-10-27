export const themeModules = import.meta.glob('../../src/themes/*/index.tsx')
export const themeDesignDocs = import.meta.glob('../../src/themes/*/DESIGN.md', { query: '?raw', import: 'default' })

export const getThemeInfo = (dirName: string): { name: string; description: string } => {
  const nameMap: Record<string, { name: string; description: string }> = {
    'equatorial-minimalism': { name: 'Equatorial Minimalism', description: '非洲即时通讯设计系统' },
  }
  return nameMap[dirName] || { name: dirName, description: '品牌主题设计' }
}
