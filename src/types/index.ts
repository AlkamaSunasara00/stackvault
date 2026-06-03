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
  guest_password?: string | null
  is_guest?: boolean
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
  environments?: Environment[]
  credentials?: Credential[]
  favorites?: Favorite[]
  tasks?: Task[]
  _count?: {
    links: number
    notes: number
    credentials: number
    tasks: number
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

// ProjectIntegration interface has been deleted

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
  type: 'project' | 'note' | 'link' | 'task' | 'credential'
  title: string
  subtitle?: string
  projectId?: string
}

export interface SearchResults {
  projects: SearchResult[]
  notes: SearchResult[]
  links: SearchResult[]
  tasks: SearchResult[]
  credentials: SearchResult[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Task {
  id: string
  project_id: string
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date?: string | null
  created_at: string
  updated_at: string
}

