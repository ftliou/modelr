var React = require('react');

/*
	Displays information for a single piece of the building
*/
var PieceInfo = React.createClass({
	getInitialState: function() {
		return {
			message: "",
			type: ""
		}
	},

	update: function(type, newInfo) {
		this.setState({
			type: type,
			message: newInfo && JSON.stringify(newInfo, function(k,v){
						if (v instanceof Array && !isNaN(v[0])) {
							return JSON.stringify(v);
						}
						return v;
					}, '    ')
		})
	},
	render: function() {
		return <div id="piece">{this.state.type}: {this.state.message}</div>;
	}
});

module.exports = PieceInfo;