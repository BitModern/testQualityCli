import { PersistentStorage } from '@testquality/sdk';
import { env, saveEnv } from './env';

export class EnvStorage implements PersistentStorage {
  static save = false;

  static enableSave(): void {
    EnvStorage.save = true;
  }

  public set<T>(property: string, value: T, that: any = this): void {
    if (!env.auth) {
      (env as any).auth = {};
    }

    (env.auth as any)[property] = JSON.stringify(value);
    if (that[property] !== value) {
      that[property] = value; // eslint-disable-line
    }
    console.log('set', property, value, EnvStorage.save);
    if (EnvStorage.save) {
      saveEnv();
    }
  }

  public get<T>(property: string, defaultVal?: T, that: any = this): T {
    if (that[property] === undefined) {
      const value = env.auth && (env.auth as any)[property];
      if (value !== undefined && value !== null) {
        that[property] = JSON.parse(value); // eslint-disable-line
      } else if (defaultVal !== undefined) {
        that[property] = defaultVal; // eslint-disable-line
      }
    }
    return that[property];
  }
}
