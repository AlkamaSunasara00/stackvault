import { ProjectStatus, LinkCategory, CommandCategory, CredentialType } from '@/types'

export const PROJECT_STATUSES = [
  { value: ProjectStatus.PLANNING, label: 'Planning', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: ProjectStatus.DEVELOPMENT, label: 'Development', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: ProjectStatus.TESTING, label: 'Testing', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: ProjectStatus.PRODUCTION, label: 'Production', color: 'bg-primary/20 text-primary border-primary/30' },
  { value: ProjectStatus.COMPLETED, label: 'Completed', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
] as const

export const LINK_CATEGORIES = [
  { value: LinkCategory.GITHUB, label: 'GitHub', icon: 'Github', color: 'text-gray-300' },
  { value: LinkCategory.DOCUMENTATION, label: 'Documentation', icon: 'BookOpen', color: 'text-blue-400' },
  { value: LinkCategory.FIGMA, label: 'Figma', icon: 'Figma', color: 'text-purple-400' },
  { value: LinkCategory.PRODUCTION, label: 'Production', icon: 'Globe', color: 'text-green-400' },
  { value: LinkCategory.STAGING, label: 'Staging', icon: 'Server', color: 'text-yellow-400' },
  { value: LinkCategory.API, label: 'API', icon: 'Zap', color: 'text-orange-400' },
  { value: LinkCategory.POSTMAN, label: 'Postman', icon: 'Send', color: 'text-orange-500' },
  { value: LinkCategory.DESIGN, label: 'Design', icon: 'Palette', color: 'text-pink-400' },
  { value: LinkCategory.OTHER, label: 'Other', icon: 'Link', color: 'text-muted' },
] as const

export const COMMAND_CATEGORIES = [
  { value: CommandCategory.SETUP, label: 'Setup', icon: 'Settings', color: 'bg-blue-500/20 text-blue-400' },
  { value: CommandCategory.DEPLOYMENT, label: 'Deployment', icon: 'Rocket', color: 'bg-green-500/20 text-green-400' },
  { value: CommandCategory.GIT, label: 'Git', icon: 'GitBranch', color: 'bg-orange-500/20 text-orange-400' },
  { value: CommandCategory.DOCKER, label: 'Docker', icon: 'Container', color: 'bg-blue-400/20 text-blue-300' },
  { value: CommandCategory.DATABASE, label: 'Database', icon: 'Database', color: 'bg-purple-500/20 text-purple-400' },
  { value: CommandCategory.TESTING, label: 'Testing', icon: 'FlaskConical', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: CommandCategory.OTHER, label: 'Other', icon: 'Terminal', color: 'bg-gray-500/20 text-gray-400' },
] as const

export const CREDENTIAL_TYPES = [
  { value: CredentialType.DATABASE, label: 'Database', icon: 'Database', color: 'bg-purple-500/20 text-purple-400' },
  { value: CredentialType.SERVER, label: 'Server', icon: 'Server', color: 'bg-blue-500/20 text-blue-400' },
  { value: CredentialType.API_KEY, label: 'API Key', icon: 'Key', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: CredentialType.SMTP, label: 'SMTP', icon: 'Mail', color: 'bg-green-500/20 text-green-400' },
  { value: CredentialType.CLOUD, label: 'Cloud', icon: 'Cloud', color: 'bg-sky-500/20 text-sky-400' },
] as const

export const ENVIRONMENT_NAMES = ['LOCAL', 'DEVELOPMENT', 'STAGING', 'PRODUCTION'] as const

export const DEPLOYMENT_STATUSES = [
  { value: 'success', label: 'Success', color: 'text-primary' },
  { value: 'failed', label: 'Failed', color: 'text-danger' },
  { value: 'pending', label: 'Pending', color: 'text-warning' },
  { value: 'rollback', label: 'Rollback', color: 'text-orange-400' },
] as const

export const HOSTING_PROVIDERS = [
  'Vercel', 'AWS', 'Google Cloud', 'Azure', 'DigitalOcean', 'Heroku', 'Netlify',
  'Railway', 'Render', 'Fly.io', 'Cloudflare', 'Linode', 'Vultr', 'Other',
] as const

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/projects', label: 'Projects', icon: 'FolderKanban' },
  { href: '/favorites', label: 'Favorites', icon: 'Star' },
  { href: '/settings', label: 'Settings', icon: 'Settings' },
] as const

export const PROJECT_TAB_ITEMS = [
  { href: 'overview', label: 'Overview', icon: 'LayoutGrid' },
  { href: 'links', label: 'Links', icon: 'Link' },
  { href: 'env', label: 'Env Variables', icon: 'FileCode' },
  { href: 'commands', label: 'Commands', icon: 'Terminal' },
  { href: 'notes', label: 'Notes', icon: 'FileText' },
  { href: 'credentials', label: 'Credentials', icon: 'Lock' },
  { href: 'deployment', label: 'Deployment', icon: 'Rocket' },
] as const
