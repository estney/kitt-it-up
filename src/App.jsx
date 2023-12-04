import React, { useState, useEffect } from "react";
import TodoMain from "./TodoMain";
import "./TimerDisplay.css";
import TimerSettings from "./TimerSettings";
import { Button } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import Timer from "./Timer";

//put inside empty array for new users
// Initial work duration set to 25 minutes in seconds and break duration set to 5 minutes in seconds
const timerLocalStorage = () => {
  let time = localStorage.getItem("timer");
  return time ? JSON.parse(time) : 25 * 60;
};

// Initial break duration set to 5 minutes in seconds
const breakLocalStorage = () => {
  let breakTime = localStorage.getItem("breakDuration");
  return breakTime ? JSON.parse(breakTime) : 5 * 60;
};

// Initial work duration set to 25 minutes in seconds
const workLocalStorage = () => {
  let workTime = localStorage.getItem("workDuration");
  return workTime ? JSON.parse(workTime) : 25 * 60;
};

const onBreakLocalStorage = () => {
  let onBreak = localStorage.getItem("isOnBreak");
  return onBreak ? JSON.parse(onBreak) : false;
};

const countPomoLocalStorage = () => {
  let countPomo = localStorage.getItem("pomodoroCounter");
  return countPomo ? JSON.parse(countPomo) : 0;
};

export default function App() {
  //create timer, showing minutes and seconds
  const [timer, setTimer] = useState(timerLocalStorage);
  const [isRunning, setIsRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(onBreakLocalStorage);
  const [workDuration, setWorkDuration] = useState(workLocalStorage);
  const [breakDuration, setBreakDuration] = useState(breakLocalStorage);
  const [pomodoroCounter, setPomodoroCounter] = useState(countPomoLocalStorage);
  const [showSetting, setShowSetting] = useState(false);

  //Format timer string
  const formatTime = (timeInSeconds) => {
    //convert seconds to minute, show mins
    const minutes = Math.floor(timeInSeconds / 60);
    //show remaining seconds
    const seconds = Math.floor(timeInSeconds % 60);

    //format timing/seconds readings, include 0 before timing if it's 1 - 9
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  //Alarm sound
  const audio = new Audio("/meow.mp3");

  useEffect(() => {
    let interval;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      if (isOnBreak) {
        setTimer(workDuration);
        setIsOnBreak(false);
        setPomodoroCounter((prevCounter) => prevCounter + 1);
      } else {
        setTimer(breakDuration);
        setIsOnBreak(true);
      }
      setIsRunning(false);
      audio.play();
    }
    localStorage.setItem("timer", JSON.stringify(timer));
    localStorage.setItem("isOnBreak", JSON.stringify(isOnBreak));
    localStorage.setItem("workDuration", JSON.stringify(workDuration));
    localStorage.setItem("breakDuration", JSON.stringify(breakDuration));
    localStorage.setItem("pomodoroCounter", JSON.stringify(pomodoroCounter));

    return () => clearInterval(interval);
  }, [
    isRunning,
    timer,
    isOnBreak,
    workDuration,
    breakDuration,
    pomodoroCounter,
  ]);

  //Start and Stop Timer
  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsOnBreak(false);
    setTimer(25 * 60); //reset timer
    setWorkDuration(25 * 60); //reset workduration
    setBreakDuration(5 * 60); //reset breakduration
    setPomodoroCounter(0); //reset pomo counter
  };

  //Fast foward function

  const handleFastForward = () => {
    // Clear any existing timer
    clearInterval(timer);

    // toggle between break and work duration
    const nextDuration = !isOnBreak ? breakDuration : workDuration;
    setIsOnBreak(!isOnBreak);

    // if user fast forward from work to break, increment the pomodoro counter
    if (isOnBreak) {
      setPomodoroCounter((prevCounter) => prevCounter + 1);
    }

    // set the timer to the next duration and pause it
    // allow the user to decide when to start
    setTimer(nextDuration);
    setIsRunning(false);
  };

  // allow user to set work and break duration

  // update work duration input
  const handleWorkDurationChange = (e) => {
    const newWorkDuration = Number(e.target.value) * 60;
    setWorkDuration(newWorkDuration);
    if (!isOnBreak) {
      setTimer(newWorkDuration); // update timer
    }
  };

  // update break duration input
  const handleBreakDurationChange = (e) => {
    const newBreakDuration = Number(e.target.value) * 60;
    setBreakDuration(newBreakDuration);
    if (isOnBreak) {
      setTimer(newBreakDuration); // update timer
    }
  };

  const toggleSettings = () => {
    setShowSetting(!showSetting); // Toggle the settings display
  };

  return (
    <>
      <div className="container">
        <div className={isOnBreak ? "breaktime" : "worktime"}>
          <div className="nav">
            <h1 className="logo">
              <img src="/kitty.png" />
              Kitt It Up!
            </h1>
            {!showSetting && (
              <Button
                size="large"
                variant="outlined"
                style={{
                  color: "white",
                  border: "2px solid #e1f5fe",
                }}
                onClick={toggleSettings}
              >
                <SettingsIcon />
                Settings
              </Button>
            )}

            {showSetting && (
              <TimerSettings
                showSetting={showSetting}
                setShowSetting={setShowSetting}
                workDuration={workDuration}
                breakDuration={breakDuration}
                handleWorkDurationChange={handleWorkDurationChange}
                handleBreakDurationChange={handleBreakDurationChange}
              />
            )}
          </div>
          <div>
            <Timer
              timer={timer}
              isRunning={isRunning}
              isOnBreak={isOnBreak}
              formatTime={formatTime}
              handleStartStop={handleStartStop}
              handleFastForward={handleFastForward}
              handleReset={handleReset}
              pomodoroCounter={pomodoroCounter}
            />
          </div>
          <TodoMain />
        </div>
      </div>
    </>
  );
}
