

const api = require('./config/config');
const Poloniex = require('poloniex-api-node');
const request = require('request');
const fs = require('fs');
const clearModule = require('clear-module');
var cont = 0;
const apiKey = api.apiKey;
const secret = api.apiSecret;

const poloniex = new Poloniex(apiKey, secret, { nonce: () => new Date().getTime() * 2055 }, {socketTimeout: 60000});

const SMA = require('technicalindicators').SMA;

setInterval(() => {
//#################################################################################################################
//################################################## definições basicas ###########################################
//#################################################################################################################
const dataTime = new Date();
const par = 'USDT_BTC'; //ultilise o formato PAIR_PAIR ex. BTC_LTC, BTC_DOGE, USDT_BTC
const uTime = parseInt(new Date().getTime() / 1000);//TimeUnix format
const sub = 225550;//subtração do startTime
const period = 300; //valor do periodo dos candels em segundos (minimo 300 segundos ou 5 minutos)
const start = uTime - sub;//inicio do candle
const end = uTime;//fim do candle

const invest = api.invest; //valor a ser investido, caso esteja vazio o valor será seu saldo total - minimo 0.0001
const lucro = api.lucro; //porcentagem de lucro, caso esteja vazio o lucro esperado será maximo

//##################################################################################################################
//################################################### inicio do Robô ###############################################
//##################################################################################################################


    console.log('\033c Bem vindo ao RTbos v2.0 (capote) '+ cont++)
    console.log('\n TimeStamp -> '+uTime+'\n');
    poloniex.returnTicker((err, ticker) => {
        var lowesk = ticker.USDT_BTC.lowestAsk;
        var highest = ticker.USDT_BTC.highestBid;

           
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

                                    var Ma01_val = ma1.slice(-2)[0];
                                    var Ma02_val = ma2.slice(-2)[0];
                                    console.log('lowesk -> '+lowesk);
                                    console.log('highest -> '+highest);
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
                            poloniex.returnChartData(par, period, start, end, (err, data) => {
                                data = data.slice(-1)
                                console.log(data[0].close)

                                    //var price = renkoBrick.c.slice(-1);
                                    //var rate = parseInt(renkoBrick.c.slice(-1))
                                    var price = data[0].close;
                                    var rate = parseInt(data[0].close);
                                    var buyVal = (balance.USDT / lowesk);
                                    var sellVal = (highest * balance.BTC / highest);
                                    var USDT_buy = parseInt(buyVal);
                                    console.log('Preço -> '+price);
                                    console.log('rate -> '+rate)
                                    console.log('valor de compra -> '+buyVal);
                                    console.log('valor de venda -> '+sellVal);
                                    console.log('USDT valor int ->'+USDT_buy)
//======================================= funções de compra / venda =================================================
                                    function buy(){
                                        poloniex.buy(par, price, buyVal, 1, 1, 0, (err, response) => {
                                            if(err){
                                                console.log('algum erro ocorreu na compra -> '+err)
                                                console.log('alternando configuraçoes de entrada...')
                                                var errLog = `
                                                    data/hora: ${dataTime},
                                                    error: ${err},
                                                    type: compra
                                                    console: erro de compra (fillOrKill)
                                                `
                                                fs.writeFile(`./var/console${cont}.error`, errLog, (err) => {
                                                    if(err){
                                                    console.log('erro ao criar arquivo de log -> '+err)
                                                    }else{
                                                        console.log('criando log de erros')
                                                    }
                                                })
                                                poloniex.buy(par, price, buyVal, 1, 0, 0, (err, response) => {
                                                    if(err){
                                                        console.log('impossivel efetuar compra')
                                                    }else{
                                                        console.log(JSON.stringify(response))
                                                        var createTemp = "var lastOrder = {type: 'buy'}; module.exports = lastOrder;"
                                                            fs.writeFile('./var/tempFile.js', createTemp, (err) => {
                                                            if(err){
                                                                console.log(err)
                                                            }else{
                                                                console.log('criado arquivo temporario -> Buy')
                                                            }
                                                        })        
                                                    }
                                                })
                                            }else{
                                                console.log(JSON.stringify(response))
                                                var createTemp = "var lastOrder = {type: 'buy'}; module.exports = lastOrder;"
                                                    fs.writeFile('./var/tempFile.js', createTemp, (err) => {
                                                    if(err){
                                                        console.log(err)
                                                    }else{
                                                        console.log('criado arquivo temporario -> Buy')
                                                    }
                                                })        
                                            }
                                        })
                                    }

                                    function sell(){
                                        poloniex.sell(par, price, sellVal, 1, 1, 0, (err, response) => {
                                            if(err){
                                                console.log('algum erro ocorreu na venda -> '+err)
                                                console.log('alternando configuraçoes de entrada...')
                                                var errLog = `
                                                    data/hora: ${dataTime},
                                                    error: ${err},
                                                    type: venda
                                                    console: erro de compra (fillOrKill)
                                                `
                                                fs.writeFile(`./var/console${cont}.error`, errLog, (err) => {
                                                    if(err){
                                                    console.log('erro ao criar arquivo de log -> '+err)
                                                    }else{
                                                        console.log('criando log de erros')
                                                    }
                                                })
                                                poloniex.sell(par, price, buyVal, 1, 0, 0, (err, response) => {
                                                    if(err){
                                                        console.log('impossivel efetuar venda')
                                                    }else{
                                                        console.log(JSON.stringify(response))
                                                        var createTemp = "var lastOrder = {type: 'sell'}; module.exports = lastOrder;"
                                                            fs.writeFile('./var/tempFile.js', createTemp, (err) => {
                                                            if(err){
                                                                console.log(err)
                                                            }else{
                                                                console.log('criado arquivo temporario -> Sell')
                                                            }
                                                        })      
                                                    }
                                                })
                                            }else{
                                                console.log(JSON.stringify(response))
                                                var createTemp = "var lastOrder = {type: 'sell'}; module.exports = lastOrder;"
                                                    fs.writeFile('./var/tempFile.js', createTemp, (err) => {
                                                    if(err){
                                                        console.log(err)
                                                    }else{
                                                        console.log('criado arquivo temporario -> Sell')
                                                    }
                                                })
                                            }
                                        })
                                    }
//======================================= execução das ordens ========================================================
                                    if(cross() == 1){
                                        if(tempFile.type == 'sell'){
                                            console.log('executando compra');
                                            buy();
                                        }else{
                                            console.log('compra executada, aguardando venda')
                                        }

                                    }
                                    if(cross() == 2){
                                        if(tempFile.type == 'buy'){
                                            console.log('executando venda');
                                            sell();
                                        }else{
                                            console.log('venda executada, aguardando compra')                                        
                                        }
                                    }
                                })                                                                                                   
                            }
                        })
                    }
                })
            }
        })
    }
}) 
//##################################################################################################################
//################################################### Fim do Codigo ################################################
//##################################################################################################################

}, 5000);
