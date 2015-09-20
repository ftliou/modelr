global._ = require('lodash');
global.log = require('loglevel');

global.log.setLevel("info");

var React = require('react');

var Modelr = require('../modelr');
var PieceInfo = require('./PieceInfo.jsx');
var DropDownList = require('./common/DropDownList.jsx');
var LinkedStateMixin = require('./common/LinkedStateMixins.jsx').LinkedStateMixin;

/*
    The start of the application, top level container
*/
var App =  React.createClass({
    mixins:[LinkedStateMixin],
    getInitialState: function () {
        return { 
            buildings:[],
            curBuilding: null
        };
    },
    componentDidMount: function() {
        this.modelr = new Modelr(); // Initialize Modelr renderer
        this.refreshBuildings();
    },
    // load building and render
    loadBuilding: function(name) {
        var me = this;
        log.debug("App::loadBuilding",name);

        $.get('/api/building', {name: name}, function(result) {
            if (result.error) {
                alert("Error reading "+name+": "+result.error);
            }
            else {
                me.setState({curBuilding: name}, function() {
                    me.modelr.load(result.data);
                    me.modelr.on('piece', function(piece) {
                        me.refs.pieceInfo.update(piece.type, piece.data);
                    });
                });
            }
        });
    },
    // load building list
    refreshBuildings: function() {
        var me = this;
        this.refs.pieceInfo.update(); // clear piece info
        
        $.get('/api/buildings', function(result) {
            var buildings = result.data;
            if (result.error) {
                alert("Error reading building list: "+result.error);
            }
            else {
                me.setState({ buildings: buildings }, function() {
                    if (buildings && buildings.length > 0) {
                        me.loadBuilding(buildings[0]);
                    }
                });
            }
        });
    },
    changeBuilding: function(name, newVal) {
        this.refs.pieceInfo.update();
        this.loadBuilding(newVal);
    },
    render: function () {
        log.debug("App::render");

        return <div id="app">
            <div id="controls">
                <div id="selector">
                    <DropDownList list={this.state.buildings} value={this.state.curBuilding} onChange={this.changeBuilding} required={true}/>
                    <button onClick={this.refreshBuildings}>Refresh</button>
                </div>
                <div id="gui"/>
            </div>
            <div id="canvas"></div>
            <PieceInfo ref="pieceInfo"/>
        </div>;
    }
});


if (typeof window !== "undefined") {
    var initialState = JSON.parse(document.getElementById('initial-state').innerHTML);
    React.render(<App {...initialState}/>, document.getElementById("app-container"));
} else {
    module.exports = App;
}