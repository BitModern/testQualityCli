export interface IReturnTokenFailure {
  project_id?: number;
  project_name?: string;
  message: string;
}

export interface IReturnToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  expires_at: string;
  client_name: string;
  user_id: number;
  client_id: number;
  verification_ended_at: string;
  verification_ends_at: string;
  message: string;
  trial_ended_at: string;
  trial_ends_at: string;
  subscription_ends_at: string;
  subscription_ended_at: string;
  is_expired: boolean;
  github_open_source_subscription_invalid: boolean;
  failures: IReturnTokenFailure[];
}
