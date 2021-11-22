// TODO
// Randomize start pos as a trait
// Randomize boundary condition as a trait
// Randomize speeds, steer factors etc
// Sort HTML/CSS to make it better




// FXHASH vars
console.log(fxhash)   // the 64 chars hex number fed to your algorithm
console.log(fxrand()) // deterministic PRNG function, use it instead of Math.random()

// Features

// Fade mode (done)
var fade_mode = 'fast'
var fade = 96 + fxrand()*3;
if (fxrand()>0.3){
  fade = 99.99
  fade_mode = 'slow'
}

// Init mode (done)
var init_pattern = 'center'
if (fxrand()>0.4){init_pattern = 'ring'}
if (fxrand()>0.7){init_pattern = 'random'}

// Wall mode (done)
var wall_mode = 'fountain';
if (fxrand()>0.2){wall_mode = 'bounce'}
if (fxrand()>0.7){wall_mode = 'wrap'}
if (fxrand()>0.95){wall_mode = 'box'}

// BLUR
var blur = Math.floor(fxrand()*4)

// Double population
double_pop = false;
if (fxrand() < 0.1){
  double_pop = true
}

// Additional attributes
function randomRGBA() {
  h = 120 + fxrand()*240
  s = 0.3+fxrand()*0.7
  l = 0.1+fxrand()*0.3

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;  
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  let mx = 220/Math.max(r, g, b)
  if (blur < 2){
    mx = 150/Math.max(r, g, b)
  }
  r *= mx
  g *= mx
  b  *= mx
  


  return [r/255, g/255, b/255, 0.3+fxrand()*0.7]
}
var color = randomRGBA();
console.log('Color', color);

var random_steer_factor = 0.01 + 0.05*(fxrand()) 
var constant_steer_factor = 0.1 + fxrand()-0.5 
var speed_factor = 0.01*fxrand();
var min_speed =  0.003*fxrand();
var max_size = 2 + 10*fxrand();
var sense_radius = 0.05
var n_points = 100 + Math.floor(fxrand()*1000);

// Manually avoid some things
if (max_size>5){
  color[3] = Math.min(color[3], 0.5)
}
if ((blur>1) & (max_size > 5)){
  color[3] = Math.min(color[3], 0.5)
  max_size *= 0.5;
}


//----------------------
// defining features
//----------------------
// You can define some token features by populating the $fxhashFeatures property
// of the window object.
// More about it in the guide, section features:
// [https://fxhash.xyz/articles/guide-mint-generative-token#features]
//
window.$fxhashFeatures = {
  "Fade mode":fade_mode,
  "Init pattern": init_pattern,
  "Wall mode": wall_mode,
  "Blur":blur,
  "Double population":double_pop,
}
console.log(window.$fxhashFeatures)





// Drawing Canvas
var canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 400;
var ctx = canvas.getContext('2d'); // The drawing context
var canvasImageData = ctx.getImageData(0, 0, 400, 400);

// Rendering Canvas render_canvas
var render_canvas = document.getElementById('render_canvas')
var render_ctx = render_canvas.getContext('2d');


// Handle resize
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
window.addEventListener('resize', () => {
  console.log('Updating sizes')
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  console.log('sizes', sizes);
  // We want to resize the underlying image thingee
  render_ctx.canvas.width  = window.innerWidth;
  render_ctx.canvas.height = window.innerHeight;
  render_ctx.fillStyle =  'rgba(0, 1, 0, 1)'
  render_ctx.fillRect(0, 0, sizes.width, sizes.height)
})
window.dispatchEvent(new Event('resize')); // Trigger event once to start

// Wait for doubleclick
window.addEventListener('dblclick', () => {
  if(!document.fullscreenElement){
    render_canvas.requestFullscreen()
    console.log('Go Fullscreen')
  }
  else{
    console.log('Leave fullscreen')
    document.exitFullscreen() 
  }
})

// Wait for click (pause/unpause)
var pause = 0
var fps_avg = 60
window.addEventListener('click', (e) => {
  console.log('click', e)
  if(pause==0){
    pause=1
    console.log('FPS', Math.floor(fps_avg))
    console.log('Paused')
  }
  else{
    pause=0
    console.log('Resumed')
  }
})


// Setup for things to draw
var points = Array.from({length: n_points}, (x, i) => {
  const p = {
    'x': 0.5,
    'y': 0.5,
    'speed':fxrand()*speed_factor + min_speed,
    'direction':(fxrand())*2*Math.PI,
    'size':fxrand()*max_size,
    'sense_radius':sense_radius,
    'sense_angle':0.2, // << Tweak?
    'color':color,
    'constant_steer_factor':constant_steer_factor,
    'random_steer_factor':random_steer_factor,

  }
  // Init pattern
  if (init_pattern == 'center'){
    p['x'] = fxrand()*0.1 + 0.45;
    p['y'] = fxrand()*0.1 + 0.45;
  }
  else if (init_pattern == 'ring'){
    let angle = fxrand()*2*Math.PI;
    let radius = 0.3;
    p['x'] = Math.sin(angle)*radius + 0.5;
    p['y'] = Math.cos(angle)*radius + 0.5;
  }
  else if (init_pattern == 'random'){
    p['x'] = (fxrand()-0.5)*0.9 + 0.5;
    p['y'] = (fxrand()-0.5)*0.9 + 0.5;
  }
  return p
});

// ************ Second population ******************* //
if (double_pop == true){
  var color = randomRGBA();
  var random_steer_factor = 0.01 + 0.05*(fxrand()) 
  var constant_steer_factor = 0.1 + fxrand()-0.5 
  var speed_factor = 0.01*fxrand();
  var min_speed =  0.003*fxrand();
  var max_size = 2 + 10*fxrand();
  var sense_radius = 0.05
  var n_points = 100 + Math.floor(fxrand()*1000);
  var points2 = Array.from({length: n_points}, (x, i) => {
    const p = {
      'x': 0.5,
      'y': 0.5,
      'speed':fxrand()*speed_factor + min_speed,
      'direction':(fxrand())*2*Math.PI,
      'size':fxrand()*max_size,
      'sense_radius':sense_radius,
      'sense_angle':0.2, // << Tweak?
      'color':color,
      'constant_steer_factor':constant_steer_factor,
      'random_steer_factor':random_steer_factor,

    }
    // Init pattern
    if (init_pattern == 'center'){
      p['x'] = fxrand()*0.1 + 0.45;
      p['y'] = fxrand()*0.1 + 0.45;
    }
    else if (init_pattern == 'ring'){
      let angle = fxrand()*2*Math.PI;
      let radius = 0.3;
      p['x'] = Math.sin(angle)*radius + 0.5;
      p['y'] = Math.cos(angle)*radius + 0.5;
    }
    else if (init_pattern == 'random'){
      p['x'] = (fxrand()-0.5)*0.9 + 0.5;
      p['y'] = (fxrand()-0.5)*0.9 + 0.5;
    }
    return p
  });
  points = points.concat(points2);
}


// Update points (speed, dir etc)
const update_points = () => {

  // points
  points.map(function (p){
    let x = p['x']*canvas.width;
    let y = p['y']*canvas.height;

    // Sense forward
    var forward_red_index = (p['y'] + p['sense_radius'] * Math.sin(p['direction']))*canvas.height  * (canvas.width * 4) +  // forward_y  * (canvas.width * 4) + 
                    (p['x'] + p['sense_radius'] * Math.cos(p['direction']))*canvas.width * 4 // forward_x * 4
    let sense_forward = canvasImageData.data[Math.floor(forward_red_index)] // << Looking just at red channel, feel free to change
    // Sense left
    var left_red_index = (p['y'] + p['sense_radius'] * Math.sin(p['direction']+p['sense_angle']))*canvas.height  * (canvas.width * 4) +  
                    (p['x'] + p['sense_radius'] * Math.cos(p['direction']+p['sense_angle']))*canvas.width * 4 
    let sense_left = canvasImageData.data[Math.floor(left_red_index)]
    // Sense right
    var right_red_index = (p['y'] + p['sense_radius'] * Math.sin(p['direction']-p['sense_angle']))*canvas.height  * (canvas.width * 4) + 
                    (p['x'] + p['sense_radius'] * Math.cos(p['direction']-p['sense_angle']))*canvas.width * 4 
    let sense_right = canvasImageData.data[Math.floor(right_red_index)] // << Looking just at red channel, feel free to change
    // console.log('sf', sense_forward)
    // console.log('fri', Math.floor(forward_red_index))

    // Steering logic
    let random_steer_amout = p['random_steer_factor'] * (fxrand()-0.5);
    let steeramount = p['constant_steer_factor'] + random_steer_amout
    if (sense_forward > sense_left && sense_forward > sense_right){ // Straight ahead
      p['direction'] += 0.0;
    }
    else if (sense_forward < sense_left && sense_forward < sense_right){ // random << TODO better random
      p['direction'] += random_steer_amout
    }
    else if (sense_right > sense_left){p['direction'] -= steeramount;} // Turn Right
    else if (sense_right < sense_left){p['direction'] += steeramount;} // Turn Left



    p['x'] += p['speed'] * Math.cos(p['direction'])
    p['y'] += p['speed'] * Math.sin(p['direction'])
    // TODO bounce rules etc

    

    // CIRCLE FOUNTAIN
    if (wall_mode == 'fountain'){
      if ((p['x']-0.5)**2 + (p['y']-0.5)**2 > 0.45**2){
        p['x'] = 0.5
        p['y'] = 0.5
      }
    }
    else if (wall_mode == 'wrap'){
      if ((p['x']-0.5)**2 + (p['y']-0.5)**2 > 0.45**2){
        var phi = Math.atan2((p['y']-0.5), (p['x']-0.5));
        p['x'] = 0.5 + -Math.cos(phi)*0.44
        p['y'] = 0.5 + -Math.sin(phi)*0.44
      }
    }
    else if (wall_mode == 'box'){
      if (p['x']>0.9){p['x'] = 0.1}
      if (p['x']<0.1){p['x'] = 0.9}
      if (p['y']>0.9){p['y'] = 0.1}
      if (p['y']<0.1){p['y'] = 0.9}
    }
    else{
      if ((p['x']-0.5)**2 + (p['y']-0.5)**2 > 0.45**2){
        var phi = Math.atan2((p['y']-0.5), (p['x']-0.5));
        p['direction'] = Math.PI + 2*phi - p['direction'];
        p['x'] = 0.5 + Math.cos(phi)*0.44
        p['y'] = 0.5 + Math.sin(phi)*0.44
      }
    }
  })
}

// Drawing an individual point
const draw_point = (p) => {
  let x = p['x']*canvas.width;
  let y = p['y']*canvas.height;
  let radius = p['size']
  let color = p['color']
  // TODO colour in various ways
  ctx.fillStyle = 'rgba('+Math.floor(color[0]*255)+', '+Math.floor(color[1]*255)+', '+Math.floor(color[2]*255)+', '+Math.floor(color[3]*255)+')'; // << Alpha changes a lot
  ctx.fillRect(x, y, radius, radius);
}

// Drawing all points
const draw = () => {
  // ctx.clearRect(0, 0, w, h); // Clear
  // Points
  points.map(function (p){
    draw_point(p)
  })
}

// Applying a blur and darken to the canvas as a whole (simulates diffusion)
const post_process = () => {
  ctx.filter = 'blur(' + blur + 'px) brightness('+fade+'%)'; // << Brightness changes a lot
  ctx.drawImage(canvas, 0, 0)
  ctx.filter = "none"
}

// Animate
var lastLoop = new Date();
const tick = () => {
  if (pause == 0){
    post_process() // Process the canvas
    canvasImageData = ctx.getImageData(0, 0, 400, 400); // Update canvasImageData
    update_points(); // Calculate new positions (uses canvasImageData)
    draw(); // Draw the points

    // Draw (square) the drawing canvas to the main render canvas
    if (sizes.width < sizes.height){
      render_ctx.drawImage(canvas, 0, sizes.height/2 - sizes.width/2, sizes.width, sizes.width);
    }
    else{
      render_ctx.drawImage(canvas, sizes.width/2 - sizes.height/2, 0, sizes.height, sizes.height);
    }
  }
  

  // Keep track of fps
  var thisLoop = new Date();
  var fps = 1000 / (thisLoop - lastLoop);
  fps_avg = 0.99*fps_avg + 0.01*fps
  lastLoop = thisLoop;

  // Tick so this repeats forever
  window.requestAnimationFrame(tick) 

}

tick()



