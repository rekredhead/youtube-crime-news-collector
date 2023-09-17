// Search Japan, SK, NZ articles and videos manually

const { google } = require('googleapis');
const youtubeSearches = require('./youtubeSearches');
const wordsRelatedToCrime = require('./wordsRelatedToCrime');
const youtube = google.youtube('v3');
const fs = require('fs');
require('dotenv').config();

const filename = 'output.txt';
const encodedType = 'utf-8';
google.options({ auth: process.env.API_KEY });
fs.writeFileSync(filename, '', encodedType);

const channelSearchTerms = wordsRelatedToCrime.join('|');
const getDate10DaysAgo = () => {
   const curDate = new Date();
   curDate.setDate(curDate.getDate() - 10);
   return curDate.toISOString();
}
const getCurrentDate = () => {
   const curDate = new Date();
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
         q: search.searchTerms.join('|'), // To search for multiple terms under a single request
         publishedAfter: getDate10DaysAgo(),
         publishedBefore: getCurrentDate(),
         order: 'date',
         maxResults: 50
      } :
      {
         part: 'snippet',
         channelId: search.channelId,
         q: channelSearchTerms,
         publishedAfter: getDate10DaysAgo(),
         publishedBefore: getCurrentDate(),
         order: 'date',
         maxResults: 50
      }
});

(async () => {
   const allData = [];

   // Make an api request for each parameter
   for (const [index, parameter] of parameters.entries()) {
      // Note: The API only responds with 50 results, use the pageToken key to get more results (max of 3 pages)
      // Set a limit of 
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

      console.log(`(${index}/${parameters.length}) complete`); // Show the progress
      await delay(5000); // Wait 5 sec before making the next request to reduce the frequency of requests made
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