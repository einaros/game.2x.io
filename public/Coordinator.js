var Coordinator=function(){var a={init:function(){if(!Detector.webgl)showSplash("<center>It appears that your browser or graphics card doesn't fully support WebGL.\nTry a new version of Chrome or FireFox -- or wait for more widespread support :)\n\nSorry for the inconvenience!</center>",-1,!0);else{var a=$("<div>"),b=$("#scene");b.append(a);var c=$("#info");showSplash('<center>This is the start of a WebGL game, utilizing Three.js and box2d.\nFor the time being it isn\'t very feature rich - but that will change in time!\n\nStart out by drawing yourself a map below, from the left to the\nright edge, then get rolling!\n\nNote that while multiple browsers now support WebGL,\nI\'ve found that Chrome renders this best.\n\nFor updates, hit me up on twitter: <a href="http://twitter.com/einaros" target="_blank">@einaros</a>.</center>',-1,!0),this.getMapDrawing(Game.config.mapWidth,Game.config.mapSegments,a,function(b){Game.init(a[0],b)})}},getMapDrawing:function(a,b,c,d){function e(c){i.unbind(".drawmap"),c.simplify(),c.smooth();var e=[],f=b+1,j=c.length/f,k=paper.view.size.width,l=paper.view.size.height,m=a/k*g,n=l/2,o=a/c.bounds.width,p=c.getPointAt(0).x;for(var q=0;q<f;++q){var r=c.getPointAt(q*j),s=c.getTangentAt(q*j),t=c.getNormalAt(q*j);e.push({x:(r.x-p)*o,y:(l-r.y-n)*m,tangent:s==null?0:s.angleInRadians,normal:t==null?Math.PI/2:t.angleInRadians});if(q%20==0&&t!=null){var u=new paper.Path;u.strokeColor="red",u.add(new paper.Point(r.x,r.y)),t.length=60,u.add(new paper.Point(r.x+t.x,r.y+t.y));var v=new paper.PointText(new paper.Point(r.x+t.x,r.y+t.y));v.fillColor="white",v.content=t.angleInRadians}}h.remove(),d(e)}var f=.5,g=.5,h=$("<canvas>");h.css({background:"#888888",cursor:"pointer"});var i=$(window);i.bind("resize.drawmap",function(){var a=i.width(),b=i.height();a*f>b?a=b/f:b=a*f,h.prop("width",a),h.prop("height",b)}),i.resize(),c.append(h[0]),paper.setup(h[0]);var j=20,k=20,l=new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(0,0),new paper.Point(j,paper.view.size.height)));l.fillColor="#aaaaaa";var m=new paper.PointText(new paper.Point(j/2,paper.view.size.height/2));m.fillColor="white",m.content="Start Drawing Here!",m.rotate(-90),m.position.x=.5*(j+7),m.position.y=.5*(paper.view.size.height+110);var n=new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(paper.view.size.width-k,0),new paper.Point(paper.view.size.width,paper.view.size.height)));n.fillColor="#aaaaaa";var o=new paper.PointText(new paper.Point(0,0));o.fillColor="white",o.content="End Drawing Here!",o.rotate(-90),o.position.x=paper.view.size.width-.5*(k-10),o.position.y=.5*(paper.view.size.height+100);var p=-1,q=new paper.Path,r=new paper.Tool;paper.view.draw(),r.onMouseDown=function(a){if(a.point.x>0&&a.point.x<j)l.fillColor="#aaffaa";else{l.fillColor="#ffaaaa",showSplash("start your path within the far left rectangle",1e3);return}p=-1,q.removeSegments(),q.strokeColor="white",q.add(a.point),r.onMouseDrag=function(a){var b=a.point;p=b.x,q.add(b)},r.onMouseUp=function(a){r.onMouseDrag=null,r.onMouseUp=null;if(a.point.x>paper.view.size.width-k)n.fillColor="#aaffaa",e(q);else{n.fillColor="#ffaaaa",q.removeSegments(),showSplash("end your path within the far right rectangle",1e3);return}}}},initGame:function(){}};return a}()