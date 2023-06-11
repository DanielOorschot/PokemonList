

const startUp = async () => {
    getAllPokemon();
}

const pokemonDictionary = {};
const catchDictionary = {};

/*
const testValue = () => {
    console.log(catchDictionary);
}

const loadCaught = () => {
    
}

const saveCaught = () => {
    var jsonContent = JSON.stringify(catchDictionary);

    writeFile("catchList.json", jsonContent, 'utf-8', function (err){
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
     
        console.log("JSON file has been saved.");
    })
}
*/

const getAllPokemon = () => {
    let listLength = 905;
    let newRows = "";
    for (var j = 1; j < listLength; j++) {
        newRows += `<tr id="${j}" class="header"><td id="${j}image"></td><td colspan="2"><input type="checkbox" name="${j}check" id="${j}caught" onclick="isCaught(${j},id)"><label for="${j}check">${j}</label><b id="${j}name"></b></td><td id="${j}evo"></td><td id="${j}locationButton" onclick="showLocations(${j})">Show</td><td id="${j}location" style="border-top-style: hidden;border-right-style: hidden;"></td></tr>`;
        //newRows += `<tr id="${j}location"><td id="${j}location"></td></tr>`;
    }
    const ourTable = document.getElementById("pokemonList");
    ourTable.innerHTML += newRows;
    var i = 1;
    while (i < listLength) {
        getPokemon(i);
        i++;
    }
}



//Need to rewrite this function and combine it with list pokemon (maybe)
// i have two options keep running the loop in sync (faster, but harder to make it stop when I want
//I could also create a menu page
const getPokemon = (id) => {
    const fetchPromise = fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`,
        {
            headers: {
                "Accept": "application/json",
            },
        }
    );
    const streamPromise = fetchPromise.then((response) => response.json());
    streamPromise.then((data) => listPokemon(data, id));
}

const listPokemon = (pokemon, id) => {

    let pokeName = pokemon.name;
    const pokeNameCap = pokeName.charAt(0).toUpperCase() + pokeName.slice(1);
    pokemonDictionary[pokeNameCap] = id;
    catchDictionary[id] = false;
    let htmlString = `   ${pokeNameCap}    `;
    let htmlImage = `<img style="width: 100%; max-width: 300px; display: " src="${pokemon.sprites.front_default}" alt="Photo">`;

    const ourNameplace = document.getElementById(`${id}name`);
    ourNameplace.innerHTML += htmlString;
    const imagePlace = document.getElementById(`${id}image`);
    imagePlace.innerHTML += htmlImage;

    const ourRow = document.getElementById(`${id}evo`);
    ourRow.innerHTML += `<div id="${pokeName}"></div>`;

    getLocation(pokemon, id);


}


const getLocation = (pokemon, id) => {
    const fetchPromise = fetch(`${pokemon.location_area_encounters}`,
        {
            headers: {
                "Accept": "application/json",
            },
        }
    );
    const streamPromise = fetchPromise.then((response) => response.json());
    streamPromise.then((data) => addLocation(data, id));
}

const addLocation = (data, id) => {
    let gameLocation = `<div id="${id}LocationDiv" style="display: none">`;

    const locationToTable = async (data_object) => {

        gameLocation += `${data_object.location_area.name} - `;
        for (var i = 0; i < data_object.version_details.length; i++) {
            let gv = data_object.version_details[i].version.name;
            let maxChance = data_object.version_details[i].max_chance;
            if (i == data_object.version_details.length - 1) {
                gameLocation += `<text class="${gv}">${gv} | Encounter Rate:${maxChance}%</text><br>`
            }
            else {
                gameLocation += `<text class="${gv}">${gv}</text>, `
            }
        }
    }
    
    data.forEach(locationToTable);
    gameLocation += "</div>"
    const ourRow = document.getElementById(`${id}location`);
    ourRow.innerHTML += gameLocation;
    
}

const isCaught = (number, checkId) => {

    var checkBox = document.getElementById(checkId);

    if (checkBox.checked == true) {
        document.getElementById(number).style.backgroundColor = "yellow";
        catchDictionary[number] = true;
    }
    else {
        document.getElementById(number).style.backgroundColor = "white";
        catchDictionary[number] = false;
    }

}

const showLocations = (id) => {
    const locationButton = document.getElementById(`${id}locationButton`);
    let locationDiv = `${id}LocationDiv`;
    if (locationButton.innerHTML == "Show") {
        locationButton.innerHTML = "Hide";
        document.getElementById(locationDiv).style.display = "block";
    }

    else {
        locationButton.innerHTML = "Show";
        document.getElementById(locationDiv).style.display = "none";
    }
}

const listEvolutions = () => {
    document.getElementById("evoButton").style.display = "none";
    for (var i = 1; i<201; i++){
        getEvolutionChain(i)
    }
}
 
const getEvolutionChain = (id) => {
    const fetchPromise = fetch(`https://pokeapi.co/api/v2/evolution-chain/${id}/`,
        {
            headers: {
                "Accept": "application/json",
            },
        }
    );
    const streamPromise = fetchPromise.then((response) => response.json());
    streamPromise.then((data) => addEvolution(data, id));
}

const addEvolution = (evoChain, id) => {
    
    var firstPokemon = evoChain.chain.species.name;
    const stageThreeList = [];
    const stageTwoList = [];
    var stageThreeData;
    var stageTwoData;
    if (evoChain.chain.evolves_to.length > 0)
    {
        stageTwoData = evoChain.chain.evolves_to;
        var pokemonTwoName;
        var evolutionTwoMethod;
        var evolutionTwoRequirement = "";
        var evolutionTwoSentence = "";
        var addtionalTwoReq;

        var pokemonThreeName;
        var evolutionThreeMethod;
        var evolutionThreeRequirement = "";
        var evolutionThreeSentence = "";
        var addtionalThreeReq;

        for (var i = 0; i<stageTwoData.length; i++){
            pokemonTwoName = stageTwoData[i].species.name;
            evolutionTwoMethod = stageTwoData[i].evolution_details[0].trigger.name;
            evolutionTwoRequirement;
            if (evolutionTwoMethod == "level-up"){
                //check if its a minimum level requirement
                if (stageTwoData[i].evolution_details[0].min_level != null){
                    evolutionTwoRequirement = stageTwoData[i].evolution_details[0].min_level;
                    evolutionTwoSentence = `at level ${evolutionTwoRequirement} `;
                    //tyrogue check
                    if (stageTwoData[i].evolution_details[0].relative_physical_stats != null) {
                        if (stageTwoData[i].evolution_details[0].relative_physical_stats == 1){
                            addtionalTwoReq = `when attack higher than defense`;
                            evolutionTwoSentence = evolutionTwoSentence.concat(addtionalTwoReq);
                        }
                        else if (stageTwoData[i].evolution_details[0].relative_physical_stats == -1){
                            addtionalTwoReq = `when defense higher than attack`;
                            evolutionTwoSentence = evolutionTwoSentence.concat(addtionalTwoReq);
                        }
                        else if (stageTwoData[i].evolution_details[0].relative_physical_stats == 0){
                            addtionalTwoReq = `when attack equals defense`;
                            evolutionTwoSentence = evolutionTwoSentence.concat(addtionalTwoReq);
                        }
                    }
                    //time of day check
                    else if (stageTwoData[i].evolution_details[0].time_of_day != ""){
                        addtionalTwoReq = ` during ${stageTwoData[i].evolution_details[0].time_of_day}`;
                        evolutionTwoSentence = evolutionTwoSentence.concat(addtionalTwoReq);
                    }
                }
                //check if its a minimum happiness check
                else if (stageTwoData[i].evolution_details[0].min_happiness != null && stageTwoData[i].evolution_details[0].min_level == null){
                    evolutionTwoRequirement = stageTwoData[i].evolution_details[0].min_happiness;
                    evolutionTwoSentence = `leveling up with high happiness`;
                    //check if also needs held item
                    if (stageTwoData[i].evolution_details[0].held_item != null){
                        addtionalTwoReq = ` while holding a ${stageTwoData[i].evolution_details[0].held_item.name}`;
                        evolutionTwoSentence = evolutionTwoSentence.concat(addtionalTwoReq);
                    }

                }
                //check if just held item
                else if (stageTwoData[i].evolution_details[0].held_item != null && stageTwoData[i].evolution_details[0].min_level == null){
                    evolutionTwoRequirement = stageTwoData[i].evolution_details[0].held_item.name;
                    evolutionTwoSentence = `by leveling up while holding a ${evolutionTwoRequirement}`;
                }
                //check if a move is needed to be known
                else if (stageTwoData[i].evolution_details[0].known_move != null && stageTwoData[i].evolution_details[0].min_level == null){
                    evolutionTwoRequirement = stageTwoData[i].evolution_details[0].known_move.name;
                    evolutionTwoSentence = `by leveling up while knowing ${evolutionTwoRequirement}`;
                }




            }
            else if (evolutionTwoMethod == "use-item"){
                evolutionTwoRequirement = stageTwoData[i].evolution_details[0].item.name;
                evolutionTwoSentence = `using a ${evolutionTwoRequirement}`;
            }
            else if (evolutionTwoMethod == "trade"){
                evolutionTwoSentence = `trade`;
                if (stageTwoData[i].evolution_details[0].held_item != null){
                    evolutionTwoRequirement = stageTwoData[i].evolution_details[0].held_item.name;
                    addtionalTwoReq = ` while holding a ${evolutionTwoRequirement}`;
                    evolutionTwoSentence = evolutionTwoSentence.concat(addtionalTwoReq);
                }
            }
            // add pokemon details to list
            stageTwoList.push([firstPokemon, pokemonTwoName, evolutionTwoMethod, evolutionTwoSentence]);
            //check if there is a 3rd evolution
            if (stageTwoData[i].evolves_to.length > 0) {
                stageThreeData = stageTwoData[i].evolves_to;

                for (var j = 0; j<stageThreeData.length; j++){
                    pokemonThreeName = stageThreeData[j].species.name;
                    evolutionThreeMethod = stageThreeData[j].evolution_details[0].trigger.name;
                    evolutionThreeRequirement;
                    if (evolutionThreeMethod == "level-up"){
                        //check if its a minimum level requirement
                        if (stageThreeData[j].evolution_details[0].min_level != null){
                            evolutionThreeRequirement = stageThreeData[j].evolution_details[0].min_level;
                            evolutionThreeSentence = `at level ${evolutionThreeRequirement} `;
                            //tyrogue check
                            if (stageThreeData[j].evolution_details[0].relative_physical_stats != null) {
                                if (stageThreeData[j].evolution_details[0].relative_physical_stats == 1){
                                    addtionalThreeReq = `when attack higher than defense`;
                                    evolutionThreeSentence = evolutionThreeSentence.concat(addtionalThreeReq);
                                }
                                else if (stageThreeData[j].evolution_details[0].relative_physical_stats == -1){
                                    addtionalThreeReq = `when defense higher than attack`;
                                    evolutionThreeSentence = evolutionThreeSentence.concat(addtionalThreeReq);
                                }
                                else if (stageThreeData[j].evolution_details[0].relative_physical_stats == 0){
                                    addtionalThreeReq = `when attack equals defense`;
                                    evolutionThreeSentence = evolutionThreeSentence.concat(addtionalThreeReq);
                                }
                            }
                            //time of day check
                            else if (stageThreeData[j].evolution_details[0].time_of_day != ""){
                                addtionalThreeReq = ` during ${stageThreeData[j].evolution_details[0].time_of_day}`;
                                evolutionThreeSentence = evolutionThreeSentence.concat(addtionalThreeReq);
                            }
                        }
                        //check if its a minimum happiness check
                        else if (stageThreeData[j].evolution_details[0].min_happiness != null && stageThreeData[j].evolution_details[0].min_level == null){
                            evolutionThreeRequirement = stageThreeData[j].evolution_details[0].min_happiness;
                            evolutionThreeSentence = `leveling up with high happiness`;
                            //check if also needs held item
                            if (stageThreeData[j].evolution_details[0].held_item != null){
                                addtionalThreeReq = ` while holding a ${stageThreeData[j].evolution_details[0].held_item.name}`;
                                evolutionThreeSentence = evolutionThreeSentence.concat(addtionalThreeReq);
                            }
                
                        }
                        //check if just held item
                        else if (stageThreeData[j].evolution_details[0].held_item != null && stageThreeData[j].evolution_details[0].min_level == null){
                            evolutionThreeRequirement = stageThreeData[j].evolution_details[0].held_item.name;
                            evolutionThreeSentence = `by leveling up while holding a ${evolutionThreeRequirement}`;
                        }
                        //check if a move is needed to be known
                        else if (stageThreeData[j].evolution_details[0].known_move != null && stageThreeData[j].evolution_details[0].min_level == null){
                            evolutionThreeRequirement = stageThreeData[j].evolution_details[0].known_move.name;
                            evolutionThreeSentence = `by leveling up while knowing ${evolutionThreeRequirement}`;
                        }
                
                
                
                
                    }
                    else if (evolutionThreeMethod == "use-item"){
                        evolutionThreeRequirement = stageThreeData[j].evolution_details[0].item.name;
                        evolutionThreeSentence = `using a ${evolutionThreeRequirement}`;
                    }
                    else if (evolutionThreeMethod == "trade"){
                        evolutionThreeSentence = `trade`;
                        if (stageThreeData[j].evolution_details[0].held_item != null){
                            evolutionThreeRequirement = stageThreeData[j].evolution_details[0].held_item.name;
                            addtionalThreeReq = ` while holding a ${evolutionThreeRequirement}`;
                            evolutionThreeSentence = evolutionThreeSentence.concat(addtionalThreeReq);
                        }
                    }
                    // add pokemon details to list
                    stageThreeList.push([pokemonTwoName, pokemonThreeName, evolutionThreeMethod, evolutionThreeSentence]);
                }
            }
        }
        var cellLocationOne;
        var cellLocation;
        var toAdd;
        var toAddTwo;
        var toAddThree;

        cellLocationOne = document.getElementById(`${firstPokemon}`);
        
        toAdd = "Evolves into: <br>";
        cellLocationOne = document.getElementById(`${firstPokemon}`);
        cellLocationOne.innerHTML += toAdd;

        var toAddInto;
        for (var k = 0; k<stageTwoList.length; k++){
            toAddInto = `${stageTwoList[k][1].charAt(0).toUpperCase() + stageTwoList[k][1].slice(1)} - ${stageTwoList[k][3]} <br>`;
            cellLocationOne = document.getElementById(`${firstPokemon}`);
            cellLocationOne.innerHTML += toAddInto;

            toAddTwo = `Previous Evolution - ${stageTwoList[k][0].charAt(0).toUpperCase() + stageTwoList[k][0].slice(1)} - ${stageTwoList[k][3]}<br>`;
            cellLocation = document.getElementById(`${stageTwoList[k][1]}`);
            cellLocation.innerHTML += toAddTwo;

        }

        for (var n = 0; n<stageThreeList.length; n++){

            toAddInto = `<br>Evolves into ${stageThreeList[n][1].charAt(0).toUpperCase() + stageThreeList[n][1].slice(1)} - ${stageThreeList[n][3]} <br>`;
            cellLocationOne = document.getElementById(`${stageThreeList[n][0]}`);
            cellLocationOne.innerHTML += toAddInto;

            toAddTwo = `Previous Evolution - ${stageThreeList[n][0].charAt(0).toUpperCase() + stageThreeList[n][0].slice(1)} - ${stageThreeList[n][3]}`;
            cellLocation = document.getElementById(`${stageThreeList[n][1]}`);
            cellLocation.innerHTML += toAddTwo;

        }
    }
    
}
window.onload = startUp;