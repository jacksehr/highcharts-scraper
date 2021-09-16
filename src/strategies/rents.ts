import { DateTime } from 'luxon';
import type { WebDriver } from 'selenium-webdriver';

import type { CSVInput, ScrapeStrategy } from '../scrape';
import { getHighchartsScript } from './common';

interface ChartData {
  name: string;
  xData: number[];
  yData: number[];
}

export class WeeklyRentsStrategy implements ScrapeStrategy {
  constructor(private readonly postcode: number) {}

  private convertTimestampToMonthYearWeek(timestamp: number): string[] {
    const { monthLong, year, weekNumber } =
      DateTime.fromMillis(timestamp).setZone('Australia/Sydney');
    return [`${year}`, monthLong, `${weekNumber}`];
  }

  async scrape(
    driver: WebDriver,
    onFinish: (data: CSVInput[]) => void
  ): Promise<void> {
    const output: CSVInput[] = [];

    const { BASE_URL, RENTS_ENDPOINT } = process.env;

    await driver.get(`${BASE_URL}${RENTS_ENDPOINT}?postcode=${this.postcode}`);

    const chartId = process.env.RENTS_CHART_ID;
    if (!chartId) {
      console.error('Chart ID not set for rents');
      process.exit(1);
    }

    const script = getHighchartsScript(chartId);

    const chartDataSets: ChartData[] = await driver.executeScript(script);

    chartDataSets.forEach(({ name, xData, yData }) => {
      const dataset: CSVInput = {
        filename: `${name}_${this.postcode}`,
        data: [],
      };

      xData.forEach((monthTimestamp, index) => {
        dataset.data.push([
          ...this.convertTimestampToMonthYearWeek(monthTimestamp),
          `${yData[index]}`,
        ]);
      });

      output.push(dataset);
    });

    onFinish(output);
  }
}
