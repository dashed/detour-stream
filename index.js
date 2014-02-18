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

                if (!opts.branch) {

                    var
                    error_handle,
                    data_handle,
                    general;

                    general = function(event, func, err, data) {
                        if (func)
                            stream.removeListener(event, func);

                        return cb(err, data);
                    };

                    if (opts.bubbleError === true)
                        error_handle = general.bind(this, 'data', data_handle);

                    data_handle = general.bind(this, 'error', error_handle);

                    // error_handle = function(err) {
                    //     stream.removeListener('data', data_handle);
                    //     return cb(err);
                    // };

                    // data_handle = function(data) {
                    //     stream.removeListener('error', error_handle);
                    //     return cb(null, data);
                    // };

                    stream.once('error', error_handle);
                    stream.once("data", data_handle);
                    // stream.once("data", cb.bind(this, null));
                }

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
