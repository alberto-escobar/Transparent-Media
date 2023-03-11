import "./chart.min.js"

document.addEventListener('DOMContentLoaded', function () {
    main()
});

async function main(){
    let obj = await chrome.storage.local.get("logs");
    let logs = processLogs(obj.logs)
    let chartData = generateChartData(logs,25)

    new Chart("categoryChart", {
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
                    chartData["news"], 
                    chartData["pro-science"], 
                    chartData["satire"], 
                    chartData["conspiracy"],
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
            responsive: true,
            plugins: {
                legend: {
                    position: "left"
                },
            },
        
        }
    });

    new Chart("biasChart", {
        type: 'bar',
        data: {
            labels:["Bias"],
            datasets: [
                {
                    label:'Left',
                    data:[chartData["left"]],
                    backgroundColor:"blue"
                },
                {
                    label:'Lean Left',
                    data:[chartData["left-center"]],
                    backgroundColor:"lightblue"
                },
                {
                    label:'Center',
                    data:[chartData["center"]],
                    backgroundColor:"purple"
                },
                {
                    label:'Lean Right',
                    data:[chartData["right-center"]],
                    backgroundColor:"lightcoral"
                },{
                    label:'Right',
                    data:[chartData["right"]],
                    backgroundColor:"red"
                }
            ]
        },
        options: {
            plugins: {
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

    var bar_ctx = document.getElementById('factualChart').getContext('2d');
    var background_1 = bar_ctx.createLinearGradient(0, 0, 1000, 0);
    background_1.addColorStop(0, 'red');
    background_1.addColorStop(0.5, 'orange');       
    background_1.addColorStop(1, 'green');       
    
    new Chart("factualChart", {
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
                    data: [6],
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
            responsive: true,
            scales: {
                x: {
                    min: 0,
                    max: 6,
                },
                y: {
                    display: false,
                }
            }
        }
    });
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

    let bias = ["left", "left-center", "center", "right-center", "right"]
    let processedLog = {
        "date":parseInt(date),
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
        chartData["left"] += processedLogs[i]["left"]
        chartData["left-center"] += processedLogs[i]["left-center"]
        chartData["center"] += processedLogs[i]["center"]
        chartData["right-center"] += processedLogs[i]["right-center"]
        chartData["right"] += processedLogs[i]["right"]
        chartData["very low"] += processedLogs[i]["very low"]
        chartData["low"] += processedLogs[i]["low"]
        chartData["mixed"] += processedLogs[i]["mixed"]
        chartData["mostly"] += processedLogs[i]["mostly"]
        chartData["high"] += processedLogs[i]["high"]
        chartData["very high"] += processedLogs[i]["very high"]
        chartData["satire"] += processedLogs[i]["satire"]
        chartData["pro-science"] += processedLogs[i]["pro-science"]
        chartData["conspiracy"] += processedLogs[i]["conspiracy"]
    }
    //calculate averageFactualReporting
    let total = chartData["very low"] + chartData["low"] + chartData["mixed"] + chartData["mostly"] + chartData["high"] + chartData["very high"]
    let totalScore = chartData["very low"]*0 + chartData["low"]*1 + chartData["mixed"]*2 + chartData["mostly"]*3 + chartData["high"]*4 + chartData["very high"]*5
    chartData["average factual score"] = totalScore/total

    //calculate number of news articles (total of bias)
    chartData["news"] = chartData["left"] + chartData["left-center"] + chartData["center"] + chartData["right-center"] + chartData["right"]
    return chartData
}