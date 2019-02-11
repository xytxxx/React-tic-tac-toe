var _ = require('lodash')

/**
 * returns 1 if 1 win, -1 if -1 win, 0 if draw, 2 if not finished
 * @param {*} board 
 */
export function isWin (board) {
    var sum0 = 0;
    var sum1 = 0;
    var draw = true;
    //check columns first
    for (let c = 0; c < 3; c++) {
        sum0 = 0;
        for (let r = 0; r < 3; r++) {
            sum0 += board[r][c];
            // if found 0, not draw
            if (draw && board[r][c] === 0 ) {
                draw = false;
            }
        }
        if (sum0 === 3) return 1;
        if (sum0 === -3) return -1;
    }
    //then rows
    for (let r = 0; r < 3; r++) {
        sum0 = _.sum(board[r]);
        if (sum0 === 3) return 1;
        if (sum0 === -3) return -1;
    }
    //then diagonal
    sum0 = 0;
    for (let d = 0; d < 3; d++) {
        sum0 += board[d][d];
        sum1 += board[2-d][2-d]
    }
    if (sum0 === 3) return 1;
    if (sum0 === -3) return -1;
    if (sum1 === 3) return 1;
    if (sum1 === -3) return -1;

    if (draw) return 0;

    return 2; //not down
}


export function copyBoard(board){
    return board.map(function(row) {
        return row.slice();
    });
}

function findEmptyCells(board) {
    let emptyCells = [];
    for(let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[r][c] === 0) emptyCells.push([r,c]);
        }
    }
    return emptyCells;
}


/**
 * returns all possible boards from one piece form current board
 * @param {*} board 
 * @param {*} currentSide 
 */
function findNeighbours(board, currentSide) {
    let emptyCells = findEmptyCells(board);
    let ret = [];
    for (let pair of emptyCells) {
        let neighbour = copyBoard(board);
        neighbour[pair[0]][pair[1]] =currentSide;
        ret.push({move: pair, board: neighbour})
    }
    return ret;
}

//returns critical spots(2 missing 1)
function findCriticalSpots(board) {
    let ret =  {
        "1": [],
        "-1": []
    }
    let emptyCells = findEmptyCells(board);
    for (let pair of emptyCells) {
        let sumR = _.sum(board[pair[0]]);
        let sumC = _.sum(board.map(row=>row[pair[1]]));
        if (sumR === 2) ret["1"].push(pair);
        if (sumR === -2) ret["-1"].push(pair);
        if (sumC === 2) ret["1"].push(pair);
        if (sumC === -2) ret["-1"].push(pair);
        //check diagonal
        if (pair[0]===pair[1]){
            let sum = 0;
            for (let d = 0; d < 3; d++) {
                sum+=board[d][d]; 
            }
            if (sum === 2) ret["1"].push(pair);
            if (sum === -2) ret["-1"].push(pair);
        } else if ( (pair[0]===0 && pair[1]===2) || (pair[0]===2 && pair[1]===0)) {
            let sum = 0;
            for (let d = 0; d < 3; d++) {
                sum+=board[2-d][2-d]; 
            }
            if (sum === 2) ret["1"].push(pair);
            if (sum === -2) ret["-1"].push(pair);
        }
    }
    let pairToLiteral = (pair) => {return pair[0].toString()+pair[1].toString()}
    ret["1"] = _.uniqBy(ret["1"], pairToLiteral);
    ret["-1"] = _.uniqBy(ret["-1"], pairToLiteral);
    return ret;
}

// for each board on my turn, these are possible situations:
// I already win/lose
// I can certainly win
// I must block enemy
// I certainly lose
// there is one place that ensures at least a draw

// returns {the best 'worst outcome', [r, c]}

function findMoveMyTurn(board, mySide){
    let otherSide = -1*mySide;
    let win = isWin(board);

    if (win === mySide) {
        return {outcome: 1, move:[]};
    }
    if (win === -1*mySide) {
        return {outcome: -1, move:[]};
    }
    if (win === 0) {
        return {outcome: 0, move:[]};
    }
    // shortcuts  -- do not make stupid move if there are 2 in a row
    // let critical = findCriticalSpots(copyBoard(board));
    // if (critical[mySide.toString()].length > 0){
    //     return {outcome: 1, move:critical[mySide.toString()][0]};
    // } else if (critical[otherSide.toString()].length > 1) {
    //     return {outcome: -1, move:critical[otherSide.toString()][0]};
    // } else if (critical[otherSide.toString()].length > 0) { 
    //     // we have to block enemy. does not know what's next
    //     let nextBoard =copyBoard(board);
    //     let move = critical[otherSide.toString()][0];
    //     nextBoard[move[0]][move[1]] = mySide;
    //     let theirBestMove = findMoveMyTurn(nextBoard, -1*mySide);
    //     return {outcome: -1 * theirBestMove.outcome, move: move};
    // }

    let neighbours = findNeighbours(copyBoard(board), mySide);
    let theirBestMoves = []
    for (let next of neighbours) {
        theirBestMoves.push({move: next.move, result: findMoveMyTurn(next.board, -1*mySide)});
    }
    theirBestMoves.sort((a, b)=>{
        if (a.result.outcome===b.result.outcome) return 0;
        if (a.result.outcome > b.result.outcome) return 1;
        return -1;
    })

    return {outcome: -1*theirBestMoves[0].result.outcome, move:theirBestMoves[0].move}

}   

/**
 * @param {*} board 
 * @param {*} playerSide 
 * @returns {(r, c)} 
 */
export function aiPlace (board, playerSide){
    return findMoveMyTurn(board, -1*playerSide).move;
}

// console.log(aiPlace([[1,1,0],
//                      [-1,-1,0],
//                      [1,-1,0]], -1));
                     
// console.log(aiPlace([[0,0,0],
//                     [0,0,0],
//                     [0,0,0]], 1));
// var turn = 1;
// var lastMove = aiPlace([[0,0,0],
//                         [0,0,0],
//                         [0,0,0]], turn);
// var board = [[0,0,0],
//             [0,0,0],
//             [0,0,0]]

// while (lastMove.length > 0) {
//     for (let r of board) {
//         console.log(r)
//     }
//         console.log("========")
//     board[lastMove[0]][lastMove[1]] = turn;
//     turn = -1*turn;
//     lastMove = aiPlace(board, turn);
// }

