//get the data from storage
//process it to make a daily tally of various markers (ASbias, MBFCbias, CombinedBias, and MBFCfactual)
//if one article has disagreeing MBFC and ASbias data, add half points to respective categories
//write data to html element

//data visualisation
//Date      Articles Read                  Average Bias                Average Factual Reporting           Misc Categories also viewed
//20230801     1                           L [LL] C  LR  R             |  Low  | [Mostly] |  High          Conspiracy:1 | Pro-science:5 | Satire:2
//20230801     5                                                          L  LL  C  LR  R             |  Low  |  Mostly  |  High          N/A (if zero, don't show, if all zero, show N/A)

//instead of average, you could do a heat map using opacity.

//load hs history
//process it
// make elements

function processLogs(logs){
    let history = []
    for(let i = 0; i < logs.length; i++){
        history.push(processDay(logs[i]))
    }
    return history;
}

function processDay(dayLog){
    let date = dayLog.date
    let history = dayLog.history

    let bias = ["left", "left-center", "center", "right-center", "right"]
    let tally = {
        "date":date,
        "articles":history.length,
        "left":0,
        "left-center":0,
        "center":0,
        "right-center":0,
        "right":0,
        "very low":0,
        "low":0,
        "mixed":0,
        "mostly":0,
        "high":0,
        "very high":0,
        "satire":0,
        "pro-science":0,
        "conspiracy":0,
        "allsides":0
    }

    for(let i = 0; i < history.length; i++){
        if(history[i].ASbias && history[i].MBFCbias && bias.includes(history[i].MBFCbias)){
            tally[history[i].ASbias] += 0.5
            tally[history[i].MBFCbias] += 0.5
            tally[history[i].MBFCfactual] += 1
        }
        else{
            tally[history[i].ASbias] += 1
            tally[history[i].MBFCbias] += 1
            tally[history[i].MBFCfactual] += 1
        }
    }
    return tally
}
function populateTable(logs){
    let table = document.getElementById("table")
    for (let i = 0; i < logs.length; i++){
        let row = document.createElement("tr")
        
        let cell = document.createElement("td")
        cell.innerHTML = logs[i].date
        row.append(cell)

        cell = document.createElement("td")
        cell.innerHTML = logs[i].articles
        row.append(cell)

 
        generateBiasHeatMap(logs[i],row)

        //Factual Heat Map

        //tags

        table.append(row)
    }
}

function generateBiasHeatMap(log, row){
    total = Math.max(log["left"],log["left-center"],log["center"],log["right-center"],log["right"])
    
    let cell = document.createElement("td")
    cell.innerHTML = "Left"
    cell.setAttribute("style","background-color: blue;color: white; opacity: "+ (log["left"]/total||0.05))
    cell.setAttribute("title",log["left"]+" article")
    row.append(cell)

    cell = document.createElement("td")
    cell.innerHTML = "Lean<br>Left"
    cell.setAttribute("style","background-color: lightblue;color: white; opacity: "+ (log["left-center"]/total||0.05))
    cell.setAttribute("title",log["left-center"]+" article")
    row.append(cell)

    cell = document.createElement("td")
    cell.innerHTML = "Center"
    cell.setAttribute("style","background-color: purple;color: white; opacity: "+ (log["center"]/total||0.05))
    cell.setAttribute("title",log["center"]+" article")
    row.append(cell)

    cell = document.createElement("td")
    cell.innerHTML = "Lean<br>Right"
    cell.setAttribute("style","background-color: lightcoral;color: white; opacity: "+ (log["right-center"]/total||0.05))
    cell.setAttribute("title",log["right-center"]+" article")
    row.append(cell)

    cell = document.createElement("td")
    cell.innerHTML = "Right"
    cell.setAttribute("style","background-color: red;color: white; opacity: "+ (log["right"]/total||0.05))
    cell.setAttribute("title",log["right"]+" article")
    row.append(cell)
}
async function main(){
    let obj = await chrome.storage.local.get("logs");
    let logs = processLogs(obj.logs)
    console.log(logs)
    populateTable(logs)
}

document.addEventListener('DOMContentLoaded', function () {
    main()
});