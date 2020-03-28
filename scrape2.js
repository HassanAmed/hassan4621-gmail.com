const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
let allData = [];
let itemsArray = [];
// constructor
function Item() {
    this.title = undefined;
    this.price = null;
    this.pricePerWeight = null;
    this.imageUrl = null;
    this.category = undefined;
    this.available = 'No';
}
// used to avoid redundant code as url follow same pattren except only category name + number of pages for each category
let categories = [
    { name: 'fresh-food', pages: 52 },
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
for (let itr = 0; itr < categories.length; itr++) {
    for (let i = 1; i <= categories[itr].pages; i++) {
        request(`https://www.tesco.com/groceries/en-GB/shop/${categories[itr].name}/all?page=${i}&count=48`, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(html);
                $('.product-list--list-item').each((i, el) => {
                    const item = new Item()
                    const title = $(el).find("a[data-auto='product-tile--title']")
                        .text()
                        .replace(/\s\s+/g, ''); //removing empty whitespaces
                    item.title = title;
                    const price = $(el).find('.price-per-sellable-unit .value')
                        .text()
                        .replace(/\s\s+/g, '');
                    if (price) {
                        item.price = `£${price}`;
                        item.available = 'Yes'
                    }
                    const pricePerWeightValue = $(el).find('.price-per-quantity-weight .value')
                        .text()
                        .replace(/\s\s+/g, '');
                    const pricePerWeightUnit = $(el).find('.price-per-quantity-weight .weight')
                        .text()
                        .replace(/\s\s+/g, '');
                    if (pricePerWeightValue) item.pricePerWeight = `£${pricePerWeightValue}${pricePerWeightUnit}`;
                    const imageUrl = $(el).find('.product-image__container img')
                        .attr('src')
                    if (imageUrl) item.imageUrl = imageUrl;
                    item.category = categories[itr].name

                    itemsArray[i] = item;
                });
                allData = [...itemsArray, ...allData];
                // console.log(allData);
                // console.log(allData.length);
            }
        });
    }
}
