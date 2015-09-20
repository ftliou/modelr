var React = require('react');

/*
    A mixin utils for components that requires detecting events OUTSIDE of its own dom
*/
module.exports = {

    componentDidMount: function() {
        this.addClickHandler();
    },
    componentWillUnmount: function() {
        this.removeClickHandler();
    },
    addClickHandler: function() {
        var me = this;
        $('html').on("click",function(evt) {
            var target = evt.target;

            var node = me.getDOMNode();
            if (node) {
                if (target.id!=="overlay" && $.contains( node, target )) {
                    me.onClickInside && me.onClickInside(target);
                }
                else {
                    me.onClickOutside && me.onClickOutside(target);
                }
            }
        });
    },
    removeClickHandler: function() {
        $('html').off();
    }
};