import _ from 'lodash/fp';

const COLORS = {
  BLACK: '#000000',
  GRAY: '#D3D3D3',
  fromInt: i => '#' + Math.floor(((i + 10) / 99) * 16777215).toString(16)
};

export default class Display {
  constructor($canvas, map, cursor) {
    this.$canvas = $canvas;
    this.ctx = this.$canvas.get(0).getContext('2d');
    this.map = map;
    this.cursor = cursor;
    this.interval = setInterval(this.draw.bind(this), 60);
  }

  /**
   * @returns {Display}
   */
  resize() {
    this.$canvas.attr('width', this.width = this.map.width * this.map.tileWidth);
    this.$canvas.attr('height', this.height = this.map.height * this.map.tileHeight);
    return this;
  }

  draw() {
    if (!this.map) {
      return false;
    }

    this.clear();
    this.ctx.strokeStyle = COLORS.GRAY;
    this.map.iterate(this.drawPos.bind(this));
    this.ctx.strokeStyle = COLORS.BLACK;
    this.drawPos(
      _.floor(this.cursor.x / this.map.tileWidth),
      _.floor(this.cursor.y / this.map.tileHeight),
      this.cursor.tileIndex
    );
  }

  drawPos(x, y, tile) {
    [
      this.drawTile,
      this.drawSprite,
      this.drawBorder,
      this.numberTile
    ].forEach(cb => cb.call(this, x, y, tile));

    return this;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = COLORS.BLACK;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawTile(x, y, tile) {
    this.ctx.fillStyle = COLORS.fromInt(tile);
    this.ctx.fillRect(
      x * this.map.tileWidth,
      y * this.map.tileHeight,
      this.map.tileWidth,
      this.map.tileHeight
    );
  }

  drawSprite(x, y, tile) {
    if (this.map.spriteSheet) {
      const tilesAcross = _.floor(this.map.spriteSheet.width / this.map.tileWidth);
      const srcX = (tile % tilesAcross);
      const srcY = _.floor(tile / tilesAcross);
      this.ctx.drawImage(
        this.map.spriteSheet,
        srcX * this.map.tileWidth,
        srcY * this.map.tileHeight,
        this.map.tileWidth,
        this.map.tileHeight,
        x * this.map.tileWidth,
        y * this.map.tileHeight,
        this.map.tileWidth,
        this.map.tileHeight
      );
    }
  }

  drawBorder(x, y) {
    this.ctx.strokeRect(
      x * this.map.tileWidth,
      y * this.map.tileHeight,
      this.map.tileWidth,
      this.map.tileHeight
    );
  }

  numberTile(x, y, tile) {
    if (!this.map.showNumbers) {
      return;
    }
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = COLORS.BLACK;
    this.ctx.fillText(
      tile,
      x * this.map.tileWidth + _.floor(this.map.tileWidth / 2),
      y * this.map.tileHeight + _.floor(this.map.tileHeight / 2),
      this.map.tileWidth
    );
  }
}
