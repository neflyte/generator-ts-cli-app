import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { xdgConfig } from 'xdg-basedir';

class Logger {
  private static getConfigHome(): string {
    let configHome: string = xdgConfig !== undefined ? xdgConfig : '';
    if (configHome === '') {
      configHome = process.env.HOME !== undefined ? process.env.HOME : '';
    }
    if (configHome === '') {
      configHome = '.';
    }
    return configHome;
  }

  private readonly _logFileName: string = '<%= appname %>.log';
  private readonly _logDirectoryMode: number = 0o755;
  private readonly _loggerOptions: winston.LoggerOptions;

  private _initialized: boolean;
  private _logFilePath: string;
  private _logger: winston.Logger | undefined;

  constructor() {
    this._initialized = false;
    winston.configure({
      level: 'info',
      format: winston.format.cli(),
    });
    this._loggerOptions = {
      format: winston.format.cli(),
    };
    this._logFilePath = '';
  }

  public initialize(logLevel: string, enableConsole: boolean, enableLogFile: boolean): void {
    if (this._initialized) {
      return;
    }
    if (logLevel === '') {
      logLevel = 'info';
    }
    if (!enableConsole && !enableLogFile) {
      enableConsole = true;
    }
    if (enableLogFile) {
      const configHome: string = Logger.getConfigHome();
      const logPath: string = path.join(configHome, '<%= appname %>');
      try {
        fs.mkdirSync(logPath, this._logDirectoryMode);
      } catch (e) {
        winston.error(`*  error creating log directory ${logPath}: ${(e as Error).message}`);
      }
      this._logFilePath = path.join(logPath, this._logFileName);
    }
    this._loggerOptions.level = logLevel;
    const logTransports: winston.transport[] = [];
    if (enableLogFile && this._logFilePath !== '') {
      logTransports.push(
        new winston.transports.File({
          filename: this._logFilePath,
          format: winston.format.simple(),
        }),
      );
    }
    if (enableConsole) {
      logTransports.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      );
    }
    this._loggerOptions.transports = logTransports;
    this._logger = winston.createLogger(this._loggerOptions);
    this._initialized = true;
  }

  public getFuncLogger(funcName: string): winston.Logger {
    if (this._logger === undefined) {
      return winston.child({
        function: funcName,
      });
    }
    return this._logger.child({
      function: funcName,
    });
  }
}

export default new Logger();
