let fs = require("fs");
let puppeteer = require('puppeteer');
let cfile = process.argv[2];
let playlistname = process.argv[3];

(async function () {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    slowMo: 40,
    args: ['--start-maximized', '--disable-notifications']
  });

  let contents = await fs.promises.readFile(cfile);
  let obj = JSON.parse(contents);
  let user = obj.user;
  let pwd = obj.pwd;

  let pages = await browser.pages();
  let page = pages[0];
  page.goto('https://open.spotify.com', { waitUntil: 'networkidle2' });

  await page.waitForSelector('._2221af4e93029bedeab751d04fab4b8b-scss._1edf52628d509e6baded2387f6267588-scss', { visible: true });
  await page.click('._2221af4e93029bedeab751d04fab4b8b-scss._1edf52628d509e6baded2387f6267588-scss');
  await page.waitForSelector('#login-username', { visible: true });
  await page.type('#login-username', user);
  await page.type('#login-password', pwd);
  await page.click("#login-button");

  await page.waitForSelector('.link-subtle.navBar-link.ellipsis-one-line', { visible: true });

  let search = "/search";
  page.goto('https://open.spotify.com' + search, { waitUntil: 'networkidle2' });


  await page.waitForSelector('._2f8ed265fb69fb70c0c9afef329ae0b6-scss', { visible: true });
  await page.type('._2f8ed265fb69fb70c0c9afef329ae0b6-scss', playlistname);
  await page.waitForSelector('._6fa24354481d72595112420e92058ad2-scss', { visible: true },{waitUntil: "networkidle2"});
  await page.waitFor(1000);
  await screenshot(page);
  console.log("Screenshot has been taken");
  await page.click("._6fa24354481d72595112420e92058ad2-scss");
  await page.waitForSelector('.tracklist-col.name');
  let idx = 0;
  do {
    let elements = await page.$$('.tracklist-col.name');
    await tracklistclick(elements[idx], page);
    idx++;
  } while (idx < 50);
  await browser.close();
  console.log("Songs have been added to created playlist");
})();

async function tracklistclick(el,page) {
  await page.waitForSelector('.tracklist-name.ellipsis-one-line'); 
  let toClick = await el.$('.tracklist-name.ellipsis-one-line');
  await toClick.click({
      button: 'right',
    });
  await page.waitForSelector('.react-contextmenu.react-contextmenu--visible');
  let menu = await page.$$('.react-contextmenu.react-contextmenu--visible .react-contextmenu-item');
  let playlistbtn = menu[menu.length - 3];
  classOnNextPageBtn = await page.evaluate(function (el) {
    return el.click();
  }, playlistbtn)


  await page.waitForSelector('.cover-art.shadow.cover-art--with-auto-height');
  await page.click(".cover-art.shadow.cover-art--with-auto-height");

}
async function screenshot(page) {
  await page.screenshot({ path: 'screenshot-playlist.png' });
}