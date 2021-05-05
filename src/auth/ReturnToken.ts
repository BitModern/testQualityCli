/**
 * Copyright (C) 2020 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by jamespitts on 3/31/20.
 */

export interface ReturnTokenFailure {
  project_id?: number;
  project_name?: string;
  message: string;
}

export interface ReturnToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
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
  failures: ReturnTokenFailure[];
}
