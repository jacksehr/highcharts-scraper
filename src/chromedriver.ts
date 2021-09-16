import { Builder } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

export const bootstrapChromeDriver = async (headless: boolean) => {
  let chromeOptions = new Options().excludeSwitches('enable-logging');

  if (headless) {
    chromeOptions = chromeOptions
      .headless()
      .windowSize({ width: 1280, height: 720 });
  }

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();
};
