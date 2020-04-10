var tress = require("tress");
var needle = require("needle");
var cheerio = require("cheerio");
var url = require("url");
var fs = require("fs");

var URL =
  "https://auto.ria.com/search/?year[0].gte=2004&year[0].lte=2008&categories.main.id=2&price.currency=1&abroad.not=0&custom.not=1&size=50";
var results = [];

var page = 1;

var q = tress(function (curl, callback) {
  needle.get(curl, function (err, res) {
    if (err) {
      fs.writeFileSync("./data.json", JSON.stringify(results, null, 2));
      throw err;
    }

    var $ = cheerio.load(res.body);

    if (
      $("#userInfoBlock").find("[data-phone-number]").attr("data-phone-number")
    ) {
      results.push({
        phone: $("#userInfoBlock")
          .find("[data-phone-number]")
          .attr("data-phone-number"),
      });
    }
    console.log(curl);
    $(".head-ticket .item>a").each(function () {
      q.push($(this).attr("href"));
    });
    callback();
  });
}, 20);

q.drain = function () {
  if (page <= 37) {
    page++;
    q.push(`${URL}&page=${page}`);
  }
  fs.writeFileSync("./data.json", JSON.stringify(results, null, 2));
};

q.push(`${URL}&page=${page}`);
