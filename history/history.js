import "./chart.min.js"

let categoryChart
let biasChart
let factualChart

//posts history logs to new window to copy and paste
let getRawData = document.getElementById("getRawData")
getRawData.addEventListener("click", (event) => {
    async function getRaw(){
        let obj = await chrome.storage.local.get("logs");
        let logs = processLogs(obj.logs);
        var win = window.open("", "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top="+(screen.height-400)+",left="+(screen.width-840));
        win.document.body.innerHTML = "<head><title>Raw History Data</title></head><body><pre>" + JSON.stringify(logs, null, 2); + "</pre></body>"
    }
    getRaw()
});

//select period used for chart data
let select = document.getElementById("period")
select.addEventListener("change", (event) => {
    categoryChart.destroy()
    biasChart.destroy()
    factualChart.destroy()
    main(select.value)
});

//main function used to generate charts
await main(select.value)

async function main(period){
    let obj = await chrome.storage.local.get("logs");
    let logs = processLogs(obj.logs)
    obj = await chrome.storage.local.get("options");
    if(!obj.options.a){
        alert("You have Transparent Media history turned off.")
    }
    let chartData = generateChartData(logs,period)
    createTitle(chartData);
    createCategoryChart(chartData);
    createBiasChart(chartData);
    createFactualChart(chartData);
}

function processLogs(logs){
    let processedLogs = []
    for(let i = 0; i < logs.length; i++){
        processedLogs.push(processLog(logs[i]))
    }
    return processedLogs;
}

function processLog(dayLog){
    let date = dayLog.date
    let history = dayLog.history

    let bias = ["Left", "Lean Left", "Center", "Lean Right", "Right"]
    let processedLog = {
        "date":parseInt(date),
        "articles":history.length,
        "Left":0,
        "Lean Left":0,
        "Center":0,
        "Lean Right":0,
        "Right":0,
        "Very Low":0,
        "Low":0,
        "Mixed":0,
        "Moderate":0,
        "High":0,
        "Very High":0,
        "Satire":0,
        "Pro-Science":0,
        "Conspiracy":0,
        "All Sides":0
    }

    for(let i = 0; i < history.length; i++){
        if(history[i].ASbias && history[i].MBFCbias){
            processedLog[history[i].ASbias] += 0.5
            processedLog[history[i].MBFCbias] += 0.5
            processedLog[history[i].MBFCfactual] += 1
        }
        else{
            processedLog[history[i].ASbias] += 1
            processedLog[history[i].MBFCbias] += 1
            processedLog[history[i].MBFCfactual] += 1
        }
    }
    return processedLog;
}

function generateChartData(processedLogs, period){
    if (period > processedLogs.length){
        period = processedLogs.length
    }
    //sort logs, most recent first
    processedLogs.sort((l1, l2) => (l1.date < l2.date) ? 1 : (l1.date > l2.date) ? -1 : 0);
    //iterate with for loop and add all metrics
    let chartData = processedLogs[0]
    delete chartData.date
    for(let i = 1; i < period; i++){
        
        chartData["articles"] += processedLogs[i]["articles"]
        chartData["Left"] += processedLogs[i]["Left"]
        chartData["Lean Left"] += processedLogs[i]["Lean Left"]
        chartData["Center"] += processedLogs[i]["Center"]
        chartData["Lean Right"] += processedLogs[i]["Lean Right"]
        chartData["Right"] += processedLogs[i]["Right"]
        chartData["Very Low"] += processedLogs[i]["Very Low"]
        chartData["Low"] += processedLogs[i]["Low"]
        chartData["Mixed"] += processedLogs[i]["Mixed"]
        chartData["Moderate"] += processedLogs[i]["Moderate"]
        chartData["high"] += processedLogs[i]["high"]
        chartData["Very High"] += processedLogs[i]["Very High"]
        chartData["satire"] += processedLogs[i]["satire"]
        chartData["Pro-Science"] += processedLogs[i]["Pro-Science"]
        chartData["Conspiracy"] += processedLogs[i]["Conspiracy"]
    }
    chartData["period"] = period
    
    //calculate averageFactualReporting
    let total = chartData["Very Low"] + chartData["Low"] + chartData["Mixed"] + chartData["Moderate"] + chartData["High"] + chartData["Very High"]
    let totalScore = chartData["Very Low"]*0 + chartData["Low"]*1 + chartData["Mixed"]*2 + chartData["Moderate"]*3 + chartData["High"]*4 + chartData["Very High"]*5
    chartData["average factual score"] = totalScore/total

    //calculate number of news articles (total of bias)
    chartData["news"] = chartData["Left"] + chartData["Lean Left"] + chartData["Center"] + chartData["Lean Right"] + chartData["Right"]
    return chartData
}

function createTitle(chartData){
    let title = document.getElementById("title")
    if(chartData["period"] == 1){
        title.innerHTML = "In the past " + chartData["period"] + " day you have read " + chartData["articles"] + " articles!"   
    }
    else{
        title.innerHTML = "In the past " + chartData["period"] + " days you have read " + chartData["articles"] + " articles!" 
    }

}

function createCategoryChart(chartData){
    categoryChart = new Chart("categoryChart", {
        type: 'pie',
        data: {
            labels:[
                "News",
                "Pro-Science",
                "Satire",
                "Conspiracy"
            ],
            datasets: [{
                data: [
                    roundToTwo(100*chartData["news"]/chartData["articles"]), 
                    roundToTwo(100*chartData["Pro-Science"]/chartData["articles"]), 
                    roundToTwo(100*chartData["Satire"]/chartData["articles"]), 
                    roundToTwo(100*chartData["Conspiracy"]/chartData["articles"]),
                ],
                backgroundColor: [
                    "lightsalmon",
                    "green",
                    "yellowgreen",
                    "black"
                ]
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        title:function(context){
                            return "Category"
                        },
                        label: function(context){
                            return context.label + ': ' + context.formattedValue + '%'
                        }
                    }
                },
                legend: {
                    position: "left"
                }
            },
            responsive: true,
        },
    });
}

function createBiasChart(chartData){
    biasChart = new Chart("biasChart", {
        type: 'bar',
        data: {
            labels:["Media Bias"],
            datasets: [
                {
                    label:'Left',
                    data:[roundToTwo(100*chartData["Left"]/chartData["news"])],
                    backgroundColor:"blue"
                },
                {
                    label:'Lean Left',
                    data:[roundToTwo(100*chartData["Lean Left"]/chartData["news"])],
                    backgroundColor:"lightblue"
                },
                {
                    label:'Center',
                    data:[roundToTwo(100*chartData["Center"]/chartData["news"])],
                    backgroundColor:"purple"
                },
                {
                    label:'Lean Right',
                    data:[roundToTwo(100*chartData["Lean Right"]/chartData["news"])],
                    backgroundColor:"lightcoral"
                },{
                    label:'Right',
                    data:[roundToTwo(100*chartData["Right"]/chartData["news"])],
                    backgroundColor:"red"
                }
            ]
        },
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context){
                            return context.dataset.label + ': ' + context.formattedValue + '%'
                        }
                    }
                },
                legend: {
                    position: "left"
                },
            },
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    display: false,
                    stacked: true,
                },
                y: {
                    display: false,
                    stacked: true
                }
            }
        },
    });
}

function createFactualChart(chartData){
    var bar = document.getElementById('factualChart')
    var bar_ctx = bar.getContext('2d');
    //linear gradient should be made to the size of the canvas, but I cannot
    //get bar.width to return the correct width.
    var background_1 = bar_ctx.createLinearGradient(0, 0, 960, 0);
    background_1.addColorStop(0, 'red');
    background_1.addColorStop(0.5, 'orange');       
    background_1.addColorStop(1, 'green');       
    
    factualChart = new Chart("factualChart", {
        data: {
            datasets: [
                {
                    type: 'line',
                    label:'Factual',
                    data:[chartData["average factual score"]],
                    radius:50,
                    pointStyle:"line",
                    rotation:"90",
                    backgroundColor:"black",
                    borderWidth:5,
                    borderColor:"black",
                    hitRadius:50,
                    hoverRadius:50,
                    hoverBorderWidth:5
                },
                {
                    type: 'bar',
                    label: 'Bar Dataset',
                    data: [5],
                    backgroundColor:[background_1]

                }
            ],
            labels: ['factual']
        },
        options:{
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                },
            },
            indexAxis: 'y',
            scales: {
                x: {
                    min: 0,
                    max: 5,
                },
                y: {
                    display: false,
                }
            }
        }
    });
}

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}