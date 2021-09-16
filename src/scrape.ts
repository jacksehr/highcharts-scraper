import { writeToPath } from '@fast-csv/format';
import type { WebDriver } from 'selenium-webdriver';

export interface ScrapeStrategy {
  scrape(
    driver: WebDriver,
    onFinish: (files: CSVInput[]) => void
  ): Promise<void>;
}

export interface CSVInput {
  filename: string;
  data: string[][];
}

export class ScrapeManager {
  constructor(private readonly strategy: ScrapeStrategy) {}

  async executeStrategy(driver: WebDriver) {
    return this.strategy.scrape(driver, (files) =>
      files.forEach(this.writeOutput)
    );
  }

  async writeOutput({ filename, data }: CSVInput): Promise<void> {
    return new Promise((resolve, reject) => {
      const filepath = `${filename}.csv`
      writeToPath(filepath, data)
        .on('error', reject)
        .on('finish', () => {
          console.log(`Output written to ${filepath}`);
          resolve();
        });
    });
  }
}
