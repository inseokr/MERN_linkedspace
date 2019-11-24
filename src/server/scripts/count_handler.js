function handleOnClickPlus_count(elementIdName){

    var countElement = document.getElementById(elementIdName);
    ++countElement.value;
}

function handleOnClickMinus_count(elementIdName){
    
    var countElement = document.getElementById(elementIdName);

    if(countElement.value>1)
    {
        --countElement.value;
    }
}