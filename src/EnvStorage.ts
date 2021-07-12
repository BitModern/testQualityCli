import { PersistentStorage } from '@testquality/sdk';
import { env, saveEnv } from './env';

export class EnvStorage implements PersistentStorage {
  public set<T>(property: string, value: T, that: any = this): void {
    (env.auth as any)[property] = JSON.stringify(value);
    saveEnv();

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
