import { PersistentStorage } from '@testquality/sdk';
import { env, saveEnv } from './EnvironmentManager';

import Debug from 'debug';
const debug = Debug('tq:cli:EnvironmentStorage');

export class EnvironmentStorage implements PersistentStorage {
  static save = false;

  static enableSave(): void {
    EnvironmentStorage.save = true;
  }

  public set<T>(property: string, value: T, that: any = this): void {
    (env.auth as any)[property] = JSON.stringify(value);
    if (that[property] !== value) {
      that[property] = value; // eslint-disable-line
    }
    debug('set', { property, value, save: EnvironmentStorage.save });
    if (EnvironmentStorage.save) {
      saveEnv();
    }
  }

  public get<T>(property: string, defaultVal?: T, that: any = this): T {
    if (that[property] === undefined) {
      const value = (env.auth as any)[property];
      if (value !== undefined && value !== null) {
        that[property] = JSON.parse(value); // eslint-disable-line
      } else if (defaultVal !== undefined) {
        that[property] = defaultVal; // eslint-disable-line
      }
    }
    return that[property];
  }
}
