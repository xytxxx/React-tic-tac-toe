import React, { Component } from "react";
import ReactDom from 'react-dom';

var rowStyle ={
    height: '10vh',
    textAlign: 'center'
}

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.setState({message: props.message})
        this.resetGame = this.resetGame.bind(this);
    }

    resetGame() {
    }

    render() {
        return (
            <div className="row" style={rowStyle} id="topBar" >
                <div className="col-6">
                    <span> { this.props.message }</span>
                </div>
                <div className="col-6">
                    <button className="btn btn-primary" onClick={this.resetGame}> Reset </button>
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
        return (<div className="row">
            {cells}
        </div>)
       
    }

    renderCell(r, c) {
        var imgSrc = ''
        if (this.props.data.board[r][c] === 1) {
            imgSrc= 'cinamon_sticks.svg';
            
        } else if (this.props.data.board[r][c] === -1) {
            imgSrc= 'donut.svg';
        }

        return (
            <div className = 'col-4'>
                {imgSrc !== '' && <img className="image-fluid" src={imgSrc} alt="food"></img>}
            </div>
        )
    }

    render() {
        var board = [];
        for (var r = 0; r < 3; r++) {
            board.push (this.renderRow(r));
        }
        return (
            board
        )
    }
}


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "Choose your side!",
            gameData: {
                board: [[1,1,1],[1,1,1],[1,1,1]],  //1 = cinnamon sticks, -1 = donut
                playerTurn: false,
                playerSide: 1,
            }
        };
    }

    render () {
        return (
            <div className="container">
                <NavBar message={this.state.message}></NavBar>
                <Game data={this.state.gameData}></Game>
            </div>
        )
    }
}

ReactDom.render(<App />, document.getElementById("root"));