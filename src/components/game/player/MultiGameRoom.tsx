//@ts-nocheck
import React, { useState, useEffect } from "react";
import socket from "../../../socket-io";
import ReactDOM from "react-dom";

import FinishedScreen from "./MultiFinishedScreen";

import "../../../style/style.css";
import { toast } from "react-toastify";
import { Typography, Stepper, Step, StepLabel } from "@mui/material";

import axios from "axios";

import config from "../../../config.json";
import WaitingForHost from "./WaitingForHost";
import PositionScreen from "./PositionScreen";

//hooks
import getUser from "../../../hooks/getUser";
import useTranslations from "../../../hooks/useTranslations";

let isWaiting2 = false;
let isShowingPosition2 = false;
let position2 = 0;
let GameOver2 = false;
let secondTimer = 0;
let emitted = false;
let steps2 = [];
let activeStep2 = 0;

function MultiGameRoom({ match }) {
  const user = getUser();
  let [activeStep, setActiveStep] = useState(0);

  let [steps, setSteps] = useState([]);

  let [maxSteps, setMaxSteps] = useState();

  let [time, updateTime] = useState(0);
  let [selected, setSelected] = useState([]);
  let [name, setName] = useState("");
  let cards = [];

  let [position, setPosition] = useState(0);

  let [isGameOver, setGameOver] = useState(false);
  let [isWaiting, setIsWaiting] = useState(false);
  let [isShowingPosition, setIsShowingPosition] = useState(false);

  let CurrentRoom = match.params.room;
  let gameLeft = false;

  let quiz;

  const translations = useTranslations();

  const getQuiz = async (currentQuiz, name) => {
    quiz = currentQuiz;
    setName(name); //name = quiz.name
    setCardsFunction(currentQuiz);
  };

  const UpdateTimeFunction = () => {
    if (GameOver2) return;
    else if (isWaiting2) return;
    else if (isShowingPosition2) return;
    else {
      updateTime((prev) => (time = Math.round((prev += 0.1) * 10) / 10));
      secondTimer++;
      if (secondTimer === 10) {
        secondTimer = 0;
        socket.emit("time", {
          time: time,
          room: CurrentRoom,
          user: match.params.user,
          userId: user?.profileObj.googleId,
        });
      }
    }
  };

  const setCardsFunction = (quiz) => {
    const keys = Object.keys(quiz);

    keys.map((key, index) => {
      const question = quiz[key].question;
      const answer = quiz[key].answer;

      cards.push({
        question: question,
        ans: answer,
        type: quiz[key].type === undefined ? "ques_ans" : quiz[key].type,
      });
    });

    GetCards();
  };

  // const shuffleCards = (array) => {
  //   const longArray = [];
  //   for (let i = 0; i < array.length; i++) {
  //     const set = array[i];

  //     const QCard = {
  //       question: JSON.parse(set).question,
  //       answer: JSON.parse(set).answer,
  //       index: `${i}`,
  //       type: "question",
  //     };
  //     const ACard = {
  //       question: JSON.parse(set).question,
  //       answer: JSON.parse(set).answer,
  //       index: `${i}a`,
  //       type: "answer",
  //     };
  //     longArray.push(QCard);
  //     longArray.push(ACard);
  //   }
  //   let currentIndex = longArray.length,
  //     randomIndex;

  //   // While there remain elements to shuffle...
  //   while (currentIndex != 0) {
  //     // Pick a remaining element...
  //     randomIndex = Math.floor(Math.random() * currentIndex);
  //     currentIndex--;

  //     // And swap it with the current element.
  //     [longArray[currentIndex], longArray[randomIndex]] = [
  //       longArray[randomIndex],
  //       longArray[currentIndex],
  //     ];
  //   }

  //   return longArray;
  // };

  var elements = 0;
  const numberOfCardsArr = [];
  const GetCards = () => {
    const numberOfCardsArr = [];
    cards.forEach((card, i) => {
      numberOfCardsArr.push(i);
    });
    const randomNum = numberOfCardsArr.sort(() => 0.5 - Math.random()); //[0,1,2,3,4,5].sort( () => .5 - Math.random() )
    for (var i = 0; i < cards.length; i++) {
      let newCard = document.createElement("div");
      const item = cards[randomNum[i]].question;
      const ans = cards[randomNum[i]].ans;
      newCard.id = "cardDiv";
      document.getElementById("cardContainer").appendChild(newCard);

      ReactDOM.render(
        <>
          <div
            className="card quest-card"
            id={item}
            onClick={() => {
              CardClick(item, ans, item, i);
            }}
          >
            {cards[randomNum[i]].type === "ques_ans" && item}
            {cards[randomNum[i]].type === "ques_img" && (
              <img
                src={item}
                alt="quiz-cover"
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </div>
        </>,
        newCard
      );
    }
    const randomNum2 = numberOfCardsArr.sort(() => 0.5 - Math.random());
    for (var i = 0; i < cards.length; i++) {
      let newCard2 = document.createElement("div");
      const item = cards[randomNum2[i]].question;
      const ans = cards[randomNum2[i]].ans;
      newCard2.id = "cardDiv2";
      document.getElementById("cardContainer").appendChild(newCard2);

      ReactDOM.render(
        <>
          <div
            className="card ans-card"
            id={ans}
            onClick={() => {
              CardClick(item, ans, ans, i + 10);
            }}
          >
            {ans}
          </div>
        </>,
        newCard2
      );

      elements += 2;
    }
    cards = [];
  };
  var memory = [];
  function CardClick(ques, ans, id, index) {
    setSelected((selected) => [
      ...selected,
      {
        question: ques,
        ans: ans,
      },
    ]);
    document.getElementById(id).style =
      "color: #1594DB; font-weight: bold; transform: scale(1.05); border: 4px solid #1594DB;";

    memory.push({
      question: ques,
      ans: ans,
      index: index,
    });

    if (memory.length == 2) {
      for (var i = 0; i < document.getElementsByClassName("card").length; i++) {
        document.getElementById(
          document.getElementsByClassName("card")[i].id
        ).style = "transform: scale(1)";
      }
      if (memory[0].question == memory[1].question) {
        if (memory[0].index == memory[1].index) {
          memory = [];
          setSelected((selected = []));
          return;
        }

        document.getElementById(memory[0].question).remove();
        document.getElementById(memory[1].ans).remove();

        elements -= 2;

        if (elements == 0) {
          setIsWaiting(true); //setIsWaiting(false);
          isWaiting2 = true;
          socket.emit("finishedSection", {
            room: CurrentRoom,
            user: match.params.user,
            userId: user?.profileObj.googleId,
          });
          if (activeStep2 + 1 === steps2.length) {
            setGameOver(true);
            setGameOver(true);
            GameOver2 = true;

            if (emitted === false) {
              socket.emit("PlayerFinsihed", {
                room: match.params.room,
                user: match.params.user,
                time: time,
                id: user?.profileObj.googleId,
              });
              emitted = true;
            }
          }
        }
      } else {
        updateTime((prev) => (time = prev += 5));
      }

      memory = [];
      setSelected((selected = []));
    }
  }

  const startTime = () => {
    setInterval(() => {
      UpdateTimeFunction();
    }, 100);
  };

  useEffect(() => {
    axios
      .post(`${config["api-server"]}/get-multi-all-types`, {
        multiID: match.params.gameid,
      })
      .then((res) => {
        const multi = res.data;

        const stepArr = [];
        Object.keys(JSON.parse(multi.steps)).map((step, index) => {
          stepArr.push(step);
        });

        const steps = multi.steps;
        const step = Object.keys(JSON.parse(steps))[activeStep2];
        getQuiz(JSON.parse(steps)[step], multi.name);

        setSteps((prev) => (prev = stepArr));
        steps2 = stepArr;
        setMaxSteps(stepArr.length);
        startTime();
      });

    document.getElementById("main-nav").remove();

    socket.on("joinedGameRoom", (data) => {
      //
    });
    socket.emit("joinGame", {
      room: match.params.room,
      user: match.params.user,
    });

    socket.on("timeBoard", (data) => {
      //console.log(data.time, data.user)
    });

    socket.on("showCurrentPosition", (data) => {
      const positions = data.positions;
      const id = user?.profileObj.googleId;
      const userName = match.params.user;

      for (let i = 0; i < positions.length; i++) {
        const position = positions[i];

        /*   
          id: undefined
          id2: 107441883042764793504 json
          user: undefined
          user2: Supreme_Heron match
         */

        if (position.userId === id && position.player === userName) {
          setIsWaiting(false);
          isWaiting2 = false;
          setIsShowingPosition(true);
          isShowingPosition2 = true;
          setPosition(i + 1);
          position2 = i + 1;
          return;
        }
      }
      setIsWaiting(false);
      isWaiting2 = false;
      setIsShowingPosition(true);
      isShowingPosition2 = true;
    });

    socket.on("startNextSection", (data) => {
      setIsWaiting(false);
      isWaiting2 = false;
      setIsShowingPosition(false);
      isShowingPosition2 = false;

      if (position2 === 0) {
        updateTime((prev) => (time = prev += 25));
      }

      // if (position2 === 1) {
      //   updateTime((prev) => (time = prev -= 15));
      // }
      // if (position2 === 2) {
      //   updateTime((prev) => (time = prev -= 10));
      // }
      // if (position2 === 3) {
      //   updateTime((prev) => (time = prev -= 5));
      // }

      setPosition(0);
      position2 = 0;

      document.getElementById("cardContainer").innerHTML = "";
      elements = 0;
      cards = [];
      setActiveStep(parseInt(data.activeStep));
      activeStep2 = parseInt(data.activeStep);

      axios
        .post(`${config["api-server"]}/get-multi-all-types`, {
          multiID: match.params.gameid,
        })
        .then((res) => {
          const multi = res.data;
          const steps = multi.steps;
          const step = Object.keys(JSON.parse(steps))[activeStep2];

          getQuiz(JSON.parse(steps)[step], multi.name);
        });
    });

    socket.on("PlayerFinished2", (data) => {
      toast.success(`${data} ${translations.alerts.playerfinishedgame}`, {
        autoClose: 750,
      });
    });

    socket.on("EndedGame", (data) => {
      if (gameLeft) return;
      socket.emit("leaveRoom", {
        room: match.params.room,
        user: match.params.user,
      });
      setGameOver(true);
      window.location = "/roomleave/ended";
      sessionStorage.setItem("roomJoined", "false");
    });
    socket.on("GameIsOver", (data) => {
      gameLeft = true;
      socket.emit("leaveRoom", {
        room: match.params.room,
        user: match.params.user,
      });
      const pos = data.find(
        (player) =>
          player.playerID === user?.profileObj.googleId &&
          player.player === match.params.user + "⠀"
      );
      window.location = `/roomleave/gameover?position=${pos && pos.position}`;
      sessionStorage.setItem("roomJoined", "false");
    });
    return () => {
      setGameOver(true);
      socket.emit("leaveRoom", {
        room: match.params.room,
        user: match.params.user,
      });
      sessionStorage.setItem("roomJoined", "false");
    };
  }, []);

  return (
    <div>
      <nav
        style={{
          height: "60px",
          backgroundColor: "white",
          paddingInline: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <h2
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              width: "100%",
              textAlign: "left",
            }}
          >
            {match.params.user}
          </h2>
          <div style={{ display: "flex", width: "150px" }}>
            <Typography variant="h4">⏳</Typography>
            <Typography variant="h4" style={{ textAlign: "left" }}>
              {time}
            </Typography>
          </div>
        </div>
      </nav>
      {isGameOver ? (
        <FinishedScreen user={match.params.user} steps={steps2} />
      ) : isWaiting ? (
        <>
          <div id="waiting__for__host">
            <WaitingForHost steps={steps} activeStep={activeStep + 1} />
          </div>
          <div
            hidden
            style={{ width: "100%", height: "100vh", zIndex: "500" }}
            id="popUp"
          ></div>
        </>
      ) : isShowingPosition ? (
        <PositionScreen position={position} player={match.params.user} />
      ) : (
        <>
          <div id="gameContent">
            <div id="quizTextDiv">
              <Typography
                variant="h3"
                style={{
                  backgroundColor: "white",
                  padding: "15px",
                  border: "2px solid black",
                  boxShadow: "5px 5px 0 #262626",
                  marginTop: "20px",
                  color: "#636CFF",
                }}
              >
                <b>{steps[activeStep]}</b>
              </Typography>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  marginTop: "0",
                  position: "unset",
                  transform: "none",
                  marginBottom: "100px",
                }}
                id="cardContainer"
              ></div>
              <h1 hidden>{JSON.stringify(selected)}</h1>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MultiGameRoom;
