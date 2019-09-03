![RTbos-logo](https://i.imgur.com/TarmYFu.png)

![Status](https://img.shields.io/badge/Status-Estavel-yellowgreen.svg) ![Version](https://img.shields.io/badge/Vers%C3%A3o-2.1-brightgreen.svg) ![Lang](https://img.shields.io/badge/Language-NodeJS-yellow.svg) 

 - Version 2.0 **Capote**
 
 ## Dependencias

- "poloniex-api-node": "^2.0.1",
- "request": "^2.88.0",
- "socket.io": "^2.2.0",
- "technicalindicators": "^1.1.13",
- "bitcoin-chart-cli": "3.0"

## Instalação

A instalação é bem simples. Todo o sistema ultiliza Node.js por tanto, a instalação das dependencias é feita por NPM.
- 1 ~ Baixe ou clone o repositorio atual.
- 2 ~ No diretorio do sistema, abra o terminal e execute: ```sh ~$ npm install ```.
- 3 ~ configure o arquivo ``` ./config/config.js ``` adicionando as chaves API dentro de ``` apiKey: 'API_KEY', apiSecret: 'API_SECRET' ```
- 4 ~ Inicie o sistema com: 
```sh 
~$ npm start 
```

- 5 no browser, verifique se o grafico abre de acordo com a cotação da POLONIEX em: ``http://localhost:8081/``

## Erros

O sistema consiste em criar dentro do diretorio ``./var/`` um arquivo de log temporario onde são guardados os logs de erro.  Baseado nele, é possivel verificar q tipo de erro pode estar ocorrendo.

Os erros mais comuns são:

>- Timestamp (onde ocorre a queda da sincronia entre o bot.js e a api da poloniex: verique se o erro retorna `nonce error` e adicione +100 dentro do timestamp em ``./bot.js``  localizado após ``getTime()`` onde ocorre a multiplicação por 212665):
- original:
```js
const poloniex = new Poloniex(apiKey, secret, { nonce: () => new Date().getTime() * 212665 }, {socketTimeout: 60000});
```
- Correção do erro:
```js
const poloniex = new Poloniex(apiKey, secret, { nonce: () => new Date().getTime() * 212765 }, {socketTimeout: 60000});
```

>- Chave invalida (invalid_Key) Oc orre quando há algum erro na string da api key ou secret. Caso o erro persista, gere outra chava na plataforma da Poloniex ou verifique se não há caracteres ou espaços invalidos.

>- FillOrKill (erro na compra ou na venda) ocorre quando acontece uma falha na atualização do preço de compra/venda. O erro tem uma certa complexibilidade, dadas as circunstâncias onde  e quando o erro vai ocorrer. No geral, ele vem associado com o erro de Nonce (Timestamp) porem, se a sincronia estiver Ok, verifique se as chaves api estão conectadas a poloniex com a devida sincronia. Se ambas as alternativas n derem sucessom terá q ser feita uma correção manual do FillOrKill.
Verifique o arquivo `./bot.js/` até a parte de compra/venda:

```js
 function buy(){
   poloniex.buy(par, price, buyVal, 0, 1, 0, (err, response) => {
        if(err){
            console.log('algum erro ocorreu na compra -> '+err)
            console.log('alternando configuraçoes de entrada...')
            var errLog = `
                data/hora: ${dataTime},
                error: ${err},
                type: compra
                console: erro de compra (fillOrKill)`
            fs.writeFile(`./var/console${cont}.error`, errLog, (err) => {
                if(err){
                   console.log('erro ao criar arquivo de log -> '+err)
                  }else{
                    console.log('criando log de erros')
                  }
               })
        poloniex.buy(par, price, buyVal, 1, 0, 0, (err, response) => {
              if(err){
                 console.log('atualizando FillOrKill Value')
               poloniex.buy(par, price, buyVal, 1, 1, 1, (err, response) => {
                if(err){
                    console.log('impossivel enviar Compra');
                      }else{
                          console.log('compra -> '+response);
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
                                        poloniex.sell(par, price, sellVal, 0, 1, 0, (err, response) => {
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
                                                        console.log('atualizando FillOrKill Value')
                                                        poloniex.buy(par, price, buyVal, 1, 1, 1, (err, response) => {
                                                            if(err){
                                                                console.log('impossivel enviar Venda');
                                                            }else{
                                                                console.log('Venda -> '+response);
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
 ```
 
 - Consulte a Documentação da poloniex para saber mais detalhes de como configurar o FillOrKill:
[api poloniex](https://docs.poloniex.com/#buy)
