var React = require("react");
var cx = require('classnames');
var globalPopover = null;

/*
	Popover - A singleton component
*/
var Popover = React.createClass({

	getInitialState: function() {
		return {
			open:false
		};
	},
	componentDidMount: function() {
		log.debug("Popover::componentDidMount");
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return JSON.stringify(this.state) !== JSON.stringify(nextState);
	},
	close: function() {
		if (this.isOpen()) {
			this.setState({open:false});
		}
	},
	isOpen: function() {
		return this.state.open;
	},
	open: function(position, display, cfg) {
		log.debug("Popover::open", arguments);
		this.setState({
			position:position,
			display:display, 
			cfg:cfg,
			open:true
		});
	},
	render: function() {
		log.debug("Popover::render");

		var me = this;
		var position = this.state.position;
		var display = this.state.display;
		var cfg = this.state.cfg;

		if (!this.state.open) {
			return null;
		}
		else {
			var style=_.extend({left:position.x+"px", top:(position.y+(cfg.pointy?6:0))+"px"}, cfg.styles);
			return <div className={cx("c-popover",{pointy:cfg.pointy})} style={style}>
				{display}
			</div>;
		}
	}
});

module.exports = {
    open: function(pos, display, cfg) {
		
		cfg = _.defaults(cfg||{}, {pointy:true, styles:{}});

	    if (!globalPopover) {
	        var node = document.createElement("DIV"); 
	        node.id = "g-tt-container";
	        document.getElementById("app-container").appendChild(node);
	        globalPopover = React.render(
	            <Popover/>,
	            document.getElementById('g-tt-container')
	        );
	    }
	    var position = pos;

	    if (pos.target) {
	    	var rect = pos.target.getBoundingClientRect();
	    	position = {x: rect.left+(rect.width/2), y:rect.bottom};
	    }
	    
	    globalPopover.open(position, display, cfg);
	},
    close: function() {
		globalPopover && globalPopover.close();
	}
};