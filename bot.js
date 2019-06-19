

const api = require('./config/config');
const Poloniex = require('poloniex-api-node');
const request = require('request');
const fs = require('fs');
const clearModule = require('clear-module');

const apiKey = api.apiKey;
const secret = api.apiSecret;

const poloniex = new Poloniex(apiKey, secret, { nonce: () => new Date().getTime() * 2005 }, {socketTimeout: 60000});

const SMA = require('technicalindicators').SMA;

//#################################################################################################################
//################################################## definições basicas ###########################################
//#################################################################################################################

const par = 'USDT_BTC'; //ultilise o formato PAIR_PAIR ex. BTC_LTC, BTC_DOGE, USDT_BTC
const uTime = parseInt(new Date().getTime() / 1000);//TimeUnix format
const sub = 14550;//subtração do startTime
const period = 300; //valor do periodo dos candels em segundos (minimo 300 segundos ou 5 minutos)
const start = uTime - sub;//inicio do candle
const end = uTime;//fim do candle

const invest = api.invest; //valor a ser investido, caso esteja vazio o valor será seu saldo total - minimo 0.0001
const lucro = api.lucro; //porcentagem de lucro, caso esteja vazio o lucro esperado será maximo

//##################################################################################################################
//################################################### inicio do Robô ###############################################
//##################################################################################################################

setInterval(() => {
    clearModule('./var/tempFile')
    const tempFile = require('./var/tempFile')
    if(api.invest == false){
        var link = api.local;
        request({
            url: link+`/history?symbol=${par}&resolution=1&from=${start}&to=${end}`,
            json: true
        }, (err, response, body) => {
            var renkoBrick = body;
            if(err){
                console.log(err)
            }else{
                poloniex.returnCurrencies((err, currencies) => {
                    if(err){
                        console.log('Currencie -> '+err)
                    }else{
                        poloniex.returnBalances((err, balance) => {
                            if(err){
                                console.log('Balances -> '+err)
                            }else{
                                ma1 = SMA.calculate({period: api.ma1, values: renkoBrick.c})
                                ma2 = SMA.calculate({period: api.ma2, values: renkoBrick.c})

                                var Ma01_val = ma1.slice(-1)[0];
                                var Ma02_val = ma2.slice(-1)[0];
//====================================== cruzamento de medias em renko ============================================
                                function cross(){//cross function 
                                    if(Ma01_val > Ma02_val){
                                        return 1;
                                    }
                                    if(Ma01_val < Ma02_val){
                                        return 2;
                                    }
                                    return 0;
                                }
//======================================= base de referencia ========================================================
                                var price = Ma01_val;
                                var buyVal = balance.USDT / price;
                                var sellVal = price * balance.BTC;

//======================================= funções de compra / venda =================================================
                                function buy(){
                                    poloniex.buy(par, price, buyVal, 1, 0, 0, (err, response) => {
                                        if(err){
                                            console.log(err)
                                        }else{
                                            console.log(JSON.stringify(response))        
                                        }
                                    })
                                }
                                function sell(){
                                    poloniex.sell(par, price, sellVal, (err, response) => {
                                        if(err){
                                            console.log(err)
                                        }else{
                                            console.log(response)
                                        }
                                    })
                                }
//======================================= execução das ordens ========================================================
                                if(cross() == 1){
                                    if(tempFile.type == 'sell'){
                                        console.log('\033c executando compra');
                                        buy();
                                        var createTemp = "var lastOrder = {type: 'buy'}; module.exports = lastOrder;"
                                        fs.writeFile('./var/tempFile.js', createTemp, (err) => {
                                            if(err){
                                                console.log(err)
                                            }else{
                                                console.log('\033c  criado arquivo temporario -> Buy')
                                            }
                                        })
                                    }else{
                                        console.log('\033c  compra executada, aguardando venda')
                                    }

                                }
                                if(cross() == 2){
                                    if(tempFile == 'buy'){
                                        var createTemp = "var lastOrder = {type: 'sell'}; module.exports = lastOrder;"
                                        console.log('\033c  executando venda');
                                        sell()
                                        fs.writeFile('./var/tempFile.js', createTemp, (err) => {
                                            if(err){
                                                console.log(err)
                                            }else{
                                                console.log('\033c  criado arquivo temporario -> Sell')
                                            }
                                        })
                                    }else{
                                        console.log('\033c  venda executada, aguardando compra')                                        
                                    }
                                }                                                                                               
                            }
                        })
                    }
                })
            }
        })
    }
//##################################################################################################################
//################################################### Fim do Codigo ################################################
//##################################################################################################################

}, 5000);
