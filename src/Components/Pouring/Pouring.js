import React, {useEffect, useRef, useState} from "react";
import {useLevel} from "../../Context/useLevel";
import "./styles.css";
import {exportInitialGlasses} from "../../Utility/generateGlass";
import {isValidStep} from "../../Utility/isValidStep";
import {putColor} from "../../Utility/putColor";
import {toast, ToastContainer} from 'react-toastify';
import {isSolved} from "../../Utility/isSolved";


const colorMap = {
    red: "#e92828",
    blue: "#013082",
    green: "#02890d",
    yellow: "#f4a506",
};

// Use React.forwardRef to allow ref forwarding to the Bottle component
const Bottle = React.forwardRef(({id, colors, isSelected, onClick}, ref) => (
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
    const {level, increaseLevel} = useLevel()
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
        function calculateTranslation(rect2, rect1) {
            // Mittelpunkte der Rechtecke berechnen
            const centerX1 = rect1.left + rect1.width / 2;
            const centerY1 = rect1.top + rect1.height / 2;
            const centerX2 = rect2.left + rect2.width / 2;
            const centerY2 = rect2.top + rect2.height / 2;

            // Verschiebung berechnen
            const translateX = centerX2 - centerX1;
            const translateY = centerY2 - centerY1;

            return {translateX, translateY};
        }

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

                    const {translateX, translateY} = calculateTranslation(rect2, rect1);

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
                    firstBottleRef.style.transformOrigin = "top center"; // Transformation von der Mitte aus


                    // Berechne Rotation und Zielposition
                    const rotationAngle = translateX < 0 ? -90 : 90;

// Setze dynamische Variablen für die Keyframes
                    firstBottleRef.style.setProperty('--translateX', `${translateX}px`);
                    firstBottleRef.style.setProperty('--translateY', `${translateY - 120}px`);
                    firstBottleRef.style.setProperty('--rotation', `${rotationAngle}deg`);

                    // Füge die Animation hinzu
                    firstBottleRef.style.animation = "pourArc 0.8s ease forwards";


                    // Optional: Entferne oder reduziere borderRadius
                    firstBottleRef.style.borderRadius = "10%"; // Minimal abgerundete Kanten für besseres Aussehen

                    // Ändere die Hintergrundfarbe, falls nötig
                    firstBottleRef.style.backgroundColor = "#68e2e840";


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
                            setLiquidStream({visible: false});
                            setSelectedBottle([]); // Reset selected bottles
                            setAttemps((prevState) => prevState + 1)
                            setLoading(false)
                            // Beschleunigen
                            setLoading(true)

                            // Apply animation to the first bottle
                            firstBottleRef.style.transition = "all 0.5s ease";
                            firstBottleRef.style.animation = "pourArc 0.8s ease backwards";
                            firstBottleRef.style.borderRadius = "0"
                            secondBottleRef.style.borderRadius = "0"
                            firstBottleRef.style.backgroundColor = ""
                            setLoading(false)
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
            setLiquidStream({visible: false});
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
                        <ToastContainer/>
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
