var React = require('react');

/*
    A mixin utils for functionalities shared across form components.
*/
module.exports = {

    // normalize props for list-type components, ie DropDownList and RadioGroup
    normalizeList: function() {
        var props = this.props;
        var result = [];
        var list = props.list;
        var start = _.isNumber(props.start)?start:null;
        var stop = _.isNumber(props.stop)?stop:null;
        var step = _.isNumber(props.step)?step:null;

        if (list) { // list already provided from props
            if (_.isArray(list)) { 
                result = _.map(list, function(item) {
                    if (_.isObject(item)) {
                        return {val:item.value, desc:item.text||item.value};
                    }   
                    else {
                        return {val:item, desc:item};
                    }
                })
            }
            else {
                result = _.map(list, function(desc,val) {
                    return {val:val, desc:desc || val};
                })
            }
        }
        else if (start!==null && stop!==null) { // display a number range for dropdown list
            result = _.map(_.range(start, stop, step), function(i) {
                return {val:i, desc:i};
            });
        }
        return result;
    },

    // retrieve field value from prop
    retrieveValue: function(props) {
        if (!props) {
            props = this.props;
        }
        var val = props.value;
        if(val==null && props.valueLink) {
            val = props.valueLink.value;
        }
        if (val == null) {
            val = props.defaultValue;
        }
        return val;
    },

    // submit field change
    submitValue: function(newVal) {
        var name = this.props.name;
        var oldVal = this.state.value;
        var valueLink = this.props.valueLink;
        var isControlled = _.has(this.props, "value");
        var handler = this.props.onChange;

        if (isControlled) {
            if(!handler) {
                log.error("FormMixin::submitValue::"+this.constructor.displayName,"Controlled component without a 'onChange' event prop");
            }
            else {
                handler(name, newVal, oldVal, this);
            }
        }
        else if (valueLink) {
            valueLink.requestChange(newVal, oldVal, this);
        }
        else {
            this.setState({value: newVal}, function() {
                if (handler) {
                    handler(name, newVal, oldVal, this);
                }
            });
        }
    }
}