import $ from 'jquery';
import _ from 'lodash/fp';
import Promise from 'bluebird';
import Clipboard from 'clipboard';
import Cursor from './Cursor';
import Map from './Map';
import Display from './Display';
Promise.config({longStackTraces: true});

const $initForm = $('#initialization-form');
const $mapCanvas = $('#map');
const $showNumbers = $('#showNumbers');

const cursor = new Cursor();
let map, display;
getMapData()
  .then(mapData => map = new Map().setData(mapData))
  .then(map => display = new Display($mapCanvas, map, cursor).resize())
  .then(display => new Clipboard('#export', {text: map.export.bind(map)}))
  .then(clipboard => {
    clipboard.on('success', alert.bind(null, 'Success! Map copied to clipboard!'));
    clipboard.on('error', alert.bind(null, 'Error! Map not copied to clipboard!'));
  });

$('#export').click(e => e.preventDefault() && false);

function paintMap() {
  map.setTile(_.floor(cursor.x / map.tileWidth), _.floor(cursor.y / map.tileHeight), cursor.tileIndex);
}

$mapCanvas.mousemove(e => {
  cursor.x = _.clamp(0, map.width * map.tileWidth, e.offsetX);
  cursor.y = _.clamp(0, map.height * map.tileHeight, e.offsetY);
  if (cursor.pressed) {
    paintMap();
  }
});

$mapCanvas.bind('mousewheel', e => {
  cursor.tileIndex += e.originalEvent.wheelDelta / 120 > 0 ? -1 : 1;
  cursor.tileIndex = Math.max(0, cursor.tileIndex);
});

$mapCanvas.mousedown(e => {
  cursor.pressed = true;
  paintMap();
});

$mapCanvas.mouseup(e => {
  cursor.pressed = false
});

$mapCanvas.contextmenu(e => e.preventDefault() && false);

$showNumbers.change(e => {
  map.showNumbers = $showNumbers.prop('checked');
});

function getMapData() {
  return new Promise(resolve => {
    const data = {};

    $initForm.find('input').each((i, input) => {
      const $input = $(input);
      data[$input.attr('id')] = parseInt($input.val());
    });

    data.showNumbers = $('#showNumbers').prop('checked');

    const file = _.get(0, $initForm.find('#spritesheet').get(0).files);
    if (!file) {
      return resolve(data);
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const spriteSheet = new Image();
      spriteSheet.src = fileReader.result;
      resolve(_.assign(data, {spriteSheet}));
    };
    fileReader.readAsDataURL(file);
  });
}

$(() => {
  $initForm.submit(e => {
    e.preventDefault();
    getMapData()
      .then(map.setData.bind(map))
      .then(display.resize.bind(display));
    return false;
  });
});
