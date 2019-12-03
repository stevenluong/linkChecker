var http = require('http');
var request = require('request');
var scraperjs = require('scraperjs');
var express = require("express");
var bodyParser = require('body-parser');
var cors = require('cors')
const port = 8089;
var app = express();
app.use( bodyParser.json() );
app.use(cors());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: false
})); 

var report = "";
var links = [] ;
app.get('/',(req,res)=>{
    res.send("Service is ON");
})

app.post('/',(req,res)=>{
    var website = req.body.website;
    var email = req.body.email;
    //TODO - Validation on HTTP
    //console.log(website);
    //console.log(email);
    res.send("OK");
    process(website,email);
})
var process = function(website, email){
    var tmp = scraperjs.StaticScraper.create(website);
    tmp.scrape(function($) {
        $("a").map(function(){
            var t = $(this);
            var link = t.attr("href");
            //console.log(link);
            if(!link || link.length==0)
                console.log("No link issue - " + t.text());
            else if(link[0]!="#" && links.indexOf(link)==-1 && link.indexOf("mailto:")==-1){
                links.push(link);
                //console.log(link.indexOf(website));
                if(link.indexOf(website)>=1){
                    console.log("test");
                    //process(link,email);
                    request(link, function(e, r, b){
                        //console.log(e);
                        var m = link+" - "+ t.text()+" - "+r.statusCode;
                        report = report + m;
                        console.log(m);
                        //return console.log(m)
                    });
                }
            }
        })
        //.get();
        //console.log(report);
        //console.log(report);
    })
    .catch(function(e){
        console.log(e);
        if(e.code=="ENOTFOUND")
            console.log("URL NOT FOUND");
    })
    .then(function() {
        //console.log(offers.length);
        //push to loopback


    })
}


app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
