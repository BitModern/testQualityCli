/**
 * Copyright (C) 2021 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 */
import { RunStatusAnalysisApi } from './RunStatusAnalysisApi';

export interface RunAnalysisApi {
  status: RunStatusAnalysisApi[];
  defect_count: number;
}
