import React, { Component } from "react";
import ReactDom from 'react-dom';
import pic1 from './cinnamon_sticks.svg';
import pic_1 from './donut.svg';
import pic0 from './white.svg';

var rowStyle ={
    height: '10vh',
    textAlign: 'center'
}

const noPadding = {
    padding: 0,
    margin: "auto",
};

var id = 0;

function getId() {
    id++;
    return id;
}

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state={message: props.message};
    }

    render() {
        return (
            <div className="row" style={rowStyle} id="topBar" >
                <div className="col-6">
                    <span> { this.props.message }</span>
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
            <div className = 'col-4 border' style={noPadding} key={getId()}>
                {imgSrc !== '' && <img className="image-fluid" src={imgSrc} alt="food"></img>}
            </div>
        )
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
    
}


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "Choose your side!",
            gameData: {
                board: [[1,0,1],[1,1,1],[1,1,1]],  //1 = cinnamon sticks, -1 = donut
                playerTurn: false,
                playerSide: 0, //not started yet
            }
        };
        this.resetGame = this.resetGame.bind(this);
    }
    resetGame() {
        this.setState({
            gameData:{
                board: [[0,0,0],[0,0,0],[0,0,0]],  //1 = cinnamon sticks, -1 = donut
                playerTurn: false,
                playerSide: 0,
            }
        })
    }

    render () {
        return (
            <div className="container">
                <NavBar message={this.state.message} reset={this.resetGame}></NavBar>
                
                <Game data={this.state.gameData}></Game>
            </div>
        )
    }
}

ReactDom.render(<App/>, document.getElementById("root"));