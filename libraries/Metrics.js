//Metrics class helps record ratings of articles read by the user. No article information is stored except for the ratings found on All Sides and Media Bias Fact Check.

class Metrics{
    constructor(options){
        this.logs = []
        let date = new Date()
        this.currentDate = this.toISOLocalDate(date)
        this.historyEnabled = options.a
        this.collectionEnabled = options.b
    }

    //Return the local date time as an ISO string.
    toISOLocalDate(d) {
        var z  = n =>  ('0' + n).slice(-2);
        var zz = n => ('00' + n).slice(-3);
        var off = d.getTimezoneOffset();
        var sign = off > 0? '-' : '+';
        off = Math.abs(off);
        let output = d.getFullYear() + '-'
               + z(d.getMonth()+1) + '-' +
               z(d.getDate()) + 'T' +
               z(d.getHours()) + ':'  + 
               z(d.getMinutes()) + ':' +
               z(d.getSeconds()) + '.' +
               zz(d.getMilliseconds()) +
               sign + z(off/60|0) + ':' + z(off%60); 
        return output.split("T")[0].replaceAll("-","")
    }

    //Add ratings for article to history logs provided it is not already in there and history is enabled by the user. 
    async addLog(url,AS,MBFC){
        
        if(!this.historyEnabled){
            return
        }
        await this.fetchLogs()
        
        if(!AS&&!MBFC){
            return;
        }
        //Create hash of article url to check if rating has been record for today or not.
        let urlHash = this.hash(url); 
        let currentDayHistory = this.logs[this.logs.length-1].history

        for(var i = 0; i < currentDayHistory.length; i++){
            if(currentDayHistory[i].articleHash === urlHash){
                return;
            }
        } 

        let log = {
            "articleHash":urlHash,
            "ASbias":AS?.bias,
            "MBFCbias":MBFC?.bias,
            "MBFCfactual":MBFC?.factual,
        }
 
        this.logs[this.logs.length-1].history.push(log)

        await this.saveLogs()
    }

    //Fetch history logs from local storage.
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
            if(this.logs.length > 180){
                this.logs.shift()
                
            }
        }
        await this.saveLogs()

        await this.fillGaps()

    }

    //Save history logs to local storage.
    async saveLogs(){
        await chrome.storage.local.set({"logs":this.logs})
        if(this.collectionEnabled == true){
            this.sendLogs()
        }
    }

    //Send history logs provided user has enabled anonymous data collection.
    async sendLogs(){
        let obj = await chrome.storage.local.get("lastDate")
        if(obj?.lastDate === this.currentDate){
            return;
        }
        await chrome.storage.local.set({"lastDate":this.currentDate})
        
        //Fetch token
        obj = await chrome.storage.local.get("token")
        this.token = obj.token
        if(!this.token){
            this.token = Math.floor(Math.random() * 4000000000)
            await chrome.storage.local.set({ "token":this.token });
        }

        let packet = { "token":this.token, "logs":this.logs}
        console.log("packet to be sent:")
        console.log(packet)

        const api = "https://transparent-media-extension-endpoints.p.rapidapi.com/extension/experiment"
        const options = {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
            "url": api,
            'X-RapidAPI-Key': 'c68506b6c4msh761b24c39cc0233p10207cjsnd103f347dfc4',
            'X-RapidAPI-Host': 'transparent-media-extension-endpoints.p.rapidapi.com'
          },
          body: JSON.stringify(packet)
        };
        fetch(api, options)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
        });
    }
    
    //Print history logs in storage, use for debug
    async printStoredLogs(){
        let obj = await chrome.storage.local.get( "logs" );
        console.log("Logs currently in storage:")
        console.log(obj.logs)
    }

    //Hashing function to convert strings to signed integers.
    hash(string){
        //set variable hash as 0
        var hash = 0;
        // if the length of the string is 0, return 0
        if (string.length == 0) return hash;
        for (let i = 0 ;i<string.length ; i++)
        {
            let ch = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + ch;
            hash = hash & hash;
        }
        return hash;
    }

    async fillGaps(){
        let currentDate = this.ISOLocalToDate(this.logs[0].date)
        let missingDays = []
        for(let i=1;i<this.logs.length;i++){
            currentDate.setDate(currentDate.getDate() + 1)
            let endDate = this.ISOLocalToDate(this.logs[i].date)
            while(parseInt(this.toISOLocalDate(currentDate)) < parseInt(this.toISOLocalDate(endDate))){
                let newLog = {
                    "date":this.toISOLocalDate(currentDate),
                    "history":[]
                }
                missingDays.push(newLog)
                currentDate.setDate(currentDate.getDate() + 1)
            }
            currentDate = endDate
        }
        this.logs = this.logs.concat(missingDays)
        this.logs.sort((l1, l2) => (parseInt(l1.date) > parseInt(l2.date)) ? 1 : (parseInt(l1.date) < parseInt(l2.date)) ? -1 : 0)
        this.saveLogs()
    }

    ISOLocalToDate(dateString){
        return new Date(dateString.slice(0,4) + "-" +  dateString.slice(4,6) + "-" +  dateString.slice(6) + "T12:00")
    }
}