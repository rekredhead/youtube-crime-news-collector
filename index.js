// Search Japan, SK, NZ articles and videos manually

const { google } = require('googleapis');
const youtubeSearches = require('./youtubeSearches');
const youtube = google.youtube('v3');
const fs = require('fs');
require('dotenv').config();

const filename = 'output.txt';
const encodedType = 'utf-8';
google.options({ auth: process.env.API_KEY });
fs.writeFileSync(filename, '', encodedType);

const wordsRelatedToCrime = [
   "shot", "shoot", "kill", "crime", "suspect", "dead", "stab", "death", "murder",
   "attack", "teen", "injure", "rob", "stole", "thief", "charge", "melee", "erupt",
   "fatal", "spree", "thieves", "gun", "knife", "caught", "arrest", "theft", "battle",
   "incident", "carjack", "assault", "die", "homicide", "hit", "jailed", "youth", "hate",
   "drug", "fire", "rage", "sentence", "steal", "violence", "wound", "kidnap", "invasion",
   "fight", "arson", "burglar", "machete", "rape", "violent", "invade", "damage",
   "beat", "rampage", "break", "suicide", "homeless", "crash", "car",
   "housing", "costofliving", "injury", "hijack"
];
const getDate2WeeksAgo = () => {
   const curDate = new Date();
   curDate.setDate(curDate.getDate() - 14);
   return curDate.toISOString();
}
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const isTitleRelatedToCrime = (title) => {
   return wordsRelatedToCrime.some((word) => {
      const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
      return regex.test(title);
   });
}
const filterVideosByTitle = (videos) => {
   return videos.filter((video) => {
      const title = video.snippet.title.toLowerCase()
         .replace(/\s/g, '') // Remove spaces
         .replace(/[^\w\s]|_/g, '') // Remove symbols
         .replace(/\s+/g, ' '); // Replace multiple spaces with a single space
      
      return isTitleRelatedToCrime(title);
   });
}

const parameters = youtubeSearches.map((search) => {
   const hasSearchTerms = search.searchTerms.length !== 0 && !search.channelId;

   return hasSearchTerms ?
      {
         part: 'snippet',
         q: search.searchTerms.join('|'),
         publishedAfter: getDate2WeeksAgo(),
         order: 'date',
         type: 'video'
      } :
      {
         part: 'snippet',
         channelId: search.channelId,
         publishedAfter: getDate2WeeksAgo(),
         order: 'date',
         type: 'video'
      }
});

(async () => {
   const allData = [];

   for (const [index, parameter] of parameters.entries()) {
      youtube.search.list(parameter, (err, res) => {
         if (err) {
            console.log('Error fetching videos:', err);
            return;
         }

         const objective = youtubeSearches[index].objective;
         const rawVideos = res.data.items;
         const filteredVideos = filterVideosByTitle(rawVideos);

         allData.push({ objective, videos: filteredVideos });
      });

      //console.log(`(${index}/${parameters.length}) complete`)
      await delay(5000);
   }

   // Write the data into a file
   for (const { objective, videos } of allData) {
      fs.appendFileSync(filename, `${objective}:\n`, encodedType);

      for (const video of videos) {
         const videoID = `https://www.youtube.com/watch?v=${video.id.videoId}`;
         const title = video.snippet.title;
         fs.appendFileSync(filename, `${title}\n${videoID}\n\n`, encodedType);
      }
   }

   console.log("Automation Complete. Please see output.txt");
   console.log("Please Search Japan, SK, NZ articles and videos manually");
})();