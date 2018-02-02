const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const start = document.getElementById('start');
const reset = document.getElementById('reset');

const BLOCK = 40;

const WIDTH = 10;
const HEIGHT = 20;

const MAP_WIDTH = canvas.width = WIDTH * 1.5 * BLOCK;
const MAP_HEIGHT = canvas.height = HEIGHT * BLOCK;

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_P = 80;
const KEY_ESC = 27;
const KEY_ENTER = 13;

var Map = createMatrix(HEIGHT, WIDTH);
const Shapes = ['T', 'J', 'L', 'O', 'S', 'Z', 'I'];

const Colors = [
    "purple",
    "blue",
    "orange",
    "yellow",
    "lightgreen",
    "red",
    "cyan"
];

//KEYBOARD FUNCTIONS
keys = [];

function addKeys(e) {
    keys = [];
    keys[e.keyCode] = true;
    if(!Game.isPaused) {
        Shape.update();
    }
    if (keys[KEY_P] || keys[KEY_ESC]) {
        Game.start();
    }
    if(keys[KEY_ENTER] && Game.isDead) {
        $('.died').fadeOut(300)
        Game.reset();
        Game.start();
    }
}

//EVENTS LISTENERS
window.addEventListener('keydown', addKeys);

function createMatrix(height, width) {
    var matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0))
    }
    return matrix;
}

function checkCollision(Map, Shape) {
    for (y = 0; y < Shape.type.length; ++y) {
        for (x = 0; x < Shape.type[y].length; ++x) {
            if (Shape.type[y][x] !== 0 &&
                (Map[y + Shape.y] &&
                    Map[y + Shape.y][x + Shape.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

var Shape = {
    x: 0,
    y: 0,
    type: null,
    nextType: null,
    update: function () {
        if (keys[KEY_LEFT]) {
            this.x--;
            if (checkCollision(Map, this)) {
                this.x++;
            }
            keys = [];
        }
        if (keys[KEY_RIGHT]) {
            this.x++;
            if (checkCollision(Map, this)) {
                this.x--;
            }
            keys = [];
        }
        if (keys[KEY_DOWN]) {
            if (!checkCollision(Map, this)) {
                this.drop();
            }
            keys = [];
        }
        if (keys[KEY_UP]) {
            if (!checkCollision(Map, this)) {
                this.rotate();
            }
            keys = [];
        }
        Game.draw();
    },
    drop: function () {
        this.y += 1;
        if (checkCollision(Map, this)) {
            this.y -= 1;
            Game.merge();
            this.init();
        }
    },
    rotate: function () {
        this.type = this.type.reverse();
        this.type.map(function (Row, i) {
            for (j = 0; j < i; j++) {
                var temp = this.type[i][j];
                this.type[i][j] = this.type[j][i];
                this.type[j][i] = temp;
            }
        }, this)
        while (checkCollision(Map, this)) {
            if (this.x + this.type[0].length > Map[0].length) {
                this.x--;
            } else {
                this.x++;
            }
        }
    },
    init: function () {
        this.y = 0;
        if (!this.nextType) {
            var rand = Math.floor((Math.random() * Shapes.length - 1) + 1);
            this.type = this.createShape(Shapes[rand]);
            var newRand = Math.floor((Math.random() * Shapes.length - 1) + 1);
            this.nextType = this.createShape(Shapes[newRand]);
        } else {
            this.type = this.nextType;
            rand = Math.floor((Math.random() * Shapes.length - 1) + 1);
            this.nextType = this.createShape(Shapes[rand]);
        }
        this.x = WIDTH / 2 - 2;
        if (checkCollision(Map, this)) {
            Game.pause();
            Game.isDead = true;
            $('.died').css('display','flex').fadeIn(300);
        }
    },
    createShape: function (type) {
        if (type === 'T') {
            return [
                [1, 1, 1],
                [0, 1, 0],
                [0, 0, 0]
            ]
        } else if (type === 'I') {
            return [
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0]
            ]
        } else if (type === 'Z') {
            return [
                [3, 3, 0],
                [0, 3, 3],
                [0, 0, 0]
            ]
        } else if (type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0]
            ]
        } else if (type === 'O') {
            return [
                [5, 5],
                [5, 5]
            ]
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ]
        } else if (type === 'L') {
            return [
                [7, 0, 0],
                [7, 0, 0],
                [7, 7, 0]
            ]
        }
    }
}

var animationFrame;

var Game = {
    score: 0,
    level: 0,
    speed: 0,
    isPaused: true,
    isDead: false,
    init: function () {
        this.isDead = false;
        this.draw();
        this.speed = 1100;
        this.score = 0;
        this.level = 0;
        Shape.init();
    },
    start: function () {
        if (this.isPaused) {
            animationFrame = setInterval(this.update, this.speed);
            $('.menu').fadeOut(300);
            this.isPaused = false;
        } else {
            this.pause();
            $('.menu').css('display', 'flex').hide().fadeIn(300);
        }
    },
    reset: function () {
        clearInterval(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Map = createMatrix(HEIGHT, WIDTH);
        this.init();
        Shape.type = null;
        Shape.nextType = null;
        this.draw();
        this.updateScore();
        Shape.init();
    },
    updateScore: function () {
        var speed = this.speed;
        this.speed = 1100 - this.level * 100;
        if (speed !== this.speed) {
            clearInterval(animationFrame);
            animationFrame = setInterval(this.update, this.speed);
        }
    },
    update: function () {
        Shape.drop();
        Game.lineCheck();
        Game.draw();
    },
    merge: function () {
        Shape.type.map(function (Row, y) {
            Row.map(function (value, x) {
                if (value !== 0) {
                    Map[y + Shape.y][x + Shape.x] = value;
                }
            })
        })
    },
    lineCheck: function () {
        for (var y = Map.length - 1; y > 0; y--) {
            var zero = false;
            for (var x = 0; y > x; x++) {
                if (Map[y][x] === 0) {
                    zero = true;
                }
            }
            if (!zero) {
                var array = new Array(Map[y].length).fill(0);
                var deleted = Map.splice(y, 1)
                Map.unshift(array);
                this.score += 100;
                if(this.level<10) {
                    this.level++;
                }
                this.updateScore();
            }
        }
    },
    draw: function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        Map.map(function (Row, y) {
            Row.map(function (value, x) {
                if (value !== 0) {
                    ctx.fillStyle = Colors[value - 1];
                    ctx.fillRect(x * BLOCK + 3, y * BLOCK - 3, BLOCK - 3, BLOCK - 3);
                } else {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(x * BLOCK + 3, y * BLOCK - 3, BLOCK - 3, BLOCK - 3);
                }
            })
        })

        if (Shape.type) {
            Shape.type.map(function (Row, y) {
                Row.map(function (value, x) {
                    if (value !== 0) {
                        ctx.fillStyle = Colors[value - 1];
                        ctx.fillRect((Shape.x + x) * BLOCK + 3, (Shape.y + y) * BLOCK - 3, BLOCK - 3, BLOCK - 3);
                    }
                })
            })
        }

        //NEXT PIECE BLOCK
        ctx.fillStyle = 'black';
        ctx.fillRect(10 * BLOCK + 6, 0, BLOCK * 5 - 6, BLOCK * 6 - 6);
        //SCORE BLOCK
        ctx.fillStyle = 'black';
        ctx.fillRect(10 * BLOCK + 6, BLOCK * 6 - 3, BLOCK * 5 - 6, BLOCK * 3 - 6);
        //LEVEL BLOCK
        ctx.fillStyle = 'black';
        ctx.fillRect(10 * BLOCK + 6, BLOCK * 9 - 6, BLOCK * 5 - 6, BLOCK * 3 - 6);

        if (Shape.nextType) {
            Shape.nextType.map(function (Row, y) {
                Row.map(function (value, x) {
                    if (value !== 0) {
                        ctx.fillStyle = Colors[value - 1];
                        ctx.fillRect((11 * BLOCK) + x * BLOCK + 3, BLOCK + y * BLOCK - 3, BLOCK - 3, BLOCK - 3);
                    }
                })
            })
        }
        //NEXT PIECE TEXT
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = "30px Arial";
        ctx.fillText("NEXT PIECE", 12 * BLOCK + 22, BLOCK * 5 + BLOCK / 2 + 8);
        //SCORE TEXT
        ctx.font = "50px Arial";
        ctx.fillText(this.score, 12 * BLOCK + 22, BLOCK * 7 + BLOCK / 2 + 6);
        ctx.font = "30px Arial";
        ctx.fillText("SCORE", 12 * BLOCK + 22, BLOCK * 8 + BLOCK / 2 + 6);
        //LEVEL TEXT
        ctx.font = "50px Arial";
        ctx.fillText(this.level, 12 * BLOCK + 22, BLOCK * 10 + BLOCK / 2 + 4);
        ctx.font = "30px Arial";
        ctx.fillText("LEVEL", 12 * BLOCK + 22, BLOCK * 11 + BLOCK / 2 + 4);
    },
    pause: function () {
        clearInterval(animationFrame);
        this.isPaused = true;
    }
};

start.addEventListener('click', function () {
    Game.start();
});
reset.addEventListener('click', function () {
    Game.reset();
});

Game.init();