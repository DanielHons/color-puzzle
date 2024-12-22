export function isValidStep(color1,color2){
    if(color1 && color1.length===0){
        return false
    }
    else if(color2.length===0){
        return true
    }
    else if(color1===color2){
        return true
    }
    return false
}