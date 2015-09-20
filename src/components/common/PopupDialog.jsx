var React = require('react/addons');
var ModalDialog = require('./ModalDialog.jsx');
var globalPopup = null;


var TYPES = {ALERT:"1", CONFIRM:"2", PROMPT:"3"};

/*
    PopupDialog is a special class of ModalDialog, possible types are alert, confirm and prompt.
    A singleton component.
*/

var PopupDialog = React.createClass({
    getInitialState: function() {
        return {
            open:false
        };
    },
    componentDidMount: function() {
        var me = this;
        log.debug("PopupDialog::componentDidMount");
    },
    componentWillUnmount: function() {
        log.debug("PopupDialog::componentWillUnmount");
    },
    componentDidUpdate: function() {
    },
    open: function(type, title, display, callback) {
        this.setState({
            type:TYPES[type.toUpperCase()], 
            title:title, 
            display:display, 
            callback:callback, 
            open:true
        });
    },
    handleSubmit: function() {
        var inputs = $(this.getDOMNode()).find("input:text, input:checkbox, input:password, input:file, select, textarea");
        log.debug(inputs);
        var _callback = this.state.callback;
        
        var result = {};
        if (inputs.length>0) {
            _.each(inputs, function(input) {
                result[input.name] = (input.type==="checkbox" ? input.checked : input.value);
            });
        }
        var err = _callback && _callback(true, result);
        if (err) {
            this.setState({error:err});
        }
        else {

            this.setState({open:false});
        }
    },
    handleCancel: function() {
        var _callback = this.state.callback;
        
        _callback();
        this.setState({open:false, error:null});
    },
    render: function() {
        log.debug("PopupDialog::render");
        var me = this;
        var state = this.state;
        var id = "g-popup";

        if (!this.state.open) {
            return null;
        }
        switch(this.state.type) {
            case TYPES.ALERT:
                return <ModalDialog 
                    title={state.title} 
                    id={id} 
                    defaultAction="submit" 
                    actions={{submit:{handler:this.handleSubmit, text:"ok"}}} 
                    classes="center global">
                {state.display}
            </ModalDialog>;
            case TYPES.CONFIRM:
            case TYPES.PROMPT:
                return <ModalDialog 
                    title={state.title} 
                    id={id} 
                    error={this.state.error} 
                    defaultAction="cancel" 
                    actions={{submit:{handler:this.handleSubmit}, cancel:{handler:this.handleCancel}}}
                    classes="center global">
                {state.display}
            </ModalDialog>;

            default:
                return null;
        }
    }
});

function openPopupIf(type, condition, args) {
    if (condition) {
        openPopup(type, args)
    }
    else {
        args.callback(true);
    }
};
function openPopup(type, args) {
    if (!globalPopup) {
        var node = document.createElement("DIV"); 
        node.id = "g-popup-container";
        document.getElementById("app-container").appendChild(node);
        globalPopup = React.render(
            <PopupDialog/>,
            document.getElementById('g-popup-container')
        );
    }
    globalPopup.open(type, args.title, args.display, args.callback);
};
module.exports = {
    alert: openPopup.bind(null, "alert"),
    confirm: openPopup.bind(null, "confirm"),
    confirmIf: openPopupIf.bind(null, "confirm"),
    prompt: openPopup.bind(null, "prompt")
};