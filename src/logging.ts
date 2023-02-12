const LOG_LEVELS = ['info', 'debug'] as const;
type LogLevel = typeof LOG_LEVELS[number];

export type Logger = (level: LogLevel, ...args: any[]) => void;

export const getLogger = (verbose: boolean) => {
  const log = (...args: any[]) => console.log('[result-cache]', ...args);
  return {
    info: (...args: any[]) => {
      log(...args);
    },
    debug: (...args: any[]) => {
      if (verbose) log(...args);
    },
  } as const;
};
