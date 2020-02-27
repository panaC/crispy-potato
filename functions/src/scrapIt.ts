
import * as puppeteer from "puppeteer";

export interface IMatchData {
    player1: string;
    player2: string;
    score1: string;
    score2: string;
}

export interface IError {
    error: string;
}

export const scrapIt = async (id: string): Promise<Partial<IMatchData> | IError> => {
    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage();
    const url = `https://www.flashscore.com/match/${id}`;

    await page.goto(url);

    const ret: Partial<IMatchData> = {};

    console.log("browser launched -> starting loaded", url);

    const promiseTimeout = new Promise<void>((_resolve, reject) => setTimeout(() => reject("Timeout"), 30000));
    const promiseError = new Promise<void>((_resolve, reject) => page.on('error', (err) => reject(err)));
    const promisePageError = new Promise<void>((_resolve, reject) => page.on('pageerror', (err) => reject(err)));
    const promiseClose = new Promise<void>((_resolve, reject) => page.on('close', (err) => reject(err)));


    try {
        await Promise.race([page.waitForSelector("#summary-content > div.parts-wrapper"), promiseTimeout, promiseError, promisePageError, promiseClose]);

    } catch (err) {

        await browser.close();
        return {error: err.toString()} as IError;
    }

    const getTextFromXpath = async (xpath: string) => {

        try {
            const el = await page.$x(xpath);
            
            if (el.length) {
                return await el[0].evaluate((node) => (node as HTMLElement).innerText);
            }
            
        } catch(err) {
            // ignore
        }
        return undefined;
    }

    try {

        console.log(url, " loaded -> start of scraping");

        ret.player1 = await getTextFromXpath("/html/body/div[2]/div[1]/div[4]/div[2]/div[1]/div[1]/div[2]/div/div/a");
        ret.player2 = await getTextFromXpath("/html/body/div[2]/div[1]/div[4]/div[2]/div[1]/div[3]/div[2]/div/div/a");
        ret.score1 = await getTextFromXpath("/html/body/div[2]/div[1]/div[4]/div[2]/div[1]/div[2]/div[1]/span[1]");
        ret.score2 = await getTextFromXpath("/html/body/div[2]/div[1]/div[4]/div[2]/div[1]/div[2]/div[1]/span[2]/span[2]");
    } catch(err) {

        return { error: err.toString() } as IError;
    } finally {

        await browser.close();
    }

    return ret;
}