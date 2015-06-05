
var snake;
var obstacles;
var food;
var score;
var frameCounter;

var GRID_WIDTH = 30
var GRID_HEIGHT = 30
var GRID_UNIT_X = screenWidth / GRID_WIDTH
var GRID_UNIT_Y = screenHeight / GRID_HEIGHT

var NONE = -999;
var UP = 0;
var RIGHT = 1;
var DOWN = 2;
var LEFT = 3

var LEFT_ARROW = 37;
var UP_ARROW = 38;
var RIGHT_ARROW = 39;
var DOWN_ARROW = 40;

var PLAYING = 1
var GAME_OVER = 2
var gameState;
var determinedMotionForThisFrame = false
function onSetup() {
    score = 0
    snake = {
        positions: [{x: GRID_WIDTH / 2 | 0, y: GRID_HEIGHT / 2 | 0}],
        length: 5,
        speed: 3,
        direction: NONE
    }
    food = randomPos(),

    frameCounter = -1
    gameState = PLAYING
    //generateRandomObstacles();
}


// When a key is pushed
function onKeyStart(key) {
    if (gameState === GAME_OVER) {
        onSetup();
        return;
    }
    if (determinedMotionForThisFrame) { return; }
    determinedMotionForThisFrame = true
    var newdir;
    switch(key) {
        case LEFT_ARROW:
            newdir = LEFT;
            break;
        case RIGHT_ARROW:
            newdir = RIGHT;
            break;
        case UP_ARROW:
            newdir = UP;
            break;
        case DOWN_ARROW:
            newdir = DOWN;
            break;
        default:
            newdir = NONE;
    }
    if ((newdir === NONE) || (Math.abs(newdir - snake.direction) === 2)) {
        return;
    } else {
        snake.direction = newdir
    }
}
function randomPos() {
    var p = {x: 1 + Math.floor(Math.random() * (GRID_WIDTH - 2)), y: 1 + Math.floor(Math.random() * (GRID_HEIGHT - 2))}
    if (shallowContains(snake.positions, p)) {
        p = randomPos();
    }
    return p;
}
function advanceSnake() {
    var head = snake.positions[snake.positions.length - 1];
    determinedMotionForThisFrame = false
    switch(snake.direction) {
        case LEFT:
            snake.positions.push({x: head.x - 1, y: head.y})
            break;
        case RIGHT:
            snake.positions.push({x: head.x + 1, y: head.y})
            break;
        case UP:
            snake.positions.push({x: head.x, y: head.y - 1})
            break;
        case DOWN:
            snake.positions.push({x: head.x, y: head.y + 1})
            break;
        default:
            return;
    }
    if (snake.positions.length > snake.length) {
        snake.positions.shift()
    }
}

function drawStuff() {
    fillText("Score: " + score,
             screenWidth / 16,
             screenHeight / 16,
             makeColor(1, 1.0, 1.0, 1.0),
             "40px Times New Roman",
             "left",
             "middle");
    for (var i = 0; i < snake.positions.length; ++i) {
        var p = snake.positions[i]
        fillRectangle(p.x * GRID_UNIT_X, p.y * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, i == snake.positions.length - 1? 'purple' : 'red');
        strokeRectangle(p.x * GRID_UNIT_X, p.y * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, 'black', 2);
    }
    fillRectangle(food.x * GRID_UNIT_X, food.y * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, 'white');
    strokeRectangle(food.x * GRID_UNIT_X, food.y * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, 'black', 2);
    for (var i = 0; i < GRID_WIDTH; ++i) {
        fillRectangle(i * GRID_UNIT_X, 0, GRID_UNIT_X, GRID_UNIT_Y, 'yellow');
        fillRectangle(i * GRID_UNIT_X, (GRID_HEIGHT - 1) * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, 'yellow');
        strokeRectangle(i * GRID_UNIT_X, 0, GRID_UNIT_X, GRID_UNIT_Y, 'black', 2);
        strokeRectangle(i * GRID_UNIT_X, (GRID_HEIGHT - 1) * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, 'black', 2);
    }
    for (var i = 1; i < GRID_HEIGHT - 1; ++i) {
        fillRectangle(0, i * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, 'yellow');
        fillRectangle((GRID_WIDTH - 1) * GRID_UNIT_X, i * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, 'yellow');
        strokeRectangle(0, i * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, 'black', 2);
        strokeRectangle((GRID_WIDTH - 1) * GRID_UNIT_X, i * GRID_UNIT_Y, GRID_UNIT_X, GRID_UNIT_Y, 'black', 2);
    }

}

function shallowContains(arr, elem) {
    for (var i = 0; i < arr.length; ++i) {
        if (arr[i].x === elem.x && arr[i].y === elem.y) {
            return true;
        }
    }
    return false;
}
function checkForCollisions() {
    var head = snake.positions[snake.positions.length - 1];
    if (head.x === food.x && head.y === food.y) {
        food = randomPos()
        score += snake.length * 15
        snake.length++
    }
    return (head.x <= 0 || head.x >= GRID_WIDTH - 1 || head.y <= 0 || head.y >= GRID_WIDTH - 1 || shallowContains(snake.positions.slice(0, snake.positions.length - 1), head))
}
// Called 30 times or more per second
function onTick() {
    // Some sample drawing
    clearRectangle(0, 0, screenWidth, screenHeight);
    if (gameState === PLAYING) {
        frameCounter = (frameCounter + 1) % snake.speed;

        if (frameCounter === 0) {
            advanceSnake();
        }
        if (!checkForCollisions()) {
            drawStuff();
        } else {
            gameState = GAME_OVER
        }
    } else {
        fillText("You Lost",
                 screenWidth / 2,
                 screenHeight / 2,
                 makeColor(1, 1.0, 1.0, 1.0),
                 "300px Times New Roman",
                 "center",
                 "middle");
    }
}
