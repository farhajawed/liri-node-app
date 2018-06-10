// https://farha-neu.github.io/Responsive-Portfolio/

require("dotenv").config();
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");

var keys = require("./keys.js");
var fs = require("fs");

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var command = process.argv[2];
//if no song is provided
var defaultSong = 'The Sign Ace of Base';

var inputArg="";

//append all strings after command
for(var i =3; i<process.argv.length;i++){
    var input = process.argv[i];
    inputArg = inputArg+" "+input;
    if(i==3){
        inputArg = input;
    }
}

//twitter variables
var tweeterCount = 20;
var twitterScreenName = "aliceliriliri"; //optional param. replace screen_name by any twitter username

var text='';
var commandtext = "Command: "+command+" "+inputArg+"\r\n------------------------------------\r\n";


switch (command) {
    case "my-tweets":
        myTweets();
        break;
    case "spotify-this-song":
        spotifyThisSong(inputArg);
        break;
    case "movie-this":
        movieThis(inputArg);
        break;
    case "do-what-it-says":
        doWhatItSays();
        break;
}

function myTweets(){
   
    var params = {screen_name: twitterScreenName, count: tweeterCount};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
        for(var i = 0; i < tweets.length; i++){
            var tweetText = tweets[i].text;
            var date = tweets[i].created_at;
            text+=tweetText+"\r\nCreated at: "+date+"\r\n\r\n";
        } 
    }
    console.log(text);
    appendFile(text+"------------------------------------\r\n");
  });
}

function spotifyThisSong(inputArg){
    //if input argument provided, print 1st 5 songs
    if(inputArg){
        var count = 5;
    }
    //else print only the default song
    else{
        var count = 1;
        inputArg = defaultSong;
    }
    spotify.search({ type: 'track', query: inputArg, limit: count}, function(err, data) {
        var dataItems = data.tracks.items;
        if (err) {
            var error = "Error occurred: " + err;
            appendFile(error+"\r\n------------------------------------\r\n");
            return console.log(error);
        }
        if(dataItems.length>0){
            for(var i = 0; i < dataItems.length; i++){
                printSong(dataItems,i);  
            } 
            console.log(text);
            appendFile(text+"------------------------------------\r\n");     
        }
        else{
            var message = "Song not found!";
            text+=message;
            console.log(message);
            appendFile(text+"\r\n\r\n------------------------------------\r\n");
        }
    });
        
}
    
function printSong(dataItems,i){
    var songName = dataItems[i].name;
    text+="Song name: "+songName+"\r\n"+"Artists: ";
    for(var j = 0; j<dataItems[i].artists.length;j++){
        var artist =dataItems[i].artists[j].name;
        if(j===dataItems[i].artists.length-1){
            text+=artist;
        }
        else{
            text+=artist+", ";
        }                
    }
    if(dataItems[i].preview_url!==null){
            var previewLink = "Preview link: "+dataItems[i].preview_url;
    }
    else{
          //if preview link not available, N/A
         var previewLink = "Preview link: N/A";
    }
    var album = "Album: "+dataItems[i].album.name; 
    text+="\r\n"+previewLink+"\r\n"+album+"\r\n\r\n"; 
}

function movieThis(inputArg){
  
    if(!inputArg){
        inputArg = "Mr.Nobody";
    }
   
    var queryUrl = "http://www.omdbapi.com/?t=" + inputArg + "&y=&plot=short&apikey=trilogy";
    
    request(queryUrl, function(error, response, body) {
      
    if (!error && response.statusCode === 200) {
        var movieObject = JSON.parse(body);

        if(movieObject.Response==="False"){
            var errorMessage = movieObject.Error;
            console.log(errorMessage);
            text+=errorMessage+"\r\n\r\n";
            appendFile(text+"------------------------------------\r\n");
        }
        else{
            var title = "Title: " + movieObject.Title+"\r\n";
            var year = "Year: " +  movieObject.Year+"\r\n";
            var imdb = "IMDB Rating: " +  movieObject.imdbRating+"\r\n";
            var country = "Country Produced: " + movieObject.Country+"\r\n";
            var language = "Language: " +  movieObject.Language+"\r\n";
            var plot = "Plot: " + movieObject.Plot+"\r\n";
            var actors = "Actors: " + movieObject.Actors+"\r\n";
            if(movieObject.Ratings.length>1){
                var rating =  "Rotten Tomato Rating: " +movieObject.Ratings[1].Value+"\r\n";
            }
            else{
                var rating =  "Rotten Tomato Rating: N/A\r\n";
            }
            text+=title+year+imdb+rating+country+language+plot+actors;
            console.log(text);
            appendFile(text+"\r\n------------------------------------\r\n");    
        }
     }    
    });     
}

function doWhatItSays(){   
        fs.readFile("random.txt", "utf8", function(error, data) {

            if (error) {
            return console.log(error);
            }
        
            var dataArr = data.split(",");
        
            var command = dataArr[0];
            var trackOrMovie = dataArr[1];

            switch (command) {
                case "my-tweets":
                    myTweets();
                    break;
                case "spotify-this-song":
                    spotifyThisSong(trackOrMovie);
                    break;
                case "movie-this":
                    movieThis(trackOrMovie);
                    break;
            }       
    });
}

function appendFile(text){
    fs.appendFile("log.txt", commandtext+text, function(err) {
        if (err) {
          console.log(err);
       }
    });
}
