var canvas, context,
    states, branches, rate, interval, flip,
    count = 0,
    traversal = false,
    running = true;
        
function ready() {
  canvas = document.getElementById('walk');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  context = canvas.getContext('2d');
  
  states = [];
  states.set = function(attribute, value) {
    attribute = attribute.split('.');
    this.forEach(function(obj) {
      for (i = 0; i < attribute.length - 1; i++)
        obj = obj[attribute[i]];

      obj[attribute[i]] = value;
    });
  };
  
  branches = 4;
  for(i = 0; i < branches; i++) {
    states.push({
      'position': {
        'x': Math.round(canvas.width / 2),
        'y': Math.round(canvas.height / 2),
      },
      'step': 8,
      'size': 2,
      'direction': {
        'x': 0,
        'y': 1,
        'bias': {
          'x': 0,
          'y': 0
        }
      },
      'color': [
        0,
        0,
        0,
        .1
      ],
      'parent': null
    });
  }
  
  rate = 20;

  interval = setInterval(function() { update(); }, rate);
}

function update() {
  if (!running)
    return;
          
  if (traversal) {
    paint();
    return;
  }

  states.forEach(function(state) {
    try {
      state.parent = JSON.parse(JSON.stringify(state));
    } catch (error) {
      // maximum call stack size reached, force traversal
      toggle();
      
      // hack to break out of foreach
      throw {};
    }
    
    flip = Math.round(Math.random() - state.direction.bias.x);
    state.direction.x = flip > .5 ? -1 : 1;

    flip = Math.round(Math.random() - state.direction.bias.y);
    state.direction.y = flip > .5 ? -1 : 1;

    state.position.x += state.step * state.direction.x;
    state.position.y += state.step * state.direction.y;

    // TODO:  move to separate function
    if (state.position != state.parent.position) {
      if (state.position.x < 0) {
        state.position.x = 0;
        state.direction.x *= -1;
      }

      if (state.position.x > canvas.width) {
        state.position.x = canvas.width - state.step;
        state.direction.x *= -1;
      }

      if (state.position.y < 0) {
        state.position.y = 0;
        state.direction.y *= -1;
      }

      if (state.position.y > canvas.height) {
        state.position.y = canvas.height - state.step;
        state.direction.y *= -1;
      }
    }
  });

  paint();
}

function paint() {
  switch(traversal) {
  case true:
    // traversing..
    states.forEach(function(state, index) {
      if(state.parent == null) {
        reset();
        return;
      }

      context.lineWidth = state.parent.size;
      context.strokeStyle = 'rgba(' + state.color[0] + ', ' + state.color[1] + ', ' + state.color[2] + ', 1)';

      context.beginPath();
      context.moveTo(state.parent.position.x, state.parent.position.y);
      context.lineTo(state.position.x, state.position.y);
      context.stroke();
      context.closePath();

      states[index] = state.parent;
    });
    
    document.getElementById('callstack').innerHTML = 'stack: <span data-red>' + count-- + '</span>';
    break;
  case false: 
    // walking about..
    states.forEach(function(state) {
      context.lineWidth = state.size;
      context.strokeStyle = 'rgba(' + state.color.join(', ') + ')';

      context.beginPath();
      context.moveTo(state.parent.position.x, state.parent.position.y);
      context.lineTo(state.position.x, state.position.y);
      context.stroke();
      context.closePath();
    });
    
    document.getElementById('callstack').innerHTML = 'stack: <span data-red>' + count++ + '</span>';
    break;
  }
}

function toggle() {
  traversal = !traversal;
  
  // TODO:  currently the input fields are not updated to match
  //        the state at which the toggling took place
  var inputs = document.getElementsByTagName('INPUT');
  var input;
  for(i = 0; i < inputs.length; i++) {
    input = inputs[i];
    input.value = 0;
    input.disabled = !input.disabled;
  }
}

function clear() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function reset() {
  if(traversal)
    toggle();
  
  count = 0;
  
  states.forEach(function(state) {
    while(state.parent != null)
      state = state.parent;
  });
  
  // TODO:  make State() interface and move to separate file
  //        instead of repeating code
  states = [];
  states.set = function(attribute, value) {
    attribute = attribute.split('.');
    this.forEach(function(obj) {
      for (i = 0; i < attribute.length - 1; i++)
        obj = obj[attribute[i]];

      obj[attribute[i]] = value;
    });
  };
  
  for(i = 0; i < branches; i++) {
    states.push({
      'position': {
        'x': Math.round(canvas.width / 2),
        'y': Math.round(canvas.height / 2),
      },
      'step': 8,
      'size': 2,
      'direction': {
        'x': 0,
        'y': 1,
        'bias': {
          'x': 0,
          'y': 0
        }
      },
      'color': [
        0,
        0,
        0,
        .1
      ],
      'parent': null
    });
  }
  
  clear();
}
  
window.onkeydown = function(event) {
  event = event || window.event;
          
  switch (event.keyCode) {
    case 32:
      // space
      running = !running;
      break;
    case 82:
      // 'r'
      reset();
      break;
    case 84:
      // 't'
      toggle();
      break;
  }
};