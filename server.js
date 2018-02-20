var express = require('express');                //Modulo express (framework de NodeJS)
var app = express();
var http = require('http')                       //Modulo http para el servidor.
var fs = require('fs');                          //Modulo para acceder los archivos del sistema.
var request = require('request')                 // Modulo para descargar archivos.
var path = require('path');
var url = require('url');
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/'));

app.get('/', function (req, res) {

    res.sendFile(path.join(__dirname, '/index.html'));

});

app.get('/PlayList.json', function (req, res) {

    fs.stat('PLayList.json', function (err, stat) {

        if (err == null) {
            console.log("Ya se ha descargado el archivo PlayList.json");
            fs.readFile('Playlist.json', (err, data) => {
                if (err) throw err;
                var SetList = JSON.parse(data);
                console.log(SetList);
                console.log("Se imprimio el SetList");
                res.send(SetList);

            });
        } else {
            var file = fs.createWriteStream('PlayList.json');
            http.get("http://cdn.tekus.co/Media/PlayList.json", function (res) {
                res.pipe(file);
            });
        }
    });

});

app.get('/Download/:number', function (req, res) {

    fs.readFile('Playlist.json', (err, data) => {
        if (err) throw err;
        var SetList = JSON.parse(data);
        console.log(SetList);

        console.log("Descargando el item #" + (req.params.number).toString());
        download("http://cdn.tekus.co/Media/" + SetList[req.params.number].Name, SetList[req.params.number].Name, function (response) {
            console.log('Elemento # ' + (req.params.number).toString() + ' decargado.');
            res.end();
        });


    });
});

app.get('/Check/:number', function (req, res) {


    fs.readFile('Playlist.json', (err, data) => {
        if (err) throw err;
        var SetList = JSON.parse(data);
        console.log(SetList);

        fs.open('/Users/User/Desktop/Web Development 2/PruebaTekus2/Media/' + SetList[req.params.number].Name, 'r', (err, fd) => {
            if (err) {
                if (err.code === 'ENOENT') {

                    console.log('Elemento # ' + (req.params.number).toString() + ' no estaba decargado.');
                    res.writeHead(404);
                    res.end();

                }
            } else {

                console.log('Elemento # ' + (req.params.number).toString() + ' ya estaba decargado.');
                res.writeHead(200);
                res.end();

            }
        });
    });
});

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream("/Users/User/Desktop/Web Development 2/PruebaTekus2/Media/" + filename)).on('close', callback);
        // progress(request(uri), {
        //
        // }).on('progress', function (state) {
        //
        //     console.log('progress', state.percent);
        //
        //   }).pipe(fs.createWriteStream("/Users/User/Desktop/Web Development 2/PruebaTekus/Media/" + filename));

    });
};

io.on('connection', function(socket) {

  console.log("Alguien se ha conectado con Sockets con ID:"+socket.id);

});

server.listen(8080, function() {
  console.log("Servidor corriendo en http://localhost:8080");
});
