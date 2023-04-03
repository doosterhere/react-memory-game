import React from "react";

import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import "./App.css";
import config from "./config/config";
import Card from "./components/Card";

class App extends React.Component {
  bestResultKey = "bestResult";
  bestTimeKey = "bestTime";
  interval = undefined;

  constructor() {
    super();
    this.state = {
      cards: [],
      clicks: 0,
      isPopupOpened: false,
      resultText: "",
      timeText: "",
      time: 0,
      formedTimeString: "",
    };
  }

  componentDidMount() {
    this.startTheGame();
  }

  startTheGame() {
    this.setState({
      cards: this.prepareCards(),
      clicks: 0,
      isPopupOpened: false,
      resultText: "",
      timeText: "",
      time: 0,
      formedTimeString: "0 сек.",
    });
  }

  prepareCards() {
    let id = 1;
    return [...config.cards, ...config.cards]
      .sort(() => Math.random() - 0.5)
      .map((item) => ({ ...item, id: id++, isOpened: false, isCompleted: false }));
  }

  selectedCardHandler(openedItem) {
    if (!this.interval) {
      this.interval = setInterval(() => {
        this.setState({ time: this.state.time + 1, formedTimeString: this.formTimeString(this.state.time + 1) });
      }, 1000);
    }

    if (openedItem.isCompleted || this.state.cards.filter((item) => item.isOpened).length === 2) {
      return;
    }

    this.setState({ clicks: this.state.clicks + 1 });
    this.setState(
      {
        cards: this.state.cards.map((item) => {
          return item.id === openedItem.id ? { ...item, isOpened: true } : item;
        }),
      },
      () => {
        this.processSelectedCards();
      }
    );
  }

  processSelectedCards() {
    const openedCards = this.state.cards.filter((item) => item.isOpened);
    if (openedCards.length === 2 && openedCards[0].name === openedCards[1].name) {
      this.setState(
        {
          cards: this.state.cards.map((item) => {
            if (item.name === openedCards[0].name) {
              item.isCompleted = true;
            }

            item.isOpened = false;
            return item;
          }),
        },
        () => this.checkEndOfGameTerms()
      );
    }

    if (openedCards.length === 2 && openedCards[0].name !== openedCards[1].name) {
      setTimeout(() => {
        this.setState({
          cards: this.state.cards.map((item) => {
            item.isOpened = false;
            return item;
          }),
        });
      }, 1000);
    }
  }

  checkEndOfGameTerms() {
    if (this.state.cards.some((item) => !item.isCompleted)) {
      return;
    }

    this.openPopup();
  }

  openPopup() {
    this.setState({ isPopupOpened: true });
    window.clearInterval(this.interval);
    this.interval = undefined;

    if (!sessionStorage.getItem(this.bestResultKey)) {
      sessionStorage.setItem(this.bestResultKey, this.state.clicks);
    }

    if (!sessionStorage.getItem(this.bestTimeKey)) {
      sessionStorage.setItem(this.bestTimeKey, this.state.time);
    }

    if (
      sessionStorage.getItem(this.bestResultKey) &&
      parseInt(sessionStorage.getItem(this.bestResultKey)) > this.state.clicks
    ) {
      const oldBestResult = sessionStorage.getItem(this.bestResultKey);
      this.setState({ resultText: "Вы улучшили свой результат (предыдущий: " + oldBestResult + ")!" });
      sessionStorage.setItem(this.bestResultKey, this.state.clicks);
    }

    if (
      sessionStorage.getItem(this.bestTimeKey) &&
      this.state.time < parseInt(sessionStorage.getItem(this.bestTimeKey))
    ) {
      const oldBestTime = sessionStorage.getItem(this.bestTimeKey);
      this.setState({ timeText: "Вы улучшили своё время (предыдущее: " + this.formTimeString(oldBestTime) + ")!" });
      sessionStorage.setItem(this.bestTimeKey, this.state.time);
    }
  }

  closePopup() {
    this.setState({
      isPopupOpened: false,
    });

    this.startTheGame();
  }

  formTimeString(time) {
    return time < 60 ? `${time} сек.` : `${parseInt(time / 60)} мин. ${time - parseInt(time / 60) * 60} сек.`;
  }

  render() {
    return (
      <div className="App">
        <header className="header">Memory Game</header>
        <div className="game">
          <div className="score">Ходов: {this.state.clicks}</div>
          <div className="time">Время: {this.state.formedTimeString}</div>
          <div className="cards">
            {this.state.cards.map((item) => (
              <Card
                item={item}
                key={item.id}
                isShowed={item.isOpened || item.isCompleted}
                onSelect={this.selectedCardHandler.bind(this)}
              />
            ))}
          </div>
        </div>

        <Popup open={this.state.isPopupOpened} closeOnDocumentClick onClose={this.closePopup.bind(this)}>
          <div className="modal">
            <span className="close" onClick={this.closePopup.bind(this)}>
              &times;
            </span>
            <p>Игра завершена.</p>
            <p>Количество ходов: {this.state.clicks}.</p>
            <p>Затраченное время: {this.state.formedTimeString}</p>
            <p>{this.state.resultText ? this.state.resultText : null}</p>
            <p>{this.state.timeText ? this.state.timeText : null}</p>
          </div>
        </Popup>
      </div>
    );
  }
}

export default App;
