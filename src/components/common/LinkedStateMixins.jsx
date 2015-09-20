var React = require('react');
var UpdateHelper = require('./UpdateHelper');

/*
    A mixin helper for linking 1) shallow 2) deep state changes.
*/
module.exports = {
    LinkedStateMixin: {
        requestChange: function(name, newVal) {
            log.debug("LinkedStateMixin::requestChange",arguments);
            this.setState(_.zipObject([[name, newVal]]));
        },
        linkState: function(field) {
            log.debug("LinkedStateMixin::linkState",field);
            
            return {
                requestChange: this.requestChange.bind(this, field),
                value: this.state[field]
            };
        }
    },

    LinkedDeepStateMixin: {
        requestDeepChange: function(field, newVal) {
            log.debug("LinkedDeepStateMixin::requestDeepChange",arguments);
            this.setState(UpdateHelper.setWithClone(this.state, field, newVal));
        },
        linkDeepState: function(field) {
            var value = _.get(this.state, field, null);
            log.debug("LinkedDeepStateMixin::linkDeepState", field, value);

            return {
                requestChange: this.requestDeepChange.bind(this, field),
                value: value
            };
        }
    }
}