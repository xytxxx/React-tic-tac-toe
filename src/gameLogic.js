var _ = require('lodash')

/**
 * returns 1 if 1 win, -1 if -1 win, 0 if draw, 2 if not finished
 * @param {*} board 
 */
function isWin (board) {
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
        sum1 += board[2-d][d]
    }
    if (sum0 === 3) return 1;
    if (sum0 === -3) return -1;
    if (sum1 === 3) return 1;
    if (sum1 === -3) return -1;

    if (draw) return 0;

    return 2; //not down
}


function copyBoard(board){
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

let pairToLiteral = (pair) => {return pair[0].toString()+pair[1].toString()}
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
                sum+=board[2-d][d]; 
            }
            if (sum === 2) ret["1"].push(pair);
            if (sum === -2) ret["-1"].push(pair);
        }
    }
    
    ret["1"] = _.uniqBy(ret["1"], pairToLiteral);
    ret["-1"] = _.uniqBy(ret["-1"], pairToLiteral);
    return ret;
}


function updarteBestMove(m) {
    if (!m) {
        console.log('wrong')
    } else {
        bestMove = m;
    }
}
// for each board on my turn, these are possible situations:
// I already win/lose
// I can certainly win
// I must block enemy
// I certainly lose
// there is one place that ensures at least a draw
// returns {the best 'worst outcome', [r, c]}
var bestMove = []
function findMoveMinMax(curBoard, mySide, myTurn, depth){
    var board = copyBoard(curBoard)
    let curSide = mySide * (myTurn? 1 : -1);
    let win = isWin(board);

    if (win === mySide) {
        updarteBestMove([]);
        return 10 - depth;
    }
    if (win === -1*mySide) {
        updarteBestMove([]);
        return -10 + depth;
    }
    if (win === 0) {
        updarteBestMove([]);
        return 0;
    }
    
    
    let critical = findCriticalSpots(board);
    let curSideStr = curSide.toString();
    let otherSideStr = (-1 * curSide).toString()
    // shortcuts  -- do not make stupid move if there are 2 in a row
    if (critical[curSideStr].length > 0){
        updarteBestMove(critical[curSideStr][0]);
        return (10 - depth) * (myTurn? 1 : -1);
    } else if (critical[otherSideStr].length > 1) {
        updarteBestMove(critical[otherSideStr][0]);
        return (10 - depth) * (myTurn? -1 : 1);
    } else if (critical[otherSideStr].length > 0) { 
        // we have to block enemy. does not know what's next
        // updarteBestMove( critical[otherSideStr][0]);
        // board[bestMove[0]][bestMove[1]] = curSide;
        // return findMoveMinMax(board, mySide, !myTurn, depth+1);
    }

    //not short cuts, analysis all moves
    let neighbours = findNeighbours(board, curSide);
    neighbours.map((next)=>{ 
        next.score = findMoveMinMax(next.board, mySide, !myTurn, depth+1) 
        return next;
    })
    neighbours.sort((a, b)=>{
        if (a.score === b.score) {
            return 0;
        } else if (a.score > b.score) {
            return 1;
        } else {
            return -1;
        }
    })
 
    if (myTurn) {
        updarteBestMove(neighbours[neighbours.length - 1].move);
        return neighbours[neighbours.length - 1].score;
    } else {
        updarteBestMove( neighbours[0].move);
        return neighbours[0].score;
    }

}   

/**
 * @param {*} board 
 * @param {*} playerSide 
 * @returns {(r, c)} 
 */
function aiPlace (board, playerSide){
    findMoveMinMax(board, -playerSide, true, 0);
    return bestMove;
}

// console.log(aiPlace([[1,1,0],
//                      [-1,-1,0],
//                      [1,-1,0]], -1));
                     
// console.log(aiPlace([[0,0,0],
//                     [0,0,0],
//                     [0,0,0]], 1));


module.exports={
    aiPlace: aiPlace,
    isWin: isWin,
    copyBoard: copyBoard
}