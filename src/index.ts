import { bootstrapChromeDriver } from './chromedriver';
import { ScrapeManager, ScrapeStrategy } from './scrape';
import { WeeklyRentsStrategy as RentsStrategy } from './strategies/rents';
import { VacanciesStrategy } from './strategies/vacancies';
import './env';

enum SCRAPE_TYPE {
  VACANCIES = 'vacancies',
  RENTS = 'rents',
}

const parseArgs = (
  argv: typeof process.argv
): { scrapeType: SCRAPE_TYPE; postcode: number } => {
  const scrapeTypes = Object.values(SCRAPE_TYPE);
  const usageMessage = `Usage: yarn start [${scrapeTypes.join(
    ' | '
  )}] [postcode]`;

  const scrapeType = argv[2] as SCRAPE_TYPE;
  const postcode = argv[3];

  if (!scrapeTypes.includes(scrapeType) || !/^\d{4}$/.test(postcode)) {
    console.error(usageMessage);
    process.exit(1);
  }

  return { postcode: +postcode, scrapeType };
};

if (require?.main === module) {
  (async () => {
    const { scrapeType, postcode } = parseArgs(process.argv);

    let strategy: ScrapeStrategy;

    switch (scrapeType) {
      case SCRAPE_TYPE.RENTS:
        strategy = new RentsStrategy(+postcode);
        break;
      default:
        strategy = new VacanciesStrategy(+postcode);
    }

    const scrapeManager = new ScrapeManager(strategy);

    const driver = await bootstrapChromeDriver(true);
    try {
      await scrapeManager.executeStrategy(driver);
    } finally {
      await driver.quit();
    }
  })();
}
