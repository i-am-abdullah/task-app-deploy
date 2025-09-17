export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export enum BoardStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export enum UserRole {
  ADMIN = 'admin',
  TEAM_LEAD = 'team_lead',
  USER = 'user'
}

export enum ListStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  BLOCKED = 'blocked'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}