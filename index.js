/*jshint node:true */
var
through = require('through2');

module.exports = function(bool, stream, opts) {

    opts = opts || {};

    var
    write_more = true,
    t = through.bind(this, opts);

    function process(chunk, enc, cb) {

        if ("function" == typeof bool && bool(chunk) ||
            "boolean" == typeof bool && bool) {

            var write = function() {

                if (!opts.branch)
                    stream.once("data", cb.bind(this, null));

                write_more = stream.write(chunk, enc);

                if (opts.branch === true)
                    return write_more ? cb() : stream.once("drain", cb);

            };

            return write_more ? write() : stream.once('drain', write);
        }

        return cb(null, chunk);
    }

    t = t(process);

    t.once('end', function() {
        stream.end();
    });

    return t;
};
