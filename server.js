var _ = require('lodash');
var readdirp = require('readdirp');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var React   = require('react');
var favicon = require('serve-favicon');
require('node-jsx').install({extension: '.jsx'});

var App = React.createFactory(require('./src/components/App.jsx'));
var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var server = require('http').createServer(app);


var api = express()
    .get('/buildings', function(req, res) { // return all json files (recursively) under test folder
        readdirp({root:__dirname+"/test/", fileFilter: '*.json'}, 
            function(err, data) {
                res.json({error:err && err.message, data: !data||!data.files ? [] : _.pluck(data.files, 'path')});   
        });
    })
    .get('/building', function(req, res) { // return file content for specified name
        var name = req.query.name;
        var content = "";
        fs.readFile(__dirname+"/test/"+name, {encoding:'UTF8'}, function(err, data) {
            var errMsg;
            if (err) {
                errMsg = err.message;
            }
            else {
                try {
                    content = JSON.parse(data);
                }
                catch(e) {
                    errMsg = e.message;
                }
            }
            res.json({error:errMsg, data:content});
        });
    })
    .get('*', function(req, res) {
        res.status(404).send('Not found');
    });

function renderApp(req, res, next) {
    
    var initialState = {};
    var appHtml = React.renderToString(App(initialState));
    
    res.setHeader('Content-Type', 'text/html');

    // render and return react component as raw html string
    res.send(
        "<!DOCTYPE html><html><head><title>Modelr!</title>"+
        "<meta charset='utf-8'>"+
        "<link rel='stylesheet' href='/assets/css/all.css'/>"+
        "</head><body><section id='app-container'>"+appHtml+"</section>"+
        "<script id='initial-state' type='application/json'>"+JSON.stringify(initialState)+"</script>"+
        "<script src='/assets/lib/jquery-2.1.1.min.js'></script>"+
        "<script src='/assets/lib/Detector.js'></script>"+
        "<script src='/assets/lib/dat.gui.min.js'></script>"+
        "<script src='/assets/lib/three.min.js'></script>"+
        "<script src='/assets/lib/TrackballControls.js'></script>"+
        "<script src=/assets/js/vendor.js></script>"+
        "<script src=/assets/js/app.js></script>"+
        "</body></html>"
    )
}

app
    .use("/assets",express.static(__dirname + '/assets'))
    .use("/assets/*",function(req,res) {
        res.status(404).send('Not found');
    })
    .use(favicon(__dirname + '/assets/favicon.ico'))
    .use('/api', api)
    .use('/',renderApp);


server.listen(3005, function(err) {
    if (err) 
        throw err;
    console.log('Listening on 3005...')
});