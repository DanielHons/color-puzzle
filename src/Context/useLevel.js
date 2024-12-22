import { createContext, useContext , useState } from "react";

const LevelContext = createContext({
    level: JSON.parse(localStorage.getItem("level")) || 1,
    increaseLevel: ()=>{},
    resetLevel: ()=>{}
})

const useLevel = () => useContext(LevelContext)

const LevelProvider = ({children})=>{
    const [level,setLevel] = useState(JSON.parse(localStorage.getItem("level")) || 1);

    const increaseLevel = ()=>{
        setLevel((preLevel)=>{
            localStorage.setItem("level",preLevel+1)
            return preLevel+1;
        })
    }

    const resetLevel = ()=>{
        setLevel(0);
        localStorage.setItem("level",0)
    }

    return (
        <LevelContext.Provider value={{level,increaseLevel,resetLevel}}>
            {children}
        </LevelContext.Provider >
    )
}

export {useLevel, LevelProvider}