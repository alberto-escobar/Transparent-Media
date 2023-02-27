class Metrics{
    constructor(currentDate=""){
        this.logs = []
        this.currentDate = currentDate
        //check if there is an entry for current date, if not then create empty entry for current date
        //if history is over 30 days, delete older entries and save
    }
    async addLog(url,AS,MBFC){
        if(!AS&&!MBFC){
            return;
        }
        await this.fetchLogs()
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

        this.saveLogs()
    }

    async fetchLogs(){
        let obj = await chrome.storage.local.get( "logs" ); //have try and catch incase the thing is empty
        this.logs = obj.logs
        let newLog = {
            "date":this.currentDate,
            "history":[]
        }
        if(this.logs.length === 0){
            this.logs.push(newLog)
        }
        if(this.logs[this.logs.length-1].date !== this.currentDate){
            this.logs.push(newLog)
        }
    }

    async saveLogs(){
        //save History to chrome storage
        await chrome.storage.local.set({"logs":this.logs})
    }
    async sendLogs(){
        //send history 
        console.log("i dont do anything right now")
    }
    async printStoredLogs(){
        let obj = await chrome.storage.local.get( "logs" );
        console.log("Gentlemen, the log files:")
        console.log(obj.logs)
    }
}