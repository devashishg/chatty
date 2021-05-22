function verify(obj){
    if(obj.key.value === obj.confKey.value){
        return true;
    }
    return false;
}