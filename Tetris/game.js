"use strict";

var EMPTY = null;

var UP    = 0;
var RIGHT = 1;
var DOWN  = 2;
var LEFT  = 3;
var game;
var frameTime;
var downPressed = false;
var lastLateralDirectionPressed = null;
var lateralTimestamp = -10;
var fillRect = fillRectangle; // lazy
var LINEPIECE = {
    color : 'cyan',
    extent: [ { x: 0, y: 1 },
              { x: 0, y: 0 },
              { x: 0, y: -1 },
              { x: 0, y: -2 } ]
};

var TPIECE = {
    color : 'purple',
    extent: [ { x: 0, y: 0 },
             { x: 0, y: 1 },
             { x: 0, y: -1 },
             { x: 1, y: 0 } ]
};

var L1 = {
    color : 'orange',
    extent: [ { x: 0, y: 0},
              { x: -1, y: 1},
              { x: 0, y: 1},
              { x: 0, y: -1} ]

};

var L2 = {
    color : 'blue',
    extent: [ { x: 0, y: 0},
              { x: 1, y: 1},
              { x: 0, y: 1},
              { x: 0, y: -1} ]
};

var SQUARE = {
    color : 'yellow',
    extent: [ { x: 0, y: 0},
              { x: 1, y: 0},
              { x: 0, y: 1},
              { x: 1, y: 1} ]
};

var STAIR1 = {
    color : 'green',
    extent: [ { x: 0, y: 0},
              { x: 1, y: 0},
              { x: 1, y: 1},
              { x: 0, y: -1} ]
};

var STAIR2 = {
    color : 'red',
    extent: [ { x: 0, y: 0},
              { x: -1, y: 0},
              { x: -1, y: 1},
              { x: 0, y: -1} ]
};

var PIECES = [ LINEPIECE, TPIECE, L1, L2, SQUARE, STAIR1, STAIR2 ];

function randomPiece() { 
    var model = PIECES[Math.floor(Math.random() * 7)];
    return new Piece(model);
}

function drawSquare(origin, place, width, height, color) {
    fillRectangle(origin.x + place.x * width, origin.y - place.y * height, width, height, color);
    strokeRectangle(origin.x + place.x * width, origin.y - place.y * height, width, height, 'black', 1);
};

// The constructor starts a game 
function Game() {
    this.board = new Board();
    this.board.initializeBoard();
    this.piece = randomPiece();
    this.score = 0;
    this.level = 0;
    this.lines = 0;
    this.gameOver = false;
};


Game.prototype.endPieceMove = function() {
    this.board.addPieceToBoard(this.piece);
    if (! this.board.gameOver) {
        this.piece = randomPiece();
        this.checkForAndApplyLineClears();
    } 
};

Game.prototype.simulate = function() {
    if (lastLateralDirectionPressed !== null && currentTime() - lateralTimestamp > .33) {
        this.piece.move(lastLateralDirectionPressed);
    }
    if (downPressed || frameTime % (10 - this.level) === 0) {
        if (! this.piece.move(DOWN)) {
            this.endPieceMove();
        }
    }
};

Game.prototype.checkForAndApplyLineClears = function() {
    var clears = this.board.clearFullLines();
    this.lines += clears;
    // Based on Tetris for NES/Gameboy/Super NES scoring
    this.score += (this.level + 1) * [0, 40, 100, 300, 1200][clears];
    this.level = Math.min(10,  Math.floor(this.lines / 10));
};


Game.prototype.draw = function() {
    var blockSize = screenWidth / 40;
    var origin = { x: screenWidth /  8, y: screenHeight * 7 / 8};

    // Draw background color
    fillRectangle(origin.x - blockSize, origin.y - blockSize * this.board.height(), 
            blockSize * (this.board.width() + 2), blockSize * (this.board.height() + 2), 'white');
    this.piece.draw(origin, blockSize, blockSize);
    this.board.draw(origin, blockSize, blockSize);

    //Draw 'frame'
    for (var i = -1; i <= this.board.width(); ++i) {
        drawSquare(origin, { x: i, y: this.board.height() }, blockSize, blockSize, 'brown');
        drawSquare(origin, { x: i, y: -1 }, blockSize, blockSize, 'borwn');
    }

    for (var i = 0; i < this.board.height(); ++i) {
        drawSquare(origin, { x: -1, y: i }, blockSize, blockSize, 'brown');
        drawSquare(origin, { x: this.board.width(), y: i }, blockSize, blockSize, 'brown');
    }

    fillText("Score: " + this.score, 2 * screenWidth / 3, 3 * screenHeight / 8, 'white', '40px sans-serif');
    fillText("Lines: " + this.lines, 2 * screenWidth / 3, screenHeight / 2, 'white', '40px sans-serif');
    fillText("Level: " + this.level, 2 * screenWidth / 3, 5 * screenHeight / 8, 'white', '40px sans-serif');
    if (this.board.gameOver) {
        fillRectangle(origin.x - blockSize, origin.y - blockSize * this.board.height(), 
                blockSize * (this.board.width() + 2), blockSize * 5, 'grey');
        fillText("GAME OVER", origin.x + blockSize, origin.y - blockSize * (this.board.height() - 2), 'black', '60px sans-serif');
    }
};

// The game board. It is 10x20 by default, based on historical tetris boards
function Board() {
    this.grid = [];
    this.gameOver = false
};

Board.prototype.initializeBoard = function() {
    // Fill the board with empty rows
    for (var i = 0; i < this.height(); ++i) {
        this.grid.push(this.emptyRow());
    }
};

Board.prototype.emptyRow = function() {
    var newRow = [];
    for (var i = 0; i < this.width(); ++i) {
        newRow.push(EMPTY);
    }
    return newRow;
};

Board.prototype.height = function() {
    return 20;
};

Board.prototype.width = function() { return 10; }

Board.prototype.clearFullLines = function() {
    var lines = 0;

    for (var i = this.height() - 1; i >= 0; --i) {
        var full = true;
        for (var j = 0; j < this.width(); ++j) {
            if (! this.filledAt( { x: j, y: i} )) {
                full = false;
                break;
            }
        }
        if (full) {
            lines += 1;
            this.grid.splice(i, 1);
            this.grid.push(this.emptyRow());
        }
    }
    return lines;
};

Board.prototype.addPieceToBoard = function(piece) {
    var squares = piece.getLocations();
    for (var i = 0; i < squares.length; ++i) {
        if (this.filledAt(squares[i])) {
            this.gameOver = true;
            return;
        }
    }
    for (var i = 0; i < squares.length; ++i) {
        this.grid[squares[i].y][squares[i].x] = piece.color;
    }
};

Board.prototype.intersectsWithPiece = function(piece, origin, rotation) {
    var squares = piece.getLocations(origin, rotation);
    for (var i = 0; i < squares.length; ++i) {
        if (this.filledAt(squares[i])) {
            return true;
        }
    }
    return false;
};

Board.prototype.filledAt = function(loc) {
    return (loc.x < 0 || loc.x >= this.width()) || (loc.y < 0 || loc.y >= this.height()) || (this.grid[loc.y][loc.x] !== EMPTY);
};

Board.prototype.draw = function(origin, blockWidth, blockHeight) {
    for (var i = 0; i < this.height(); ++i) {
        for (var j = 0; j < this.width(); ++j) {
            if (this.grid[i][j] !== EMPTY) {
                drawSquare(origin, {x: j, y: i}, blockWidth, blockHeight, this.grid[i][j]);
            }
        }
    }
};

function Piece(base) {
    this.extent = base.extent;
    this.color  = base.color;
    this.origin   = { x: 4, y: 19};
    this.rotation = RIGHT;
};

Piece.prototype.move = function(dir) {
  
  var target;
  switch(dir) {
    case DOWN:
        target = { x: this.origin.x, y: this.origin.y - 1 };
        break;
    case RIGHT:
        target = { x: this.origin.x + 1, y: this.origin.y };
        break;
    case LEFT:
        target = { x: this.origin.x - 1, y: this.origin.y };
        break;
    default:
        console.error("BAD DIRECTION %s", dir);
  }

  var ret = ! game.board.intersectsWithPiece(this, target, this.rotation);
  if (ret) { this.origin = target; }
  return ret;
};

Piece.prototype.rotateRight = function() {
    this.rotate((this.rotation + 1) % 4);
};

Piece.prototype.rotateLeft = function() {
    this.rotate((this.rotation + 3) % 4);
};

Piece.prototype.rotate = function(rotation) {
    if (! game.board.intersectsWithPiece(this, this.origin, rotation)) {
       this.rotation = rotation;
    } 
};

Piece.prototype.getLocations = function(origin, rotation) {
    origin = origin || this.origin;
    rotation = (rotation === undefined ? this.rotation : rotation);
    
    var ret = [];
    var extent = applyRotation(this.extent, rotation);
    for (var i = 0; i < extent.length; ++i) {
        ret.push({x: origin.x + extent[i].x, y: origin.y + extent[i].y });
    }
    return ret;
};

Piece.prototype.draw = function(origin, boxWidth, boxHeight) {
    var squares = this.getLocations();
    var color = this.color;
    squares.forEach(function(square) {
        drawSquare(origin, square, boxWidth, boxHeight, color);
    });
}

function applyRotation(extent, rotation) {
    var ret = [];
    for (var i = 0; i < extent.length; ++i) {
        switch(rotation) {
        case UP:
            ret.push(extent[i]);
            break;
        case RIGHT:
            ret.push({x: extent[i].y, y: -extent[i].x });
            break;
        case DOWN:
            ret.push({x: -extent[i].x, y: -extent[i].y });
            break;
        case LEFT:
            ret.push({x: -extent[i].y, y: extent[i].x });
            break;
        }
     }
       
    return ret;
}

function onSetup() {
    frameTime = 0;
    game = new Game();
}


// When a key is pushed
function onKeyStart(key) {
    
    switch(key) {
    case 37: // LEFT_ARROW
        game.piece.move(LEFT);
        lastLateralDirectionPressed = LEFT;
        lateralTimestamp = currentTime();
        break;
    case 39: // RIGHT_ARROW
        game.piece.move(RIGHT);
        lastLateralDirectionPressed = RIGHT;
        lateralTimestamp = currentTime();
        break;
    case 40: // DOWN_ARROW
        downPressed = true;
        break;
    case 32: // Spacebar
        // drop piece
        break;
    case 90: // Z
        game.piece.rotateLeft();
        break;
    case 88: // X
        game.piece.rotateRight();
        break;
    }
}

function onKeyEnd(key) {
    if (key == 40) { downPressed = false; }
    if ({ 37: LEFT, 39: RIGHT}[key] === lastLateralDirectionPressed) {
        lastLateralDirectionPressed = null;
    }
}


function onTick() {
    
    clearRectangle(0, 0, screenWidth, screenHeight);
    game.draw();
    if (! game.board.gameOver) {
        game.draw();
        game.simulate();
        frameTime++;
        frameTime %= 100;
    }
}

