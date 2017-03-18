# Webrtc p2p example

Пример реализации p2p соединения между браузерами посредством простого сигнального сервера на ноде и сокетах


## Signal server

 ```npm install``` - установка

 ```npm start``` - запуск

 Это просто express с socket.io через которые браузеры соединяются, обмениваются сообщениями, кандидатами и офферами.


## Client p2p

- app/js/connector.js

это прослойка для взаимодействия с сигнальным сервером для передачи данных

- app/js/peerToPeer.js

это объект реализующий логику webrtc

```p2p.catchStream(...)``` - забирает поток с камеры и сохраняет его у себя

```call() ``` - предупреждает второго собеседника о том, что будет звонить. После чего, собственно, и звонит.


### Client p2p logic

**caller**

``` stream (local video) => peerConnection => iceCandidate | generate offer | receive answer | onaddstream (remote video) ```

**receiver**

``` stream (local video) => peerConnection => iceCandidate | receive offer | generate answer | onaddstream (remote video) ```


## P.S.

 - после запуска перейти на [http://127.0.0.1:3000](http://127.0.0.1:3000) в двух вкладках и нажать join. После чего в одной из них нажать call;

 - изначально настроено под localhost. Браузер позволяет получать доступ к камере только через https или localhost, поэтому, чтобы запустить удаленно, надо включить https, а также иметь сгенерированные сертификаты;

 - для работы удаленно, кроме сертификатов, надо настроить следующее:
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


# Video stream filter

 На видео поток можно накладывать фильтр и передавать по сети отфильтрованное видео. Для этого можно использовать [http://www.pixijs.com/](pixi js).

  - Для этого надо получить поток с камеры;
  - Создать pixi Application;
  - Создать спрайт видео текстурой, указав видео с оригинальным потоком как источник;
  - Получить поток из созданного Pixi канваса и передавать уже его;

 При этом надо не забывать, что обработка видео будет происходить посредством WebGL.

 ## Single page filter

 После запуска сервера перейти на [http://127.0.0.1:3000/filter.html](http://127.0.0.1:3000/filter.html).

 ## p2p Filter

 Работу p2p можно проверить на странице [http://127.0.0.1:3000/p2p_filter.html](http://127.0.0.1:3000/p2p_filter.html). Ну или же включить IP сервера на страницах и https в index.js.






