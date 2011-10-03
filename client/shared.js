var SCREEN_WIDTH = window.innerWidth
  , SCREEN_HEIGHT = 400
  , SCREEN_HALFWIDTH = SCREEN_WIDTH / 2
  , SCREEN_HALFHEIGHT = SCREEN_HEIGHT / 2;

function valOrDef(property, def) {
    return typeof property != 'undefined' ? property : def;
}
