import React, { useState, useRef, useEffect } from "react";
import { useLevel } from "../../Context/useLevel";
import "./styles.css";
import { exportInitialGlasses } from "../../Utility/generateGlass";
import { isValidStep } from "../../Utility/isValidStep";
import { putColor } from "../../Utility/putColor";
import { ToastContainer, toast } from 'react-toastify';
import { isSolved } from "../../Utility/isSolved";


const colorMap = {
  red: "#e92828",
  blue: "#013082",
  green: "#02890d",
  yellow: "#f4a506",
};

// Use React.forwardRef to allow ref forwarding to the Bottle component
const Bottle = React.forwardRef(({ id, colors, isSelected, onClick }, ref) => (
  <div
    ref={ref}
    className={`bottle ${isSelected ? "selected" : ""}`}
    onClick={() => onClick(id)}
    id={`bottle-${id}`}
  >
    <div className="liquid">
      {colors.map((color, index) => (
        <div
          key={index}
          className="liquid-layer"
          style={{
            backgroundColor: colorMap[color],
            height: `${100 / 4}%`, // Assuming each bottle has a maximum of 4 layers
          }}
        />
      ))}
    </div>
  </div>
));

const PouringGame = () => {
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedBottle, setSelectedBottle] = useState([]);
  const [attemps, setAttemps] = useState(0)
  const { level, increaseLevel } = useLevel()
  const [bottles, setBottles] = useState(exportInitialGlasses(level));
  const [liquidStream, setLiquidStream] = useState({
    visible: false,
    color: "",
    top: 0,
    left: 0
  });
  const [loading, setLoading] = useState(false)

  // Create refs for all bottles
  const bottleRefs = useRef([]);

  const handleBottleClick = (id) => {
    if (selectedBottle.indexOf(id) === -1) {
      if (selectedBottle.length === 0) {
        setSelectedBottle((prevState) => [...prevState, id]);
      } else {
        const firstBottleId = selectedBottle[0];
        const firstBottleRef = bottleRefs.current[firstBottleId];
        const secondBottleRef = bottleRefs.current[id];
        const secondBottleId = id
        if (firstBottleRef && secondBottleRef) {
          const rect1 = firstBottleRef.getBoundingClientRect();
          const rect2 = secondBottleRef.getBoundingClientRect();


          // Calculate translation to position first bottle near the second
          const translateX = rect2.left - rect1.left - 1.5 * rect1.width;
          const translateY = rect2.top - rect1.top - rect1.height + rect1.width - 20;

          const topColor = bottles[firstBottleId][bottles[firstBottleId].length - 1];
          const acceptorColor = bottles[secondBottleId].length === 0 ? "" : bottles[secondBottleId][bottles[secondBottleId].length - 1];



          if (!isValidStep(topColor, acceptorColor)) {
            setSelectedBottle([])
            toast.error('Wrong Move', {
              position: 'top-left',
              autoClose: 1500
            });
            return;
          }
          setLoading(true)

          // Apply animation to the first bottle
          firstBottleRef.style.transition = "all 0.8s ease";
          firstBottleRef.style.transform = `translate(${translateX}px, ${translateY}px) rotate(90deg)`;
          firstBottleRef.style.borderRadius = "50% 0 0 0"
          firstBottleRef.style.backgroundColor = "#68e2e840"


          // Show the liquid stream after the animation completes
          setTimeout(() => {
            const updatedRect1 = firstBottleRef.getBoundingClientRect();
            const updatedRect2 = secondBottleRef.getBoundingClientRect();
            setLiquidStream({
              visible: true,
              color: colorMap[topColor],
              top: updatedRect2.top / 2 - 8,
              left: updatedRect2.left + (updatedRect2.width / 2),
              height: (updatedRect2.height - 10) - (bottles[id].length * (updatedRect2.height / 4))
            });

            // Simulate pouring logic (update bottle states) after showing the stream
            setTimeout(() => {
              // Transfer liquid logic here
              setBottles((prevState) => {
                const updatedBottles = [...prevState];
                const pouredColor = putColor(updatedBottles[firstBottleId], updatedBottles[id]);
                // console.log("pouredColor",pouredColor)
                // if (pouredColor) updatedBottles[id].concat(pouredColor);
                return updatedBottles;
              });

              // Hide the liquid stream
              setLiquidStream({ visible: false });
              setSelectedBottle([]); // Reset selected bottles
              setAttemps((prevState) => prevState + 1)
              setLoading(false)
              firstBottleRef.style.transform = ""; // Reset the transform
              firstBottleRef.style.borderRadius = "0"
              firstBottleRef.style.backgroundColor = ""
            }, 1000);
          }, 800);
        }
      }
    } else {
      setSelectedBottle((prevState) => prevState.filter((ele) => ele !== id));
    }
  };

  useEffect(() => {
    if (isSolved(bottles)) {
      toast.info('Wow!! You completed this level 🥳🥳', {
        position: 'top-center',
        autoClose: 1500
      });
      setTimeout(() => {
        increaseLevel();
        setGameStarted(false);
        setAttemps(0);
      }, 2000);
    }
  }, [bottles]); // Trigger on bottles update

  useEffect(() => {
    if (gameStarted) {
      setBottles(exportInitialGlasses(level));
      setSelectedBottle([]);
      setLiquidStream({ visible: false });
    }
  }, [level, gameStarted]);

  return (
    <div>
      {
        gameStarted ?
          <>
            <div className="modalText">
              <p>Level is {level}</p>
              <p>Attempts - {attemps}</p>
            </div>
            <div className="game-container">
              {bottles.map((colors, index) => (
                <Bottle
                  key={index}
                  id={index}
                  colors={colors}
                  onClick={handleBottleClick}
                  isSelected={selectedBottle.indexOf(index) !== -1}
                  ref={(el) => {
                    bottleRefs.current[index] = el;
                  }}
                />
              ))}
              {liquidStream.visible && (
                <div
                  className="liquid-stream"
                  style={{
                    position: "absolute",
                    backgroundColor: liquidStream.color,
                    // height: `${liquidStream.endY - liquidStream.startY}px`,
                    height: `${liquidStream.height}px`,
                    top: `${liquidStream.top}px`,
                    left: `${liquidStream.left - 20}px`,
                    padding: "10px 0",
                    marginTop: "-10px"
                  }}
                />
              )}
            </div>
            <ToastContainer />
          </>
          :
          <div className="modalText">
            <p>{level === 1 ? "Let starte Waater Puzzle Game" : "You played well lets try next level"}</p>
            <div onClick={() => setGameStarted((prevState) => !prevState)} className="btn">Start Game</div>
          </div>
      }
      {loading && <div onClick={() => {
        toast.warn('Let the previous get finished', {
          position: 'top-left',
          autoClose: 1500
        });
      }} className="wrapper"></div>}

    </div>

  );
};

export default PouringGame;
