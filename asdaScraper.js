const puppeteer = require('puppeteer');
const urls = require('./url');
var mysql = require('mysql');

links = [urls.easter, urls.freshFood, urls.chilledFood,
urls.foodCupboard, urls.frozenFood,
urls.veganFreeFrom, urls.healthAndBeauty,
urls.laundry, urls.pets, urls.babies
]
category = [
    'Easter',
    'Fresh Food & Bakery',
    'Chilled Food',
    'Food Cupboard',
    'Frozen Food',
    'Vegan & Free From',
    'Health & Beauty',
    'Laundry & Household',
    'Pets',
    'Babies'
]

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: 'stores',
});
// Connect/Create DB
db.connect((err) => {
    if (err) throw err;
    console.log("MYSQL Connected");
    db.query("CREATE DATABASE IF NOT EXISTS stores", (err, result) => {
        if (err) throw err;
        console.log("Database Created")
    });

    var sql = "CREATE TABLE IF NOT EXISTS products (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), price VARCHAR(255), store VARCHAR(255), pricePerWeight VARCHAR(255), imageUrl VARCHAR(255), category VARCHAR(255), availability BOOLEAN)";
    //Create Products Table
    db.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Products Table created");
    });
});

// Entry function to add data to db
function dataEntry(values) {
    var sql = "INSERT INTO products (title, price, store, pricePerWeight, imageUrl, category, availability) VALUES ?";
    db.query(sql, [values], function (err, result) {
        if (err)
            throw err;

        console.count("Number of records inserted: " + result.affectedRows);
    });
}

//Constructor fn
function Item() {
    this.title = '';
    this.price = null;
    this.store = 'ASDA';
    this.pricePerWeight = null;
    this.imageUrl = null;
    this.category = null;
    this.available = true;
}
(async function main() {
    try {
        const browser = await puppeteer.launch({ headless: true });
        for (let i = 0; i < links.length; i++) {
            for (let j = 0; j < links[i].length; j++) {
                const page = await browser.newPage();
                page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36');
                await page.goto(links[i][j]);
                console.log(links[i][j])
                await page.setViewport({
                    width: 1200,
                    height: 800
                });
                await autoScroll(page);
                const list = await page.$$('.co-item');
                console.log(list.length);
                let itemsArray = [];
                let itr = 0;
                for (const li of list) {
                    const item = new Item()
                    const name = await li.$eval('h3', h3 => h3.innerText)

                    const volume = await li.$eval('.co-product__volume', el => el.innerText)
                    item.title = name + ' ' + volume


                    const price = await li.$eval('.co-product__price', el => el.innerText)
                    item.price = price
                    try {
                        const pricePerWeight = await li.$eval('.co-product__price-per-uom', el => el.innerText)
                        item.pricePerWeight = pricePerWeight
                    } catch (error) {
                        item.pricePerWeight = null;
                    }
                    await page.waitForSelector('.co-product__image')
                    const imageUrl = await li.$eval('img', el => el.src)
                    item.imageUrl = imageUrl

                    item.category = category[i];
                    
                    // formatting in array form to push in db
                    let itemData = [];
                    for (let key in item) {
                        itemData.push(item[key]);
                    }

                    itemsArray[itr] = itemData;
                    itr++;
                }
                dataEntry(itemsArray);
            }
        }
        await browser.close();
        db.end(() => console.log('Done'));
    }

    catch (error) {
        console.log('ERROR' + error)
    }
})();
//this function srolls the page and loads data (which is loaded after scrolling)
// 800ms time is set which can be changed based on your network speed and hardware performance.
// can reduce this to 100 if you have excellent speed and hardware.
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 800);
        });
    });
}