var canvas, context,
    rate, state, interval, flip,
    count = 0,
    traversal = false,
    running = true;
        
function ready() {
  canvas = document.getElementById('walk');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  context = canvas.getContext('2d');
  
  rate = 20;
  state = {
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
  };

  interval = setInterval(function() { update(); }, rate);
}

function update() {
  if (!running)
    return;
          
  if (traversal) {
    paint();
    return;
  }
  
  try {
    state.parent = JSON.parse(JSON.stringify(state));
    document.getElementById('callstack').innerHTML = 'call stack: <span red>' + count++ + '</span>';
  } catch (error) {
    // maximum call stack size reached, force traversal
    toggle();
    return;
  }

  flip = Math.round(Math.random() - state.direction.bias.x);
  state.direction.x = Math.pow(-1, flip);
          
  flip = Math.round(Math.random() - state.direction.bias.y);
  state.direction.y = Math.pow(-1, flip);

  state.position.x += state.step * state.direction.x;
  state.position.y += state.step * state.direction.y;

  // TODO:  move to separate function
  if (state.position.x < 0) {
    state.position.x = 0;
    state.direction.x *= -1;
  }

  if (state.position.x > canvas.width) {
    state.position.x = canvas.width - state.step;
  }

  if (state.position.y < 0) {
    state.position.y = 0;
  }

  if (state.position.y > canvas.height) {
    state.position.y = canvas.height - state.step;
  }

  paint();
}

function paint() {
  if (!traversal) {
    // walking about..
    context.lineWidth = state.size;
    context.strokeStyle = 'rgba(' + state.color.join(', ') + ')';
          
    context.beginPath();
    context.moveTo(state.parent.position.x, state.parent.position.y);
    context.lineTo(state.position.x, state.position.y);
    context.stroke();
    context.closePath();
  } else if (state.parent != null) {
    // traversing..
    context.lineWidth = state.parent.size;
    context.strokeStyle = 'rgba(' + state.color[0] + ', ' + state.color[1] + ', ' + state.color[2] + ', 1)';
    
    context.beginPath();
    context.moveTo(state.parent.position.x, state.parent.position.y);
    context.lineTo(state.position.x, state.position.y);
    context.stroke();
    context.closePath();
    
    state = state.parent;
            
    document.getElementById('callstack').innerHTML = 'call stack: <span red>' + count-- + '</span>';
  } else {
    toggle();
    clear();
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
  
  document.getElementById('traversal').innerHTML = traversal ? 'traversing...' : '';
}

function clear() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function reset() {
  if(traversal)
    toggle();
  
  count = 0;
  
  while(state.parent != null)
    state = state.parent;
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
      clear();
      break;
    case 84:
      // 't'
      toggle();
      break;
  }
};
