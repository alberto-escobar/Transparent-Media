class Metrics{
    constructor(options){
        this.logs = []
        let date = new Date()
        this.currentDate = date.toISOString().split("T")[0].replaceAll("-","")
        this.historyEnabled = options.a
        this.collectionEnabled = options.b
        //check if there is an entry for current date, if not then create empty entry for current date
        //if history is over 30 days, delete older entries and save
    }
    async addLog(url,AS,MBFC){
        if(!this.historyEnabled){
            return
        }
        await this.fetchLogs()
        
        if(!AS&&!MBFC){
            return;
        }
        
        let currentDayHistory = this.logs[this.logs.length-1].history
        for(var i = 0; i < currentDayHistory.length; i++){
            if(currentDayHistory[i].article === url){
                return;
            }
        } 

        let log = {
            "article":url,
            "ASbias":AS?.bias,
            "MCFCbias":MBFC?.bias,
            "MBFCfactual":MBFC?.factual,
        }
 
        this.logs[this.logs.length-1].history.push(log)

        await this.saveLogs()
    }

    async fetchLogs(){
        let newLog = {
            "date":this.currentDate,
            "history":[]
        }
        let obj = await chrome.storage.local.get("logs")
        this.logs = obj?.logs
        if(this.logs === undefined){
            this.logs = []
            this.logs.push(newLog)
        }
        else{
            if(this.logs.length === 0){
                this.logs.push(newLog)
            }
            if(this.logs[this.logs.length-1].date !== this.currentDate){
                this.logs.push(newLog)
            }
        }
        await this.saveLogs()
    }

    async saveLogs(){
        await chrome.storage.local.set({"logs":this.logs})
        await this.printStoredLogs()
        if(this.collectionEnabled == true){
            this.sendLogs()
        }
    }
    async sendLogs(){
        //check if data has been sent today, if 
        let obj = await chrome.storage.local.get("lastDate")
        if(obj?.lastDate === this.currentDate){
            return;
        }
        await chrome.storage.local.set({"lastDate":this.currentDate})
        await this.fetchToken()
        fetch("https://api64.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => {
            let packet = { "token":this.token, "ip":data.ip, "logs":this.logs}
            console.log("packet to be sent:")
            console.log(packet)
            //request sending data
        });
    }
    async printStoredLogs(){
        let obj = await chrome.storage.local.get( "logs" );
        console.log("Logs currently in storage:")
        console.log(obj.logs)
        obj = await chrome.storage.local.get("lastDate")
        console.log("date of last packet sent: "+obj?.lastDate)
    }

    async fetchToken(){
        let obj = await chrome.storage.local.get("token")
        this.token = obj.token
        if(!this.token){
            this.token = Math.floor(Math.random() * 4000000000)
            await chrome.storage.local.set({ "token":this.token });
        }
    }
}