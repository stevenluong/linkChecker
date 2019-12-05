var http = require('http');
var request = require('request');
var rp = require('request-promise');
var scraperjs = require('scraperjs');
var express = require("express");
var bodyParser = require('body-parser');
var sendmail = require('sendmail')({
    //devHost:'localhost',
    //devPort: 1025,
    silent: true,
    smtpHost: 'localhost'
});
var cors = require('cors')
const port = 8089;
var app = express();
app.use( bodyParser.json() );
app.use(cors());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: false
}));

var report = {
    ko:[],
    ok:[]
};
var links = [] ;
app.get('/',(req,res)=>{
    res.send("Service is ON");
})

app.post('/',(req,res)=>{
    var website = req.body.website;
    var email = req.body.email;
    //TODO - Validation on HTTP
    console.log("Main link : "+website);
    console.log("Received by : "+email);
    res.send("OK");
    process(website,email);
})
var process = function(website, email){
    if(website.indexOf("http")==-1)
        website = "http://"+website;
    var tmp = scraperjs.StaticScraper.create(website);
    tmp.scrape(function($) {
        return $("a").map(function(){
            var t = $(this);
            var link = t.attr("href");

            //console.log(link);
            //TODO better scenario check
            if(!link || link.length==0){
                //console.log("No link issue - " + t.text());
                return;
            }else if(link=="#" || link=="javascript:void(0)" || link=="javascript:void(0)" || link=="/"){
                //console.log("Not to be tested link : "+link);
                return;
            }else if(link[0]=="/"){
                link = website + link;
                //console.log("Modified link : "+link);
            }
            if(links.indexOf(link)==-1){
                links.push(link);
                //console.log(link.indexOf(website));
                //TODO RECURSIF
                //if(link.indexOf(website)!=-1)
                //  process(link,email);
                return link;
            }

            //return false;

            //console.log(link);
            //console.log(link.indexOf(website));
            //process(link,email);
        }).get();
        //console.log(report);
        //console.log(report);
    })
    .catch(function(e){
        console.log(e);
        if(e.code=="ENOTFOUND")
            console.log("URL NOT FOUND");
    })
    .then(async function(results) {
        //console.log(results)
        let promises =  [];
        for(i = 0; i<results.length; i++){
            const res = results[i];
            //console.log(res);
            var promise = rp({
                uri:res,
                resolveWithFullResponse: true
            }).then(function(response){
                //var m = link+" - "+ t.text()+" - "+r.statusCode;
                var m = res+" - "+response.statusCode;
                //console.log(m);
                var check = {
                    link : res,
                    status : response.statusCode
                };
                if(response.statusCode == 200){
                    report.ok.push(check);
                }else{
                    report.ko.push(check);
                }
                //report.push(m);
                //return m;
            }).catch(function(err){
                var m = res+" - ERROR";
                report.push(m);
                console.log("ERROR : "+err);
            });
            promises.push(promise);
        }
        const results2 = await Promise.all(promises);
        //console.log(results2[0]);
        console.log("------ REPORT -----");
        console.log(report);
        var formattedReport = formatReport(report);

        sendEmail(website,formattedReport,email);
        //sendEmail(website,formattedReport,"mail@biz-rockets.com");
        //TODO push to loopback


    })
}

var formatReport = function(report){
    var formattedReport = "<p>Biz Rockets is happy to provide this report</p>";
    formattedReport = formattedReport+"<h2>Broken links<h2/>";
    if(report.ko.length==0){
        formattedReport = formattedReport+"<p>N/A<p/>";
    }else{
        report.ko.forEach(r=>{
            formattedReport = formattedReport+"<p>"+r+"<p/>";
        })
    }
    formattedReport = formattedReport+"<h2>Working links<h2/>";
    report.ok.forEach(r=>{
        var m = r.link +" - OK";
        formattedReport = formattedReport+"<p>"+m+"<p/>";
    })
    return formattedReport;
}

var sendEmail = function(website,body,email){
    //console.log("email");
    var options = {
        from: 'mail@biz-rockets.com',
        to: email,
        subject: '[Biz-rockets.com] Website Analysis report - '+website,
        html: body,
    };
    //console.log(options);
    sendmail(options, function(err, reply) {
        if(err)
            console.log(err);
        //console.log(reply);
        console.log("Email sent to : "+options.to);
        //console.log(err && err.stack);
        //console.dir(reply);
    });
}

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
