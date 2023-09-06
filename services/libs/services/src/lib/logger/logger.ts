import winston from "winston";

export default class EMCLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      transports: [new winston.transports.Console()],
    });
  }

  debug(message: string, ...args: Array<any>) {
    this.logger.log("debug", message, ...args);
  }

  error(message: string, ...args: Array<any>) {
    this.logger.log("error", message, ...args);
  }

  info(message: string, ...args: Array<any>) {
    this.logger.log("info", message, ...args);
  }

  log(message: string, ...args: Array<any>) {
    this.info(message, ...args);
  }

  warn(message: string, ...args: Array<any>) {
    this.logger.log("warn", message, ...args);
  }
}
