# Webrtc p2p example

Пример реализации p2p соединения между браузерами посредством простого сигнального сервера на ноде и сокетах


## Signal server

 ```npm install``` - установка

 ```npm start``` - запуск

 Сервер это просто express с socket.io через которые браузеры соединяются, обмениваются сообщениями (для соединения), кандитами и офферами (для установки видео связи)


## Client

- app/js/connector.js

это прослойка для взаимодействия с сигнальным серером для передачи данных

- app/js/peerToPeer.js

это объект реализующий логику webrtc самым легким образом

```p2p.catchStream(...)``` - забирает поток с камеры и сохраняет поток

```call() ``` - предупреждает второго собеседника о том, что будет звонить. После чего, собственно, и звонит.


### Client logic

**caller**

``` stream (local video) => peerConnection => iceCandidate | generate offer | receive answer | onaddstream (remote video) ```

**receiver**

``` stream (local video) => peerConnection => iceCandidate | receive offer | generate answer | onaddstream (remote video) ```


## P.S.

 - после запуска перейти на [http://127.0.0.1:3000](http://127.0.0.1:3000) в двух вкладках и нажать join. После чего в одной из них нажать call;
 - изначально настроено под локальное через локалхост, но webrtc позволяет получать доступ к камере только через https или localhost.
 Поэтому чтобы запустить удаленно, надо включить https, а также иметь сгенерированные сертификаты;


```
//index.js
//...
//var http = require('http').createServer(app); //use with localhost
var http = require('https').createServer(credentials, app);
//...
```

```
//app/index.html (change to your ip)
//...
var connector = new Connector("https://192.168.0.103:3000"); //use for remote testing (need https server!)
//var connector = new Connector("http://127.0.0.1:3000"); //use for local testing on one machine

//...
```
