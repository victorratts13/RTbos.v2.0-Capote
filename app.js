/*
    RTbos V2.0 (Capote)
    by Victor ratts
    escrito em JavaScript
    bot para poloniex
    junho de 2019

*/
const renko = require('technicalindicators').renko;
const express = require('express');
const app = express();
const request = require('request');
const port = 8081;
const par = 'BTC_ATOM'
const uTime = parseInt(new Date().getTime() / 1000);
app.use(express.static(__dirname + '/www/'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/history', (req, res) => {
        const {symbol, from, to, resolution} = req.query;
            link = `https://poloniex.com/public?command=returnChartData&currencyPair=${symbol}&start=${from}&end=${to}&period=300`,
            request({
                url: link,
                json: true
            }, (err, response, body) => {
                //var body = body.substring(1, (body.length - 1));
                if(err){
                    console.log(err);
                }else{
                    
                    var x, o='', c="", v="", h="", l="", t='', chartData, teste = "";
                    //t = parseInt(t);
                    for(x = 0; x < body.length; x++){
                        
                        o += parseInt(body[x].open)+', ';
                        c += parseInt(body[x].close)+', ';
                        v += parseInt(body[x].volume)+', ';
                        h += parseInt(body[x].high)+', ';
                        l += parseInt(body[x].low)+', ';
                        t += parseInt(body[x].date)+', ';

                    }

                    var dashData = {
                            o: [o],
                            c: [c],
                            v: [v],
                            h: [h],
                            l: [l],
                            t: [t],
                            s: 'ok'
                        }
                   // var result = renko(Object.assign({}, data, {brickSize : config.renko, useATR : false }));

                       // console.log(t)      
                    }
        res.send(dashData);
    });  
});

app.listen(port, () => {
    console.log('listen on port ' + port);
});