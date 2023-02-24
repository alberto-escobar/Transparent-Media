// script file contains Database classes that will help find results from AS and MBFC databases.

class Database{
    constructor(database){
        this.database = database
    }
    lookupInDatabase(url,database) {
        if(url !== undefined) {
          url = url.split(".");
          url = url.filter(word => commonStuff.indexOf(word) == -1)
          for (let i = 0; i < url.length; i++) {
            if (hardcode.includes(url[i])){
              return "no data"; //returned if url is in hardcode array
            }
          }
        }
        else {
          return "no data"; //returned if url is undefined
        }
        if(database !== (undefined||[])){
          
          var search = database
          for (let i = 0; i < url.length; i++) {
            var temp = [];
            for (let j = 0; j < search.length; j++) {
              var temptemp = search[j].urlarray.filter(word => commonStuff.indexOf(word) == -1)
              if(search[j].urlarray.includes(url[i]) && (temptemp.length === url.length)){
                temp.push(search[j]);
              }
              else {
                //do nothing
              } 
            }
            search = temp;
            if (search.length == 1){
              return search[0] //returned if search has only yielded one result
            }
            else if(search.length == 0){
              return "no data" //returned if search has yielded no result
            }
            else {
              //do nothing
            }
          }
          return search; //returned if search has many results and is an array
        }
        else {
          return "no data" //returned if databases are empty
        }
    }
}


class MBFCDatabase extends Database {
    constructor(database){
        super(database);
    }
    test(){
        console.log(this.test2())
        console.log("working")
    }
    test2(){
        return this.database[0];
    }
    //find MBFC profile based on a url
    findMBFCSource(url_query){
        if(typeof options !== "undefined" && options !== null){
        if(!options.MBFCData){
            return "no data"
        }
        }
    
        if(MBFCdatabase.length == 0){
        chrome.storage.local.get("MBFCdatabase", function(obj) {
            MBFCdatabase = obj.MBFCdatabase
        });
        }
        else {
        //do nothing
        }
        var output = lookupInDatabase(url_query,MBFCdatabase);
        if (Array.isArray(output)){
        return findBestMBFC(output)
        }
        else {
        return output
        }
    }
    findBestMBFC(array){
        var temp = [];
        temp = temp.concat(array.filter(profile => profile.credibility == "high credibility"))
        temp = temp.concat(array.filter(profile => profile.credibility== "medium credibility"))
        temp = temp.concat(array.filter(profile => profile.credibility== "low credibility"))
        temp = temp.concat(array.filter(profile => profile.credibility== "no credibility rating available"))
        return temp[0]
    }
}

class ASDatabase extends Database {

}