/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
export interface ResourceList<T> {
  total: number;
  per_page: number;
  current_page: number;
  last_page?: number;
  next_page_url?: string;
  prev_page_url?: string;
  from?: number;
  to?: number;
  data: T[];
}

export function createResourceList<T>(data: T[]): ResourceList<T> {
  return {
    total: data.length,
    per_page: 25,
    current_page: 1,
    last_page: 1,
    data,
  };
}
