//DatabaseHelper is an class used to help find media bias ratings of URLs from fetched databases.

class DatabaseHelper{
  constructor(database = []){
    this.database = database
  }
  search(url){
    //iterate through database and check if any url in the database is a substring of the url being queried. If yes, push the profile on to the matches array.
    let matches = [];
    for (let i = 0; i < this.database.length; i++){
      if(url?.includes(this.database[i].url)){
        matches.push(this.database[i])
      }
    }
    //iterate through matches, find the profile with the biggest url and return that profile as the best matching profile
    let bestResult;
    let maxStringSize = 0;
    for (let i = 0; i < matches.length; i++){
      if(matches[i].url.length > maxStringSize){
        bestResult = matches[i];
        maxStringSize = matches[i].url.length;
      }
    }
    return bestResult
  }
}