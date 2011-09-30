window.showSplash = (function($) {
    var activeSplashes = [];
    var w = $(window);
    function refresh() {
        var width = w.width();
        var height = w.height();
        for (var i = 0; i < activeSplashes.length; ++i) {
            var splash = activeSplashes[i];
            splash.css({
                left: 0.5 * (width - splash.outerWidth()),
                top: 0.5 * (height - splash.outerHeight())
            });
            if (splash.is(':hidden')) {
                splash.fadeIn();
            }
        }
    }
    function remove(splash) {
        var index = activeSplashes.indexOf(splash);
        if (index != -1) {
            activeSplashes.splice(index, 1);
        }
        splash.fadeOut(function() {
            splash.remove();
        });
    }
    $(function() {
        w.resize(refresh);
    });
    return function(text, timeout, html) {
        var d = $('<div>');
        d.css({
            'font-family': 'helvetica, tahoma, verdana',
            color: '#000',
            background: '#F8F8F8',
            opacity: 0.8,
            padding: '10px',
            '-moz-border-radius': '10px',
            '-webkit-border-radius': '10px',
            'border-radius': '10px',
            'white-space': 'pre-wrap',
            'cursor': 'pointer'
        });
        d.css({
            position: 'absolute',
            display: 'none',
            zIndex: 10000
        });
        if (html) d.html(text);
        else d.text(text);
        if (typeof timeout != 'undefined' && timeout != -1) {
            setTimeout(function() {
                remove(d);
            }, timeout);
        }
        else {
            var closer = $('<br/><br/><div style="font-size: x-small">Click the box to hide this message</div>');
            closer.css({cursor: 'pointer'});
            d.click(function() {
                remove(d);
            });
            d.append(closer);
        }
        $('body').append(d);
        activeSplashes.push(d);
        refresh();
    }
})(jQuery);
