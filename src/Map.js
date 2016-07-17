import _ from 'lodash/fp';

/**
 * @property {Image} spriteSheet
 */
export default class Map {
  setData({mapWidth, mapHeight, tileWidth, tileHeight, defaultTile, spriteSheet, showNumbers}) {
    this.width = mapWidth;
    this.height = mapHeight;
    this.spriteSheet = spriteSheet;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.showNumbers = showNumbers;
    this.data = [];
    this.iterate((x, y) => {
      this.data[y] = this.data[y] || [];
      this.setTile(x, y, defaultTile);
    });
    return this;
  }

  iterate(cb) {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        cb(x, y, _.get(`${y}.${x}`, this.data));
      }
    }
    return this;
  }

  setTile(x, y, tile) {
    this.data[y][x] = tile;
    return this;
  }

  export() {
    return JSON.stringify(this.data);
  }
}
