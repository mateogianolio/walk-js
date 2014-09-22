var canvas, context,
    state, flip, interval, rate,
    count = 0,
    traversal = false,
    running = true;
        
function ready() {
  canvas = document.getElementById('walk');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
          
  context = canvas.getContext('2d');
          
  rate = 10;
          
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
    'past': null
  };
          
  interval = setInterval(function() { update(); }, rate);
}

function update() {
  if(!running)
    return;
          
  if(traversal) {
    paint();
    return;
  }
          
  try {
    state.past = JSON.parse(JSON.stringify(state));
    document.getElementById('callstack').innerHTML = 'call stack: <span red>' + count++ + '</span>';
  } catch (e) {
    // maximum call stack exceeded
    var inputs = document.getElementsByTagName('INPUT');
    for(i = 0; i < inputs.length; i++)
      inputs[i].disabled = true;
            
    document.getElementById('traversal').innerHTML = 'traversing...';
            
    traversal = true;
    return;
  }
          
  flip = Math.round(Math.random() - state.direction.bias.x);
  state.direction.x = Math.pow(-1, flip);
          
  flip = Math.round(Math.random() - state.direction.bias.y);
  state.direction.y = Math.pow(-1, flip);
          
  state.position.x += state.step * state.direction.x;
  state.position.y += state.step * state.direction.y;
          
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
          
  if (state.past != null)
    paint();
}

function paint() {
  if (!traversal) {
    context.lineWidth = state.size;
    context.strokeStyle = 'rgba(' + state.color.join(', ') + ')';
          
    context.beginPath();
    context.moveTo(state.past.position.x, state.past.position.y);
    context.lineTo(state.position.x, state.position.y);
    context.stroke();
    context.closePath();
  } else if (state.past == null) {
    var inputs = document.getElementsByTagName('input');
    for(i = 0; i < inputs.length; i++) {
      inputs[i].disabled = false;
      inputs[i].value = 0;
    }
              
    document.getElementById('traversal').innerHTML = '';
                
    traversal = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    return;
  } else {
    context.lineWidth = state.past.size;
    context.strokeStyle = 'rgba(' + state.color[0] + ', ' + state.color[1] + ', ' + state.color[2] + ', 1)';
    
    context.beginPath();
    context.moveTo(state.past.position.x, state.past.position.y);
    context.lineTo(state.position.x, state.position.y);
    context.stroke();
    context.closePath();
    
    state = state.past;
            
    document.getElementById('callstack').innerHTML = 'call stack: <span red>' + count-- + '</span>';
  }
}
  
window.onkeydown = function(event) {
  event = event || window.event;
          
  switch (event.keyCode) {
    case 32:
      running = !running;
      document.getElementById('space').innerHTML = '(press <b>space</b> to ' + (running ? '' : 'un') + 'pause)';
      break;
  }
};