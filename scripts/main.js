var DrawingApp = /** @class */ (function () {
    function DrawingApp() {
        var _this = this;
        this.click_x = [];
        this.click_y = [];
        this.n_cells_1D = 40;
        this.exit_condition = true;
        this.recording = false;
        this.viodeoExists = false;
        this.pressEventHandler = function (e) {
            var mouseX = e.changedTouches ?
                e.changedTouches[0].pageX :
                e.pageX;
            var mouseY = e.changedTouches ?
                e.changedTouches[0].pageY :
                e.pageY;
            mouseX -= _this.canvas.offsetLeft;
            mouseY -= _this.canvas.offsetTop;
            _this.add_click(mouseX, mouseY);
            _this.redraw();
        };
        var canvas = document.getElementById('canvas');
        this.context = canvas.getContext("2d");
        this.canvas = canvas;
        this.chunks = [];
        this.stream = this.canvas.captureStream();
        this.rec = new MediaRecorder(this.stream);
        this.rec.ondataavailable = function (e) { return _this.chunks.push(e.data); };
        this.rec.onstop = function () { return _this.export_vid(new Blob(_this.chunks, { type: 'video/webm' })); };
        this.draw_grid();
        this.init_state(function (i, _) { if (i == 0) {
            return true;
        }
        else {
            return false;
        } });
        var i = Math.round(this.n_cells_1D / 2);
        var j = Math.round(this.n_cells_1D / 2);
        this.create_glider(i, j);
        this.cell_width = this.canvas.width / this.n_cells_1D;
        this.create_user_events();
        setInterval(function () { _this.run(); }, 100);
    }
    DrawingApp.prototype.draw_grid = function () {
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 1;
        for (var i = 0; i <= this.n_cells_1D; i++) {
            var x = i * this.cell_width;
            var y = i * this.cell_width;
            this.context.beginPath();
            this.context.moveTo(x, 0);
            this.context.lineTo(x, this.canvas.height);
            this.context.moveTo(0, y);
            this.context.lineTo(this.canvas.width, y);
            this.context.stroke();
        }
    };
    DrawingApp.prototype.init_state = function (callback) {
        this.state = [];
        this.next_state = [];
        var pixel_state;
        for (var i = 0; i < this.n_cells_1D; ++i) {
            this.state[i] = [];
            this.next_state[i] = [];
            for (var j = 0; j < this.n_cells_1D; ++j) {
                pixel_state = callback(i, j);
                this.state[i][j] = pixel_state;
                this.next_state[i][j] = pixel_state;
            }
        }
    };
    DrawingApp.prototype.random_canvas = function () {
        var _this = this;
        this.clear_state();
        this.init_state(function (_, __) { return _this.random_int(0, 1) == 1; });
    };
    DrawingApp.prototype.toggle_recording = function () {
        if (this.recording) {
            this.rec.start();
        }
        else {
            this.rec.stop();
        }
    };
    DrawingApp.prototype.export_vid = function (blob) {
        var vid;
        if (this.viodeoExists) {
            vid = document.getElementById("video");
        }
        else {
            vid = document.createElement('video');
            this.viodeoExists = true;
            vid.id = "video";
        }
        var type = blob.type;
        var ext = type.split('/')[1];
        vid.src = URL.createObjectURL(blob);
        vid.controls = true;
        document.body.appendChild(vid);
        var a = document.createElement('a');
        a.download = "myvid.".concat(ext);
        a.href = vid.src;
        a.textContent = 'download the video';
        document.body.appendChild(a);
    };
    DrawingApp.prototype.wrap = function (i, n) {
        if (i < 0) {
            return n - 1;
        }
        else if (i >= n) {
            return 0;
        }
        return i;
    };
    DrawingApp.prototype.count_neighbours = function (i, j) {
        var state = this.state;
        var n = this.n_cells_1D;
        var neighbours = 0;
        for (var x = -1; x <= 1; ++x) {
            for (var y = -1; y <= 1; ++y) {
                if (x == 0 && y == 0) {
                    continue;
                }
                var i2 = this.wrap((i + x), n);
                var j2 = this.wrap((j + y), n);
                if (state[i2][j2]) {
                    neighbours += 1;
                }
            }
        }
        return neighbours;
    };
    DrawingApp.prototype.update_state = function () {
        var _a;
        var n = this.n_cells_1D;
        var neighbours;
        for (var i = 0; i < n; ++i) {
            for (var j = 0; j < n; ++j) {
                neighbours = this.count_neighbours(i, j);
                if (neighbours == 3) {
                    this.next_state[i][j] = true;
                    continue;
                }
                if (neighbours < 2 || neighbours > 3) {
                    this.next_state[i][j] = false;
                    continue;
                }
                this.next_state[i][j] = this.state[i][j];
            }
        }
        _a = [this.next_state, this.state], this.state = _a[0], this.next_state = _a[1];
    };
    DrawingApp.prototype.create_glider = function (lower_left_i, lower_left_j) {
        this.state[lower_left_i][lower_left_j] = true;
        this.state[lower_left_i + 1][lower_left_j] = true;
        this.state[lower_left_i + 2][lower_left_j] = true;
        this.state[lower_left_i + 2][lower_left_j - 1] = true;
        this.state[lower_left_i + 1][lower_left_j - 2] = true;
    };
    DrawingApp.prototype.random_int = function (min, max) {
        var randomInRange = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomInRange;
    };
    DrawingApp.prototype.turn_on_state = function (x, y) {
        var i = Math.floor(x / this.canvas.width * this.n_cells_1D);
        var j = Math.floor(y / this.canvas.height * this.n_cells_1D) - 1;
        this.state[i][j] = true;
    };
    DrawingApp.prototype.draw_pixel = function (i, j) {
        var ctx = this.context;
        ctx.fillRect(i * this.cell_width, j * this.cell_width, this.cell_width, this.cell_width);
        if (this.state[i][j]) {
            ctx.fillStyle = 'darkred';
        }
        else {
            ctx.fillStyle = 'darkkhaki';
        }
    };
    DrawingApp.prototype.draw_state = function () {
        for (var i = 0; i < this.n_cells_1D; ++i) {
            for (var j = 0; j < this.n_cells_1D; ++j) {
                this.draw_pixel(i, j);
            }
        }
        this.draw_grid();
    };
    DrawingApp.prototype.record_handler = function () {
        this.recording = !this.recording;
        this.toggle_recording();
        document.getElementById('record').innerHTML = !this.recording ? "Start Recording" : "Stop Recording";
    };
    DrawingApp.prototype.pause_handeler = function () {
        this.exit_condition = !this.exit_condition;
        document.getElementById('pause').innerHTML = this.exit_condition ? "Resume" : "Pause";
    };
    DrawingApp.prototype.create_user_events = function () {
        var _this = this;
        var canvas = this.canvas;
        canvas.addEventListener('mouseenter', function () {
            console.log("enter");
            canvas.classList.add('crosshair-cursor');
        });
        canvas.addEventListener('mouseleave', function () {
            console.log("leave");
            canvas.classList.remove('crosshair-cursor');
        });
        canvas.addEventListener("mousedown", this.pressEventHandler);
        canvas.addEventListener("touchstart", this.pressEventHandler);
        document.addEventListener("keydown", function (e) { if (e.key === "Escape")
            _this.pause_handeler(); });
        document.getElementById('clear').addEventListener("click", this.clear_event_handler.bind(this));
        document.getElementById('rand').addEventListener("click", this.random_canvas.bind(this));
        document.getElementById('pause').addEventListener("click", this.pause_handeler.bind(this));
        document.getElementById('record').addEventListener("click", this.record_handler.bind(this));
    };
    DrawingApp.prototype.redraw = function () {
        var clickX = this.click_x;
        var clickY = this.click_y;
        for (var i = 0; i < clickX.length; ++i) {
            this.turn_on_state(clickX[i], clickY[i]);
        }
        this.click_x = [];
        this.click_y = [];
    };
    DrawingApp.prototype.add_click = function (x, y) {
        this.click_x.push(x);
        this.click_y.push(y);
    };
    DrawingApp.prototype.clear_state = function () {
        for (var i = 0; i < this.n_cells_1D; ++i) {
            for (var j = 0; j < this.n_cells_1D; ++j) {
                this.state[i][j] = false;
                this.next_state[i][j] = false;
            }
        }
        this.draw_state();
        this.draw_grid();
    };
    DrawingApp.prototype.clear_event_handler = function () {
        this.clear_state();
        this.click_x = [];
        this.click_y = [];
    };
    DrawingApp.prototype.run = function () {
        this.draw_state();
        if (this.exit_condition) {
            return;
        }
        this.update_state();
    };
    return DrawingApp;
}());
new DrawingApp();
//# sourceMappingURL=main.js.map