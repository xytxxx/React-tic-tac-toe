import React, { Component } from "react";
import ReactDom from 'react-dom';
import pic1 from './cinnamon_sticks.svg';
import pic_1 from './donut.svg';
import pic0 from './white.svg';
import _ from 'lodash'
import { isWin, aiPlace, copyBoard} from "./gameLogic";




const noPadding = {
    padding: 0,
    margin: "auto",
};

var id = 0;
//returns a unique id
function getId() {
    id++;
    return id;
}

class NavBar extends Component {
    getMessage() {
        
        if (this.props.data.playerSide === 0) {
            return "Choose your side!"
        } else if (this.props.data.isWin === this.props.data.playerSide) {
            return "You Win!!"
        } else if (this.props.data.isWin === -1 * this.props.data.playerSide) {
            return "AI Win!!"
        } else if (this.props.data.isWin === 0) {
            return "Draw!!"
        } else if (this.props.data.currentTurn !== this.props.data.playerSide) {
            return "AI's turn.";
        } else {
            return "Your turn."
        }
    }

    render() {
        return (
            <div className="row top-bar" id="topBar" >
                <div className="col-6">
                    <span> { this.getMessage() }</span>
                </div>
                <div className="col-6">
                    <button className="btn btn-primary" onClick={this.props.reset}> Reset </button>
                </div>
            </div>
        );
    }
}   

class Game extends Component {
    renderRow(r){
        var cells = [];
        for (var c = 0; c < 3; c++) {
            cells.push(this.renderCell(r, c));
        }
        return (<div className="row" key={getId()}> {cells} </div>)
    }
    renderCell(r, c) {
        var imgSrc = ''
        if (this.props.data.board[r][c] === 1) {
            imgSrc= pic1;
        } else if (this.props.data.board[r][c] === -1) {
            imgSrc= pic_1;
        } else {
            imgSrc= pic0;
        }
        return (
            <div className = 'col-4 border' style={noPadding} key={getId()} onClick={()=>{this.tryPlace(r, c)}}>
                {imgSrc !== '' && <img className="image-fluid" src={imgSrc} alt="food"></img>}
            </div>
        )
    }
    // try to place a piece
    tryPlace(r, c){
        
        if (this.props.data.isWin !== 2 || this.props.data.board[r][c] !== 0) {
            console.log('invalid click')
            return;  
        } else {
            this.props.placePiece(r, c);
        }
    }

    render() {
        var board = [];
        for (var r = 0; r < 3; r++) {
            board.push (this.renderRow(r));
        }
        return (<div className="col-12 col-lg-6 col-md-8 col-sm-10" style={noPadding}> {board}</div>)
    }
}
class ChooseSide extends Component {
    constructor(props) {
        super(props);
        this.chooseNegOne= this.chooseNegOne.bind(this) 
        this.chooseOne= this.chooseOne.bind(this) 
    }

    chooseOne(){
        this.props.choose(1) 
    }
    chooseNegOne(){
        this.props.choose(-1)
    }

    render() {
        return (
            <div className="col-12 col-lg-6 col-md-8 col-sm-10 row" style={noPadding}>
                <div className="col-6" onClick={this.chooseOne}>
                    <img className="image-fluid" src={pic1} alt="food1"></img>
                </div>
                <div className="col-6" onClick={this.chooseNegOne}>
                    <img className="image-fluid" src={pic_1} alt="food-1"></img>
                </div>
            </div>
        )
    }
}

//template for updating state
var newGame = {
    board: [[0,0,0],[0,0,0],[0,0,0]],  //1 = cinnamon sticks, -1 = donut
    currentTurn: 1,
    playerSide: 0,
    isWin: 2
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            board: [[0,0,0],[0,0,0],[0,0,0]],  //1 = cinnamon sticks, -1 = donut
            currentTurn: 1,
            playerSide: 0,
            isWin: 2
        };
        this.resetGame = this.resetGame.bind(this);
        this.playerChoose = this.playerChoose.bind(this);
        this.placePiece = this.placePiece.bind(this);
        this.aiTurn = this.aiTurn.bind(this)
    }

    resetGame() {
        this.setState(newGame)
    }
    playerChoose(i) {
        let gameStart = _.cloneDeep(newGame);
        gameStart.playerSide = i;
        this.setState(prev=>(gameStart),
        ()=>{
            if (this.state.currentTurn !== this.state.playerSide) {
                this.aiTurn();
            }
        }
        );
        
    }
    aiTurn() {
        console.log ('ai moving')
        for (let r of this.state.board) {
            console.log(r);
        }
        let move = aiPlace(copyBoard(this.state.board), this.state.playerSide);
        this.placePiece(move[0],move[1]);
    }
    // aiTurn() {
    //     console.log("this turn is "+this.state.currentTurn)
    //     let e = findEmptyCells(this.state.board);
    //     this.placePiece(e[0][0], e[0][1])
    // }

    placePiece(r,c){
        
        let newTurn = -this.state.currentTurn;
        console.log('placing at' + r.toString() + ' and ' + c +', newTurn ' + newTurn)
        let newBoard = copyBoard(this.state.board);
        newBoard[r][c] = -newTurn;
        let w = isWin(newBoard);
        this.setState(prevState=>({
            ...prevState,
            currentTurn: newTurn,
            board: newBoard,
            isWin: w
        }), ()=>{
            if (this.state.isWin === 2 && (this.state.currentTurn !== this.state.playerSide)) {
                this.aiTurn();
            }
        });
    }

    renderMain(){
        if (this.state.playerSide===0) {
            return (<ChooseSide choose={this.playerChoose}></ChooseSide>)
        } else {
            return (<Game data={this.state} placePiece={this.placePiece}></Game>)
        }
    }
    render () {
        return (
            <div className="container">
                <NavBar data={this.state} reset={this.resetGame}></NavBar>
                {this.renderMain()}
            </div>
        )
    }
}

ReactDom.render(<App/>, document.getElementById("root"));