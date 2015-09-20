var React = require('react');
var cx = require('classnames');

/*
    A ModalDialog
*/
var ModalDialog = React.createClass({
    getDefaultProps: function() {
        return {
            title: "",
            remember: true,
            draggable:false,
            show:true,
            actions: {},
            classes: {}
        };
    },
    getInitialState: function() {
        return {
            show:this.props.show
        };
    },
    toggle: function(show) {
        this.setState({show:show});
    },
    componentDidMount: function() {
        log.debug("ModalDialog::componentDidMount");
        this.focusAction();
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({show: nextProps.show});
    },
    componentDidUpdate: function() {
        log.debug("ModalDialog::componentDidUpdate");
        this.focusAction();
    },
    focusAction: function() {
        if (this.state.show) {
            var defaultAction = this.props.defaultAction;
            if (defaultAction) {
                this.refs[defaultAction].getDOMNode().focus();
            }
        }
    },
    render: function() {
        log.debug("ModalDialog::render");
        var me = this;
        var actions = this.props.actions;
        var containerStyles = this.props.classes;
        var dialogStyles = this.props.dialogClasses;
        var error = this.props.error;

        if (!this.state.show) {
            return <span/>;
        }
        var actionNodes = _.map(_.keys(actions), function(actionKey) {
            var action = actions[actionKey];
            return <button ref={actionKey} key={actionKey} name={actionKey} onClick={action.handler}>{action.text || actionKey}</button>;
        });
        return <section id={this.props.id} className={cx("c-modal-dialog modal show",containerStyles)}>
            <div id="overlay"></div>
            <section className="box dialog">
                {this.props.title ? <header>{this.props.title}</header> : null}
                <div className={cx("content  ",dialogStyles)}>{this.props.children}</div>
                <footer>
                    <div className="msg">{error}</div>
                    {actionNodes}
                </footer>
            </section>
        </section>;
    }
});

module.exports = ModalDialog;
 