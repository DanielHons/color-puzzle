function solved(layer){
    let top = layer[0];
    for(let i=0;i<layer.length;i++){
        if(layer[i]!==top){
            return false
        }
    }
    return true
}

export function isSolved(bottles){
    let nonEmpty = 0;
    let empty = 0;
    for(let i=0;i<bottles.length;i++){
        let layer = bottles[i];
        if(layer.length===0){
            empty+=1
        }
        else{
            if(solved(layer)){
                nonEmpty+=1
            }
        }
    }
    if(nonEmpty===3 && empty===2){
        return true;
    }
    return false
}