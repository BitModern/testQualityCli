/**
 * Copyright (C) 2020 BitModern, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Created by jamespitts on 4/10/20.
 */

export class HttpError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    if (!statusCode) {
      this.statusCode = 404;
    }
  }
}
