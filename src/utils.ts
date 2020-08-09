import { get } from 'lodash';

export const getVar = (source: any, sourceName = 'object', isRequired = true) => <Result = string>(
  name: string,
  defaultValue: Result|undefined = undefined,
): Result => {
  const value = get(source, name, defaultValue);
  if (value == undefined && isRequired) {
    throw new Error(`Could not get variable "${name}" from "${sourceName}" and no default value is provided.`);
  }
  return value;
};

export const getEnv = getVar(process.env, 'process.env');

export const isTruthy = (value: string): boolean => {
  return ['1', 'true', 'yes'].includes(value.toLowerCase());
};

export const isNotNil = <T>(value: T | undefined | null): value is T => value != null;
