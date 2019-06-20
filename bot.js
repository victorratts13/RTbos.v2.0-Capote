

const api = require('./config/config');
const Poloniex = require('poloniex-api-node');
const request = require('request');
const fs = require('fs');
const clearModule = require('clear-module');

const apiKey = api.apiKey;
const secret = api.apiSecret;

const poloniex = new Poloniex(apiKey, secret, { nonce: () => new Date().getTime() * 2055 }, {socketTimeout: 60000});

const SMA = require('technicalindicators').SMA;

//#################################################################################################################
//################################################## definições basicas ###########################################
//#################################################################################################################

const par = 'USDT_BTC'; //ultilise o formato PAIR_PAIR ex. BTC_LTC, BTC_DOGE, USDT_BTC
const uTime = parseInt(new Date().getTime() / 1000);//TimeUnix format
const sub = 225550;//subtração do startTime
const period = 300; //valor do periodo dos candels em segundos (minimo 300 segundos ou 5 minutos)
const start = uTime - sub;//inicio do candle
const end = uTime;//fim do candle
var cont = 0;

const invest = api.invest; //valor a ser investido, caso esteja vazio o valor será seu saldo total - minimo 0.0001
const lucro = api.lucro; //porcentagem de lucro, caso esteja vazio o lucro esperado será maximo

//##################################################################################################################
//################################################### inicio do Robô ###############################################
//##################################################################################################################

setInterval(() => {
    console.log('\033c Bem vindo ao RTbos v2.0 (capote) '+ cont++)
    clearModule('./var/tempFile')
    const tempFile = require('./var/tempFile')
    if(api.invest == false){
        var link = api.local;
        request({
            url: link+`/history?symbol=${par}&resolution=300&from=${start}&to=${end}`,
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
                                //console.log(ma1)
                                //console.log(renkoBrick.c)
                                var Ma01_val = ma1.slice(-1)[0];
                                var Ma02_val = ma2.slice(-1)[0];
                                console.log('BTC saldo -> '+balance.BTC )
                                console.log('USDT saldo -> '+balance.USDT )
                                console.log('Media Movel: '+api.ma1+' -> '+Ma01_val);
                                console.log('Media Movel: '+api.ma2+' -> '+Ma02_val);
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
                                var buyVal = (price * balance.USDT / price);
                                var sellVal = (price * balance.BTC / price);
                                var USDT_buy = parseInt(buyVal);
                                console.log('Preço -> '+price);
                                console.log('valor de compra -> '+buyVal);
                                console.log('valor de venda -> '+sellVal);
                                console.log('USDT valor int ->'+USDT_buy)
//======================================= funções de compra / venda =================================================
                                function buy(){
                                    poloniex.buy(par, price, buyVal, 1, 0, 0, (err, response) => {
                                        if(err){
                                            console.log('algum erro ocorreu -> '+err)
                                        }else{
                                            console.log(JSON.stringify(response))        
                                        }
                                    })
                                }

                                function sell(){
                                    poloniex.sell(par, price, sellVal, 1, 0, 0, (err, response) => {
                                        if(err){
                                            console.log('algum erro ocorreu -> '+err)
                                        }else{
                                            console.log(response)
                                        }
                                    })
                                }
//======================================= execução das ordens ========================================================
                                if(cross() == 1){
                                    if(tempFile.type == 'sell'){
                                        console.log('executando compra');
                                        buy();
                                        var createTemp = "var lastOrder = {type: 'buy'}; module.exports = lastOrder;"
                                        fs.writeFile('./var/tempFile.js', createTemp, (err) => {
                                            if(err){
                                                console.log(err)
                                            }else{
                                                console.log('criado arquivo temporario -> Buy')
                                            }
                                        })
                                    }else{
                                        console.log('compra executada, aguardando venda')
                                    }

                                }
                                if(cross() == 2){
                                    if(tempFile == 'buy'){
                                        var createTemp = "var lastOrder = {type: 'sell'}; module.exports = lastOrder;"
                                        console.log('executando venda');
                                        sell()
                                        fs.writeFile('./var/tempFile.js', createTemp, (err) => {
                                            if(err){
                                                console.log(err)
                                            }else{
                                                console.log('criado arquivo temporario -> Sell')
                                            }
                                        })
                                    }else{
                                        console.log('venda executada, aguardando compra')                                        
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
