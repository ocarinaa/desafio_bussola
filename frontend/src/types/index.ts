export interface User {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary: number;
  created_by: number;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  status: string;
  message: string;
  user?: User;
  job?: Job;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
