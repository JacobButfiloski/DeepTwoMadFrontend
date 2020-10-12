const {MongoClient} = require('mongodb');
const tokenFile = require('./tokens');
const mongoToken = require('./mongoDBtoken');
const Twitter = require('twit');
var consumer_key = tokenFile.consumer_key;
var consumer_secret = tokenFile.consumer_secret;
var access_token = tokenFile.access_token;
var access_secret = tokenFile.access_token_secret;
const T = new Twitter(tokenFile);

var minutes = 480, the_interval = minutes * 60 * 1000;

setInterval(function() {
    main().catch(console.error);
}, the_interval);

async function main() {

    const uri = mongoToken.mongodburi;
    const client = new MongoClient(uri, { useNewUrlParser: true });

    try {
        await client.connect(); //connect client to db
        var tweet = await returnLastEntry(client);
        console.log(tweet);
        removeLastTweet(client, tweet);

        T.post("statuses/update", { status: tweet }, function(error, tweets, response) {
            if (!error) {
              console.log(tweets);
            }
        });
    } catch (error) {
        console.error(error); //catch unexpected errors
    } finally {
        await client.close(); //close connection once complete
    }

}

returnLastEntry = async function (client) {
    result = await client.db("TwoMadDB").collection("guilds").find().toArray();
    var tweet = Object.values(result[0]); //return tweets from db without the id
    tweet.shift();
    if(result) {
        return tweet[0];
    } else {
        console.error("no listing found");
        return "no listing found";
    }
}

async function removeLastTweet(client, tweet) {
    data = await client.db("TwoMadDB").collection("guilds").deleteOne({tweet: tweet});
}