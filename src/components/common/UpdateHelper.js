var React = require('react');

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;


module.exports = {

    toPath: function(value) {

        var result = [];
        value.replace(rePropName, function(match, number, quote, string) {
            result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
        });
        return result;
    },

    // Create an optimized clone of original and set 'field' to 'newVal', using React.addons.update.
    // Leaves 'original' untouched.
    setWithClone: function(original, field, newVal) {
        var fields = _.isArray(field) ? field : this.toPath(field);

        var init;
        var traverse = original;
        var fill = _.takeWhile(fields, function(item) {
            traverse = traverse[item];
            return (traverse != null);
        });

        if (fill.length < fields.length) {
            init = {$merge: _.reduceRight(_.drop(fields, fill.length), function(memo, i) {
                var local = {};
                local[i] = memo;
                return local; 
            }, newVal)};
        }
        else {
            init = {$set:newVal}
        }

        var updateObj = _.reduceRight(fill, function(memo, i){ 
            var local = {};
            local[i] = memo;
            return local; 
        }, init);
        
        return React.addons.update(original, updateObj);
    }
}