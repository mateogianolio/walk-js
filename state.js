var State = function(params) {
  this.direction = {x: 0, y: 0, bias: {x: 0, y: 0}};
  this.position = params.position || {x: 0, y: 0};
  this.bias = params.bias || {x: 0, y: 0};
  this.shape = params.shape || 'line';
  this.color = params.color || [0, 0, 0, 1];
  this.step = params.step || 8;
  this.size = params.size || 4;
  this.parent = null;
  
  this.scatter();
};

State.prototype.scatter = function() {
  this.direction.x = (Math.random() + this.bias.x) > .5 ? 1 : -1;
  this.direction.y = (Math.random() + this.bias.y) > .5 ? 1 : -1;
};

State.prototype.update = function(x, y, w, h) {
  if (this.position.x < x || this.position.x > w)
    this.direction.x *= -1;
  
  if (this.position.y < y || this.position.y > h)
    this.direction.y *= -1;
  
  this.move();
};

State.prototype.move = function() {
  this.position.x += this.direction.x * this.step;
  this.position.y += this.direction.y * this.step;
};
