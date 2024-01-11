class DrawingApp {

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private click_x: number[] = [];
  private click_y: number[] = [];
 
  private exit_condition: boolean = true;
  private recording: boolean = false;

  private state: boolean[][];
  private next_state: boolean[][];

  private chunks: Blob[];
  private stream: MediaStream;
  private rec: MediaRecorder;

  constructor() {

    console.log('bla');
    let canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.context = canvas.getContext("2d");
    this.canvas = canvas;

    this.chunks = []; 
    this.stream = this.canvas.captureStream(); 
    this.rec = new MediaRecorder(this.stream);

    this.rec.ondataavailable = e => this.chunks.push(e.data);
    this.rec.onstop = () => this.export_vid(new Blob(this.chunks, {type: 'video/webm'}));

    this.initial_state();

    this.create_user_events();
    
    setInterval(()=>{this.run();}, 50);

  }

  private initial_state(){
    this.draw_grid();

    const n = this.n_cells_1D();
    const n_third = Math.round(n/3);
    this.init_state((_,j)=>{if(j==n_third){return true;}else{return false;}});

    const n_half = Math.round(n/2);

    this.create_glider(n_half, n_half);
  }

  private draw_grid() {
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 1;
    for (let i = 0; i <= this.n_cells_1D(); i++) {
      const x = i * this.cell_width();
      const y = i * this.cell_width();
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.canvas.height);
      this.context.moveTo(0, y);
      this.context.lineTo(this.canvas.width, y);
      this.context.stroke();
    }
  }

  private slider_changed:boolean = false;
  private slider_event_handler(){
    console.log("slider changed");
    this.slider_changed = true;
    let persumptive_width = document.getElementById('system_width')['value'];
    let text: string =""
    if(persumptive_width!=this.n_cells_1D_cached){
      text = `<I>${persumptive_width}</I>`;
    }else{
      text = `${persumptive_width}`;
    }

    document.getElementById('system_width_value').innerHTML = text;

  }
  private n_cells_1D_cached: number=document.getElementById('system_width')['value'];

  private n_cells_1D(): number {
    return this.n_cells_1D_cached;
  }
  private cell_width(): number{ return this.canvas.width / this.n_cells_1D(); } 

  private init_state(callback: (i: number, j: number)=>boolean){
    console.log(this.n_cells_1D);

    this.state = [];
    this.next_state = [];
    let pixel_state: boolean;
    for (let i = 0; i < this.n_cells_1D(); ++i) {
        this.state[i] = [];
        this.next_state[i] = [];
        for (let j = 0; j < this.n_cells_1D(); ++j) {
          pixel_state = callback(i,j);
          this.state[i][j] = pixel_state;
          this.next_state[i][j] = pixel_state; 
        }
    }
  }

  private random_canvas(){
    this.clear_state();
    this.init_state((_,__)=>this.random_int(0, 1) == 1);
  }

  private toggle_recording() {

    if(this.recording){
      this.rec.start();
    }else{
      this.rec.stop();
    }
  }

  private viodeoExists=false;
  private export_vid(blob: Blob) {
    let vid:HTMLVideoElement;
    if(this.viodeoExists){
      vid = document.getElementById("video") as HTMLVideoElement;
    }else{
      vid = document.createElement('video');
      this.viodeoExists = true;
      vid.id = "video";
    }

    const type:  string = blob.type;
    const ext: string = type.split('/')[1];

    vid.src = URL.createObjectURL(blob);
    vid.controls = true;
    document.body.appendChild(vid);
    const a = document.createElement('a');
    a.download = `myvid.${ext}`;
    a.href = vid.src;
    a.textContent = 'download the video';
    document.body.appendChild(a);
  }

  private wrap(i: number, n: number) {
    if (i < 0) {
        return n - 1;
    } else if (i >= n) {
        return 0;
    }
    return i;
  }

  private count_neighbours(i: number, j: number) {
    let state: boolean[][] = this.state;
    let n: number = this.n_cells_1D();

    let neighbours: number = 0;

    for (let x = -1; x <= 1; ++x) {
        for (let y = -1; y <= 1; ++y) {
            if (x == 0 && y == 0) { continue; }

            let i2 =this.wrap((i + x), n);
            let j2 =this.wrap((j + y), n);

            if (state[i2][j2]) { neighbours += 1; }
        }
    }

    return neighbours;
  }

  private update_state() {
    let n: number = this.n_cells_1D();
    let neighbours: number;
    
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        neighbours = this.count_neighbours(i, j);

        if (neighbours == 3) { this.next_state[i][j] = true; continue;}
        if (neighbours < 2 || neighbours > 3) { this.next_state[i][j] = false; continue;}
        this.next_state[i][j] = this.state[i][j];
        
      }
    }

    [this.state, this.next_state] = [this.next_state, this.state];
    
  }

  private create_glider(lower_left_i: number, lower_left_j: number) {
    this.state[lower_left_i][lower_left_j] = true;
    this.state[lower_left_i][lower_left_j+1] = true;
    this.state[lower_left_i][lower_left_j+2] = true;
    this.state[lower_left_i+1][lower_left_j+2] = true;
    this.state[lower_left_i+2][lower_left_j+1] = true;
  }

  private random_int(min: number, max: number) {
      const randomInRange = Math.floor(Math.random() * (max - min + 1)) + min;
      return randomInRange;
  }


  private toggle_state(x: number, y: number) {
    const n: number = this.n_cells_1D();
    const scale: number = n / this.canvas.width;
    const i = Math.floor(y*scale);
    const j = Math.floor(x*scale);
    console.log(i,j, x,y);
    const i2 = n-i-1;
    this.state[i2][j] = !this.state[i2][j];
  }

  private draw_pixel(i: number, j: number) {
    // console.log("drawing:",i,j);
    const ctx = this.context;
    const w: number = this.cell_width();
    const n: number = this.n_cells_1D();
    const i2 = n-i-1;
    ctx.fillRect((j-1) * w, i * w, w, w);
    if (this.state[i2][j]) { ctx.fillStyle = 'darkred'; }
    else { ctx.fillStyle = 'darkkhaki'; }
  }

  private draw_state() {
    for (let i = 0; i < this.n_cells_1D(); ++i) {
      for(let j = 0; j < this.n_cells_1D()+1; ++j) {
        this.draw_pixel(i, j);
      }
    }
    this.draw_grid();
  }

  private record_handler(){
    this.recording = !this.recording;
    this.toggle_recording();
    document.getElementById('record').innerHTML = !this.recording ? "Start Recording" : "Stop Recording";
  }

  private pause_handeler(){
    this.exit_condition = !this.exit_condition;
    document.getElementById('pause').innerHTML = this.exit_condition ? "Resume" : "Pause";
  }

  private create_user_events() {
    let canvas = this.canvas;

    canvas.addEventListener('mouseenter', () => {
      console.log("enter");
      canvas.classList.add('crosshair-cursor');
    });

    canvas.addEventListener('mouseleave', () => {
      console.log("leave");
      canvas.classList.remove('crosshair-cursor');
    });

    canvas.addEventListener("mousedown", this.press_event_handler);
    canvas.addEventListener("mouseup", () => {this.is_dragging = false;});
    canvas.addEventListener("mousemove", this.drag_event_handler);
    canvas.addEventListener("touchstart", this.press_event_handler);


    document.addEventListener("keydown", (e) => {if (e.key === "Escape") this.pause_handeler();});
    document.addEventListener("keydown", (e) => {if (e.key === " ") this.pause_handeler();});
    document.getElementById('clear').addEventListener("click", this.clear_event_handler.bind(this));
    document.getElementById('reinitiate').addEventListener("click", this.reinitiate_event_handler.bind(this));
    document.getElementById('rand').addEventListener("click", this.random_canvas.bind(this));
    document.getElementById('pause').addEventListener("click", this.pause_handeler.bind(this));
    document.getElementById('record').addEventListener("click", this.record_handler.bind(this));
    document.getElementById('system_width').addEventListener("change", this.slider_event_handler.bind(this));
  }

  private redraw() {
    let clickX = this.click_x;
    let clickY = this.click_y;
    for (let i = 0; i < clickX.length; ++i) {
      this.toggle_state(clickX[i], clickY[i]);
    }
    this.click_x = [];
    this.click_y = [];
  }

  private add_click(x: number, y: number) {
    this.click_x.push(x);
    this.click_y.push(y);
}

private clear_state() {
  for (let i = 0; i < this.n_cells_1D(); ++i) {
      for(let j = 0; j < this.n_cells_1D(); ++j) {
        this.state[i][j] = false;
        this.next_state[i][j] = false;
      }
  }
  this.draw_state();
  this.draw_grid();
}

private clear_event_handler(){
    this.clear_state();
    this.click_x = [];
    this.click_y = [];
}

private reinitiate_event_handler(){
  
  this.exit_condition = true;
  document.getElementById('pause').innerHTML = this.exit_condition ? "Resume" : "Pause";

  if(this.slider_changed){
    this.n_cells_1D_cached = document.getElementById('system_width')['value']; 
    this.slider_changed = false;
  }

  this.initial_state();
  this.clear_event_handler();
  this.initial_state();
  this.slider_event_handler();
}

private is_dragging: boolean = false;

private press_event_handler = (e: MouseEvent | TouchEvent) => {
    let mouseX = (e as TouchEvent).changedTouches ?
                 (e as TouchEvent).changedTouches[0].pageX :
                 (e as MouseEvent).pageX;
    let mouseY = (e as TouchEvent).changedTouches ?
                 (e as TouchEvent).changedTouches[0].pageY :
                 (e as MouseEvent).pageY;
    mouseX -= this.canvas.offsetLeft;
    mouseY -= this.canvas.offsetTop;

    this.add_click(mouseX, mouseY);
    this.is_dragging = true;
    this.redraw();
}

private drag_event_handler = (e: MouseEvent | TouchEvent) => {
  if(this.is_dragging){
    this.press_event_handler(e);
  }
}

private run(){
  this.draw_state();
  if(this.exit_condition){ return; }
  this.update_state();
}

}

new DrawingApp();
