var canvas, context, rate, interval,
    states = [], branches = 4,
    traversal = false, pause = false;

// helper method to set attributes in an array of objects
Array.prototype.set = function(attribute, value) {
  attribute = attribute.split('.');
  this.forEach(function(obj) {
    for (i = 0; i < attribute.length - 1; i++)
      obj = obj[attribute[i]];
    
    obj[attribute[i]] = value;
  });
};

function ready() {
  canvas = document.getElementById('walk');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  context = canvas.getContext('2d');
  
  branches = 4;
  for(i = 0; i < branches; i++)
    states.push(new State({
      position: {
        x: Math.round(canvas.width / 2),
        y: Math.round(canvas.height / 2)
      },
      color: [0, 0, 0, .1]
    }));
  
  rate = 10;
  interval = setInterval(function() { loop(); }, rate);
}

function loop() {
  if (pause)
    return;
  
  if (traversal) {
    paint();
    return;
  }

  states.forEach(function(state, index) {
    try {
      state.parent = JSON.parse(JSON.stringify(state));
    } catch (error) {
      // maximum call stack size reached, force traversal
      toggle();
      return;
    }
    
    state.scatter();
    state.update(0, 0, canvas.width, canvas.height);
  });
  
  paint();
}

function paint() {
  states.forEach(function(state, index) {
    if(state.parent == null) {
      reset();
      return;
    }
    
    switch (state.shape) {
    case 'line':
      context.strokeStyle = 'rgba(' + state.color.join(', ') + ')';
      context.lineWidth = state.size;

      context.beginPath();
      context.moveTo(state.parent.position.x, state.parent.position.y);
      context.lineTo(state.position.x, state.position.y);
      context.closePath();
      context.stroke();
      break;
    case 'square':
      context.fillStyle = 'rgba(' + state.color.join(', ') + ')';
      context.fillRect(state.position.x, state.position.y, 2 * state.size, 2 * state.size);
      break;
    }
    
    if(traversal)
      states[index] = state.parent;
  });
}

function toggle() {
  traversal = !traversal;
  
  // TODO:  currently the input fields are not updated to match
  //        the state at which the toggling took place
  document.getElementById('controls').reset();
  
  clear();
}

function clear() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function reset() {
  if (traversal)
    toggle();
  
  states = [];
  for(i = 0; i < branches; i++) {
    states.push(new State({
      position: {
        x: Math.round(canvas.width / 2),
        y: Math.round(canvas.height / 2)
      },
      color: [0, 0, 0, .1]
    }));
  }
  
  clear();
}
  
window.onkeydown = function(event) {
  event = event || window.event;
  switch (event.keyCode) {
    case 32:
      // space
      pause = !pause;
      break;
    case 82:
      // 'r'
      reset();
      break;
    case 84:
      // 't'
      if(traversal)
        reset();
      else
        toggle();
      break;
  }
};