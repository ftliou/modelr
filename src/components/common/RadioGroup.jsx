var React = require('react/addons');
var cx = require('classnames');
var FormMixin = require('./FormMixin.jsx');

/*
    A form component - RadioGroup
*/
var RadioGroup = React.createClass({
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
        log.debug("RadioGroup::render",this.props);
        var me = this;

        var required = this.props.required;
        var disabled = this.props.disabled;
        var onChange = this.handleChange;
        var value = this.state.value;

        var normalized = this.normalizeList();
        
        return <div className={cx("c-radio","inline",this.props.classes)}>
            {
                _.map(normalized, function(item, i) {
                    return <label key={item.val} className={item.val}>
                        <input type='radio' onChange={onChange} value={item.val} checked={value===item.val} disabled={disabled}/>
                        <span>{item.desc}</span>
                    </label>;
                })
            }
        </div>;
    }
});

module.exports = RadioGroup;