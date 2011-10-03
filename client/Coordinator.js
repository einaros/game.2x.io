var Coordinator = (function() {
    var Coordinator = {
        init: function() {
            if (!Detector.webgl) {
                showSplash('<center>It appears that your browser or graphics card doesn\'t fully support WebGL.\nTry a new version of Chrome or FireFox -- or wait for more widespread support :)\n\nSorry for the inconvenience!</center>', -1, true);
                return;
            }
            var container = $('<div>');
            var scene = $('#scene');
            scene.append(container);
            var info = $('#info');
            showSplash('<center>This is the start of a WebGL game, utilizing Three.js and box2d.\nFor the time being it isn\'t very feature rich - but that will change in time!\n\nStart out by drawing yourself a map below, from the left to the\nright edge, then get rolling!\n\nNote that while multiple browsers now support WebGL,\nI\'ve found that Chrome renders this best.\n\nFor updates, hit me up on twitter: <a href="http://twitter.com/einaros" target="_blank">@einaros</a>.</center>', -1, true);
            this.getMapDrawing(Game.config.mapWidth, Game.config.mapSegments, container, function(points) {
                Game.init(container[0], points);
            });
        },
        getMapDrawing: function(mapWidth, segments, container, complete) {
            var cleaners = [];
            // setup canvas
            var aspect = 10/20;
            var canvas = $('<canvas>');
            canvas.css({
                background: '#888888',
                cursor: 'pointer'
            });
            var wnd = $(window);
            wnd.bind('resize.drawmap', function() {
                var viewWidth = wnd.width();
                var viewHeight = wnd.height();
                if (viewWidth * aspect > viewHeight) viewWidth = viewHeight / aspect;
                else viewHeight = viewWidth * aspect;
                canvas.prop('width', viewWidth);
                canvas.prop('height', viewHeight);
            });
            wnd.resize();
            container.append(canvas[0]);
            // setup paper
            paper.setup(canvas[0]);
            // init tools and pull paths
            var startZone = 20;
            var endZone = 20;
            var startRect = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0, 0), new paper.Point(startZone, paper.view.size.height)));
            startRect.fillColor = '#aaaaaa';
            var startText = new paper.PointText(new paper.Point(startZone / 2, paper.view.size.height / 2));
            startText.fillColor = 'white';
            startText.content = "Start Drawing Here!";
            startText.rotate(-90);
            startText.position.x = 0.5 * (startZone + 7);
            startText.position.y = 0.5 * (paper.view.size.height + 110);
            var endRect = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(paper.view.size.width - endZone, 0), new paper.Point(paper.view.size.width, paper.view.size.height)));
            endRect.fillColor = '#aaaaaa';
            var endText = new paper.PointText(new paper.Point(0, 0));
            endText.fillColor = 'white';
            endText.content = "End Drawing Here!";
            endText.rotate(-90);
            endText.position.x = paper.view.size.width - 0.5 * (endZone - 10);
            endText.position.y = 0.5 * (paper.view.size.height + 100);
            var lastPointX = -1;
            var path = new paper.Path();
            var tool = new paper.Tool();
            // go draw 
            paper.view.draw();
            function drawingComplete(path) {
                wnd.unbind('.drawmap');
                // todo: accept path
                var points = [];
                var steps = segments + 1;
                var increment = path.length / steps;
                var drawWidth = paper.view.size.width;
                var drawHeight = paper.view.size.height;
                var sizeFactor = mapWidth / drawWidth;
                var halfHeight = drawHeight / 2;
                for (var i = 0; i < steps; ++i) {
                    var y = path.getPointAt(i * increment).y;
                    y = ((drawHeight - y) - halfHeight) * sizeFactor;
                    points.push(y);
                }
                canvas.remove();
                complete(points);
            }
            tool.onMouseDown = function(event) {
                if (event.point.x > 0 && event.point.x < startZone) {
                    startRect.fillColor = '#aaffaa';
                }
                else {
                    startRect.fillColor = '#ffaaaa';
                    showSplash('start your path within the far left rectangle', 1000);
                    return;
                }
                lastPointX = -1;
                path.removeSegments();
                path.strokeColor = 'white';
                path.add(event.point);
                tool.onMouseDrag = function(event) {
                    var pt = event.point;
                    if (lastPointX > pt.x) {
                        pt.x = lastPointX;
                    }
                    lastPointX = pt.x;
                    path.add(pt);
                }
                tool.onMouseUp = function(event) {
                    tool.onMouseDrag = null;
                    tool.onMouseUp = null;
                    path.simplify();
                    if (event.point.x > paper.view.size.width - endZone) {
                        endRect.fillColor = '#aaffaa';
                        drawingComplete(path);
                    }
                    else {
                        endRect.fillColor = '#ffaaaa';
                        path.removeSegments();
                        showSplash('end your path within the far right rectangle', 1000);
                        return;
                    }
                }    
            }
        },
        initGame: function() {
        }
    }
    return Coordinator;
})();
