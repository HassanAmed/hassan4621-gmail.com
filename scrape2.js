const request = require('request');
const cheerio = require('cheerio');
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

request(`https://groceries.asda.com/aisle/fresh-food-bakery/fruit/apples/112449`, (error, response, html) => {
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        // console.log(html);
       const section =  $('.co-product-list__main-cntr')
        $('.co-product-list__main-cntr').each((i, el) => {
            const item = new Item()
            const title = $(el).find('.co-product__anchor a')
                .text()
                .replace(/\s\s+/g, ''); //removing empty whitespaces
            console.log(title);

            // item.title = title;
            // const price = $(el).find('.price-per-sellable-unit .value')
            //     .text()
            //     .replace(/\s\s+/g, '');
            // if (price) {
            //     item.price = `£${price}`;
            //     item.available = 'Yes'
            // }
            // const pricePerWeightValue = $(el).find('.price-per-quantity-weight .value')
            //     .text()
            //     .replace(/\s\s+/g, '');
            // const pricePerWeightUnit = $(el).find('.price-per-quantity-weight .weight')
            //     .text()
            //     .replace(/\s\s+/g, '');
            // if (pricePerWeightValue) item.pricePerWeight = `£${pricePerWeightValue}${pricePerWeightUnit}`;
            // const imageUrl = $(el).find('.product-image__container img')
            //     .attr('src')
            // if (imageUrl) item.imageUrl = imageUrl;
            // item.category = categories[itr].name

            // itemsArray[i] = item;
        });
        // allData = [...itemsArray, ...allData];
        // // console.log(allData);
        // console.log(allData);
    }
});


