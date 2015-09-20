var React = require('react/addons');
var cx = require('classnames');
var FormMixin = require('./FormMixin.jsx');

/*
    A form component - MultiInput: container for a list of form components of the same type.
    eg. a field that allows user to add/remove the colors he/she likes.
*/
var MultiInput = React.createClass({
    mixins:[FormMixin],
	getInitialState: function() {
		var val = this.retrieveValue();
		return {
			value: val || [],
			_value: val || []
		};
	},
	componentWillReceiveProps: function(nextProps) {

		this.setState({
			value: this.retrieveValue(nextProps)
		});
	},
    handleChange: function(result) {
    	this.setState({_value: result});
    	this.submitValue(_.compact(result));
    },
    modifyInput: function(i, name, newVal) {
    	this.handleChange(React.addons.update(this.state._value, {$splice:[[i,1,newVal]]})) ;
    },
    addInput: function() {
    	this.handleChange(React.addons.update(this.state._value, {$push:[""]}));
    },
    removeInput: function(i) {
    	this.handleChange(React.addons.update(this.state._value, {$splice:[[i, 1]]}));
    },
	render: function() {
		log.debug("MultiInput::render");
		var me = this;
        var error = this.props.error;

        var base = this.props.base;
        var baseProps = this.props.props;

        var name = this.props.name;
        var required = this.props.required;
        var defaultValue = this.props.defaultValue;
        var value = this.state._value;
        var disabled = this.props.disabled;
        var expand = this.props.expand;
        if (value.length === 0) {
        	value = [""];
        }

        return <span className={cx("c-multi",{expand:expand})}>
	        {
		        _.map(value,function(item, i) {
					return <span key={i} className="c-multi-el">
						{
							React.createElement(base, _.extend(baseProps, {
								required:required, 
								onChange:me.modifyInput.bind(me, i),
								value:item
							}))
						}
						<button onClick={me.removeInput.bind(me, i)}>x</button>
						{
							(i===value.length-1) && <button onClick={me.addInput}>+</button>
						}
					</span>;
				})
			}
		</span>;
	}

});

module.exports = MultiInput;