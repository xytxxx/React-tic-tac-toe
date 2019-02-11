var  ai = require( './gameLogic');


var turn = 1;
var lastMove = ai.aiPlace([[0,0,0],
                        [0,0,0],
                        [0,0,0]], 1);
var board = [[0,0,0],
            [0,0,0],
            [0,0,0]]

while (lastMove.length > 0) {
    for (let r of board) {
        console.log(r)
    }
        console.log("========")
    board[lastMove[0]][lastMove[1]] = turn;
    turn = -1*turn;
    lastMove = ai.aiPlace(board, turn);
}