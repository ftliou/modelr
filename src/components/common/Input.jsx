var React = require('react');
var _string = require('underscore.string');
var Popover = require('./Popover.jsx');
var FormMixin = require('./FormMixin.jsx');


/*
    A form component - Input textbox
*/
var Input = React.createClass({
    mixins:[FormMixin],
    getDefaultProps: function() {
        return {
            type:"text"
        };
    },
    getInitialState: function() {
        var val = this.retrieveValue();
        return {
            value: val,
            old: val,
            error: this.validateInput(val)
        };
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        return JSON.stringify(this.props) !== JSON.stringify(nextProps) ||
            JSON.stringify(this.state) !== JSON.stringify(nextState);
    },
    componentWillUnmount: function() {
        Popover.close();
    },
    componentWillReceiveProps: function(nextProps) {
        var val = this.retrieveValue(nextProps);
        this.setState({
            value: val,
            old: val,
            error: this.state.error || this.validateInput(val)
        });
    },
    changeHandler: function(evt) {
        var me = this;
        var newVal = evt.target.value;
        var error = this.validateInput(newVal);
        this.nextTime = false;

        if (error) {
            evt.stopPropagation();
            evt.preventDefault();
            Popover.open(evt, error);
            this.setState({error:error, value:newVal});
        }
        else {
            Popover.close();
            this.setState({value:newVal, error:false});
        }
    },
    blurHandler: function(evt) {
        if (this.state.error) {
            if (!this.nextTime) {
                this.nextTime = true;
                this.setState({value:this.state.old});
                this.getDOMNode().focus();
            }
            else {
                this.nextTime = false;
                Popover.close();
                this.setState({error:this.validateInput(evt.target.value)!==null});
            }
        }
        else {
            if (this.state.old !== this.state.value) {
                var oldVal = this.state.old;
                var newVal = this.state.value;
                var decimal = this.props.decimal;
                if (this.props.type==="number" && this.isInteger(decimal) && newVal != null && !_string.isBlank(newVal)) {
                    newVal = Number(newVal).toFixed(decimal);
                }

                this.setState({old:newVal, value:newVal}, function() {
                    if (this.props.valueLink) {
                        this.props.valueLink.requestChange(this.state.value, oldVal, this);   
                    }
                    else if (this.props.onChange) {
                        this.props.onChange(this.props.name, this.state.value, oldVal, this);
                    }
                });
            }
        }
    },
    isInteger: function(n) {
        return !isNaN(n) && Number(n)%1===0;;
    },
    validateInput : function (inputValue) {
        var props = this.props;
        var inputType = props.type;
        var pattern = props.pattern;
        var patternMsg = props.patternMsg;
        var min = props.min;
        var max = props.max;
        var step = props.step;
        var required = props.required;

        var errorCode = "";
        var errorParams = {};

        if (inputValue==null || _string.isBlank(inputValue)) {
            if (required) {
                log.error(props.name, "required");
                errorCode = "missing";
            }
        }
        else if (pattern) {
            if (!new RegExp(pattern).test(inputValue)) {
                errorCode = "incorrect";
                errorParams = {pattern:patternMsg || pattern};
            }
        }
        else if (inputType==='number') {
            if (this.isInteger(step) && !this.isInteger(inputValue)) {
                errorCode = "notInt";
            }
            else if (!this.isInteger(step) && isNaN(inputValue)) {
                errorCode = "notNum";
            }
            else
            {
                var parsedValue = parseFloat(inputValue);
                var hasMin = _.has(props, "min");
                var hasMax = _.has(props, "max");
                if ((hasMin && (parsedValue < min)) || (hasMax && parsedValue > max))
                {
                    errorCode = "outOfBound";
                    errorParams = {min:(hasMin?min:""), max:(hasMax?max:"")};
                } 
            }
        }

        if (errorCode) {
            return <span>{inputValue} {errorCode}</span>;
        }
        else {
            return null;
        }
    },
    render: function() {
        log.debug("Input::render",this.props, this.state);
        var me = this;
        var error = this.props.error;

        var name = this.props.name;
        var type = this.props.type;
        var value = this.state.value;
        var defaultValue = this.props.defaultValue;
        var disabled = this.props.disabled;
        var changeHandler = this.changeHandler;
        
        switch(type) {
            default:
                return <input 
                    name={name}
                    type="text"/*{type}*/ 
                    /*min={this.props.min} 
                    max={this.props.max} 
                    step={this.props.step} 
                    pattern={this.props.pattern} 
                    required={required}*/
                    readOnly={this.props.readOnly}
                    disabled={disabled}
                    onChange={changeHandler} 
                    onBlur={this.blurHandler}
                    placeholder={this.props.placeholder}
                    className={this.state.error?"invalid":""}
                    defaultValue={defaultValue} 
                    value={value}/>
        }
    }
});

module.exports = Input;