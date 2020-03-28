const request = require('request');
const cheerio = require('cheerio');
var mysql = require('mysql');


//DB Connection
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: 'stores',
});

//Connect
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

// constructor function for scrapped items
function Item() {
    this.title = undefined;
    this.price = null;
    this.store = 'Tesco';
    this.pricePerWeight = null;
    this.imageUrl = null;
    this.category = undefined;
    this.available = false;
}
// Used to avoid redundant code as url follow same pattren except only category name + number of pages for each category
let categories = [
    { name: 'fresh-food', pages: 54 },
    { name: 'bakery', pages: 11 },
    { name: 'frozen-food', pages: 14 },
    { name: 'food-cupboard', pages: 105 },
    { name: 'drinks', pages: 50 },
    { name: 'baby', pages: 15 },
    { name: 'health-and-beauty', pages: 66 },
    { name: 'pets', pages: 12 },
    { name: 'household', pages: 15 },
    { name: 'home-and-ents', pages: 72 },
    { name: 'easter', pages: 13 }
]

async function scrape() {
    for (let itr = 0; itr < categories.length; itr++) {
        for (let i = 1; i <= categories[itr].pages; i++) {
            request(`https://www.tesco.com/groceries/en-GB/shop/${categories[itr].name}/all?page=${i}&count=48`, (error, response, html) => {
                if (!error && response.statusCode == 200) {
                    const $ = cheerio.load(html);
                    let itemsArray = [];
                    $('.product-list--list-item').each(async (i, el) => {
                        const item = new Item();
                        const title = $(el).find("a[data-auto='product-tile--title']")
                            .text()
                            .replace(/\s\s+/g, ''); //removing empty whitespaces
                        item.title = title;
                        const price = $(el).find('.price-per-sellable-unit .value')
                            .text()
                            .replace(/\s\s+/g, '');
                        if (price) {
                            item.price = `£${price}`;
                            item.available = true;
                        }
                        const pricePerWeightValue = $(el).find('.price-per-quantity-weight .value')
                            .text()
                            .replace(/\s\s+/g, '');
                        const pricePerWeightUnit = $(el).find('.price-per-quantity-weight .weight')
                            .text()
                            .replace(/\s\s+/g, '');
                        if (pricePerWeightValue)
                            item.pricePerWeight = `£${pricePerWeightValue}${pricePerWeightUnit}`;
                        const imageUrl = $(el).find('.product-image__container img')
                            .attr('src');
                        if (imageUrl)
                            item.imageUrl = imageUrl;
                        item.category = categories[itr].name;
                        let itemData = [];
                        for (let key in item) {
                            itemData.push(item[key]);
                        }
                        itemsArray[i] = itemData;
                    });
                    dataEntry(itemsArray);
                }
            });
        }
    }

};
async function init() {
    await scrape(() => {
    console.log('Data Scrapped')    
    db.end();
    })
}
init();

