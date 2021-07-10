// <%= appname %> main entry point
import { Command } from 'commander';
import Logger from './lib/Logger';

class <%= appnamePascalCase %> {
  private rootCommand: Command;

  public constructor() {
    this.rootCommand = new Command('<%= appname %>');
    this.rootCommand
      .version('0.1.0')
      .option('--logLevel <logLevel>', 'log message level', 'info')
      .option('--console', 'enable logging to console', true)
      .option('--logFile', 'enable logging to log file', false)
      .hook('preAction', (cmd: Command, _actionCmd: Command) => {
        Logger.initialize(cmd.opts().logLevel, cmd.opts().console, cmd.opts().logFile);
      });
  }

  public async run(args: string[]): Promise<void> {
    await this.rootCommand.parseAsync(args);
  }
}

new <%= appnamePascalCase %>()
  .run(process.argv)
  .catch((e) => {
    console.error(e);
  })
  .then(() => {
    console.log('done.');
  });
