// ============================================================
// TypeScript interfaces for Developer Project Vault
// ============================================================

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  DEVELOPMENT = 'DEVELOPMENT',
  TESTING = 'TESTING',
  PRODUCTION = 'PRODUCTION',
  COMPLETED = 'COMPLETED',
}

export enum LinkCategory {
  GITHUB = 'GITHUB',
  DOCUMENTATION = 'DOCUMENTATION',
  FIGMA = 'FIGMA',
  PRODUCTION = 'PRODUCTION',
  STAGING = 'STAGING',
  API = 'API',
  POSTMAN = 'POSTMAN',
  DESIGN = 'DESIGN',
  OTHER = 'OTHER',
}

export enum CommandCategory {
  SETUP = 'SETUP',
  DEPLOYMENT = 'DEPLOYMENT',
  GIT = 'GIT',
  DOCKER = 'DOCKER',
  DATABASE = 'DATABASE',
  TESTING = 'TESTING',
  OTHER = 'OTHER',
}

export enum CredentialType {
  DATABASE = 'DATABASE',
  SERVER = 'SERVER',
  API_KEY = 'API_KEY',
  SMTP = 'SMTP',
  CLOUD = 'CLOUD',
}

export interface User {
  id: string
  name: string
  email: string
  avatar_url?: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string | null
  client_name?: string | null
  logo_url?: string | null
  status: ProjectStatus
  tech_stack: string[]
  is_archived: boolean
  created_at: string
  updated_at: string
  links?: ProjectLink[]
  notes?: ProjectNote[]
  commands?: ProjectCommand[]
  environments?: Environment[]
  credentials?: Credential[]
  deployments?: Deployment[]
  favorites?: Favorite[]
  _count?: {
    links: number
    notes: number
    commands: number
    credentials: number
    deployments: number
  }
}

export interface ProjectLink {
  id: string
  project_id: string
  title: string
  url: string
  category: string
  description?: string | null
  created_at: string
}

export interface ProjectNote {
  id: string
  project_id: string
  title: string
  content: string
  tags: string[]
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface ProjectCommand {
  id: string
  project_id: string
  title: string
  command: string
  category: string
  description?: string | null
  created_at: string
}

export interface Environment {
  id: string
  project_id: string
  name: string
  variables: EnvironmentVariable[]
  created_at: string
}

export interface EnvironmentVariable {
  id: string
  environment_id: string
  key: string
  value: string
  description?: string | null
  is_secret: boolean
  created_at: string
}

export interface Credential {
  id: string
  project_id: string
  title: string
  type: string
  username?: string | null
  password: string
  description?: string | null
  created_at: string
}

export interface Deployment {
  id: string
  project_id: string
  hosting_provider: string
  server_ip?: string | null
  production_url?: string | null
  deployed_at: string
  notes?: string | null
  status: string
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  project_id: string
  created_at: string
  project?: Project
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  entity_name: string
  created_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  read: boolean
  createdAt: string
}

export interface SearchResult {
  id: string
  type: 'project' | 'note' | 'link' | 'command' | 'credential'
  title: string
  subtitle?: string
  projectId?: string
}

export interface SearchResults {
  projects: SearchResult[]
  notes: SearchResult[]
  links: SearchResult[]
  commands: SearchResult[]
  credentials: SearchResult[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
