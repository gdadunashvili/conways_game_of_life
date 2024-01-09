class DrawingApp {

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private click_x: number[] = [];
  private click_y: number[] = [];
 
  private n_cells_1D: number = 90;

  private cell_width: number ;
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

    this.draw_grid();

    this.init_state((i,_)=>{if(i==0){return true;}else{return false;}});

    const i =  Math.round(this.n_cells_1D/2);
    const j =  Math.round(this.n_cells_1D/2);

    this.create_glider(i, j);

    this.cell_width = this.canvas.width / this.n_cells_1D;
    this.create_user_events();
    
    setInterval(()=>{this.run();}, 50);

  }

  private draw_grid() {
    this.context.strokeStyle = 'black';
    this.context.lineWidth = 1;
    for (let i = 0; i <= this.n_cells_1D; i++) {
      const x = i * this.cell_width;
      const y = i * this.cell_width;
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.canvas.height);
      this.context.moveTo(0, y);
      this.context.lineTo(this.canvas.width, y);
      this.context.stroke();
    }
  }

  private init_state(callback: (i: number, j: number)=>boolean){

    this.state = [];
    this.next_state = [];
    let pixel_state: boolean;
    for (let i = 0; i < this.n_cells_1D; ++i) {
        this.state[i] = [];
        this.next_state[i] = [];
        for (let j = 0; j < this.n_cells_1D; ++j) {
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
    let n: number = this.n_cells_1D;

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
    let n: number = this.n_cells_1D;
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
    this.state[lower_left_i+1][lower_left_j] = true;
    this.state[lower_left_i+2][lower_left_j] = true;
    this.state[lower_left_i+2][lower_left_j-1] = true;
    this.state[lower_left_i+1][lower_left_j-2] = true;
  }

  private random_int(min: number, max: number) {
      const randomInRange = Math.floor(Math.random() * (max - min + 1)) + min;
      return randomInRange;
  }


  private turn_on_state(x: number, y: number) {
    let i = Math.floor(x / this.canvas.width * this.n_cells_1D);
    let j = Math.floor(y / this.canvas.height * this.n_cells_1D)-1;
    this.state[i][j] = true;
  }

  private draw_pixel(i: number, j: number) {
    const ctx = this.context;
    ctx.fillRect(i * this.cell_width, j * this.cell_width, this.cell_width, this.cell_width);
    if (this.state[i][j]) { ctx.fillStyle = 'darkred'; }
    else { ctx.fillStyle = 'darkkhaki'; }
  }

  private draw_state() {
    for (let i = 0; i < this.n_cells_1D; ++i) {
        for(let j = 0; j < this.n_cells_1D; ++j) {
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

    canvas.addEventListener("mousedown", this.pressEventHandler);
    canvas.addEventListener("touchstart", this.pressEventHandler);

    document.addEventListener("keydown", (e) => {if (e.key === "Escape") this.pause_handeler();});
    document.getElementById('clear').addEventListener("click", this.clear_event_handler.bind(this));
    document.getElementById('rand').addEventListener("click", this.random_canvas.bind(this));
    document.getElementById('pause').addEventListener("click", this.pause_handeler.bind(this));
    document.getElementById('record').addEventListener("click", this.record_handler.bind(this));

  }

  private redraw() {
    let clickX = this.click_x;
    let clickY = this.click_y;
    for (let i = 0; i < clickX.length; ++i) {
      this.turn_on_state(clickX[i], clickY[i]);
    }
    this.click_x = [];
    this.click_y = [];
  }

  private add_click(x: number, y: number) {
    this.click_x.push(x);
    this.click_y.push(y);
}

private clear_state() {
  for (let i = 0; i < this.n_cells_1D; ++i) {
      for(let j = 0; j < this.n_cells_1D; ++j) {
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

private pressEventHandler = (e: MouseEvent | TouchEvent) => {
    let mouseX = (e as TouchEvent).changedTouches ?
                 (e as TouchEvent).changedTouches[0].pageX :
                 (e as MouseEvent).pageX;
    let mouseY = (e as TouchEvent).changedTouches ?
                 (e as TouchEvent).changedTouches[0].pageY :
                 (e as MouseEvent).pageY;
    mouseX -= this.canvas.offsetLeft;
    mouseY -= this.canvas.offsetTop;

    this.add_click(mouseX, mouseY);
    this.redraw();
}

private run(){
  this.draw_state();
  if(this.exit_condition){ return; }
  this.update_state();
}

}

new DrawingApp();
