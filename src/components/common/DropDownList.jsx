var React = require('react');
var cx = require('classnames');
var FormMixin = require('./FormMixin.jsx');

/*
    A form component - DropDownList
*/
var DropDownList = React.createClass({
    mixins:[FormMixin],
    getInitialState: function() {
        return {
            value: this.retrieveValue()
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            value: this.retrieveValue(nextProps)
        });
    },
    handleChange: function(evt) {
        this.submitValue(evt.target.value);
    },
    render: function() {
        log.debug("DropDownList::render",this.props);
        var me = this;
        var error = this.props.error;

        var required = this.props.required;
        var defaultValue = this.props.defaultValue;
        var value = this.state.value;
        var classes = {};

        var normalized = this.normalizeList();
        
        var found = false;
        if (value != null) {
            found = _.find(normalized, function(item){ 
                return (item.val+"")===(value+""); 
            });
        }
        
        if (!found || !required) {
            normalized.unshift({desc:""});
        }
        if (!found && required) {
            classes.invalid = true;
        }
        return <select className={cx(classes)} name={this.props.name} onChange={this.handleChange} required={required} value={value} defaultValue={defaultValue} size={this.props.size || 1} disabled={this.props.disabled}>
            {
                _.map(normalized, function(item, i) {
                    return <option key={item.val||"_"} value={item.val}>{item.desc}</option>
                })
            }
        </select>;
    }
});

module.exports = DropDownList;