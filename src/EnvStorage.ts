import { type PersistentStorage } from '@testquality/sdk';
import { env, saveEnv } from './env';

import Debug from 'debug';
const debug = Debug('tq:cli:EnvStorage');

export class EnvStorage implements PersistentStorage {
  static save = false;

  static enableSave(): void {
    EnvStorage.save = true;
  }

  public set<T>(property: string, value: T, that: any = this): void {
    const stringifiedValue = JSON.stringify(value);
    const hasValueChanged = (env.auth as any)[property] !== stringifiedValue;

    debug('set %j', {
      property,
      value,
      hasValueChanged,
      save: EnvStorage.save,
    });

    if (hasValueChanged) {
      (env.auth as any)[property] = stringifiedValue;
      if (EnvStorage.save) {
        saveEnv();
      }
    }

    if (that[property] !== value) {
      that[property] = value; // eslint-disable-line
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
