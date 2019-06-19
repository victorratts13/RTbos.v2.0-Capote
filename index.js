const request = require('request');
const renko = require('technicalindicators').renko;
const express = require('express');
const app = express();
const port = 8082;

const par = 'USDT_BTC'
const uTime = parseInt(new Date().getTime() / 1000);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var objConf = 
    //tabela de configuração  
    {
        supports_search: true,
        supports_group_request: false,
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        exchanges: {
            value: 'POLONIEX',
            name: 'POLONIEX',
            desc: 'POLONIEX',
        },
        supported_resolutions: [
           '5', '15', '30', '120', '240', 'D'
        ]
    },
    //symbols
    objSymbols = 
    {
        name: par,
        description: par,
        type: "crypto",
        session: "24x7",
        timezone: "America/New_York",
        ticker: par,
        minmov: 1,
        pricescale: 100000000,
        has_intraday: true,
        intraday_multipliers: ["1", "60"],
        supported_resolutions: ['5', '15', '30', '120', '240', 'D'],
        volume_precision: 8,
        data_status: "streaming",
    };

    app.get('/config', (req, res) => {
        res.json(objConf);
    });
    
    app.get('/symbols', (req, res) => {
        res.json(objSymbols);
    });
    
    app.get('/time', (req, res) => {
        res.json(uTime);
    });

    app.get('/history', (req, res) => {
        const {symbol, from, to, resolution} = req.query;
        link = `http://localhost:8081/history?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`;
        request({
            url: link,
            json: true
        }, (err, response, body) => {
            time = JSON.stringify(body.t[0])
            time = time.substring(1, (time.length - 3))
            time = time.split(',').map(Number)

            open = JSON.stringify(body.o[0])
            open = open.substring(1, (open.length - 3))
            open = open.split(',').map(Number)

            close = JSON.stringify(body.c[0])
            close = close.substring(1, (close.length - 3))
            close = close.split(',').map(Number)

            high = JSON.stringify(body.h[0])
            high = high.substring(1, (high.length - 3))
            high = high.split(',').map(Number)

            low = JSON.stringify(body.l[0])
            low = low.substring(1, (low.length - 3))
            low = low.split(',').map(Number)

            volume = JSON.stringify(body.v[0])
            volume = volume.substring(1, (volume.length - 3))
            volume = volume.split(',').map(Number)

            var candleData = {
                "o": open,
                "c": close,
                "v": volume,
                "h": high,
                "l": low,
                "t": time,
                "s": "ok"
                }
            var renkoData = {
                "close": candleData.c,
                "open": candleData.c,
                "volume": candleData.c,
                "high": candleData.c,
                "low": candleData.c,
                "timestamp": candleData.t
            }

            var result = renko(Object.assign({}, renkoData, {brickSize : 5, useATR : false }));
            var renkoResult = {
                "c": result.close,
                "o": result.open,
                "v": result.volume,
                "h": result.high,
                "l": result.low,
                "t": result.timestamp,
                "s": 'ok'
            }
            res.send(renkoResult)
        })
    })

app.listen(port, () => {
    console.log('Port -> '+port)
})