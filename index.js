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

const getDateFromXDaysAgo = (daysAgo) => {
   const currentDate = new Date();
   currentDate.setDate(currentDate.getDate() - daysAgo);
   return currentDate.toISOString();
}
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const date10DaysAgo = getDateFromXDaysAgo(10);
const currentDate = getDateFromXDaysAgo(0);
const channelSearchTerms = wordsRelatedToCrime.join('|');

const filterVideosByTitle = (videos) => {
   return videos.filter((video) => {
      const title = video.snippet.title.toLowerCase()
         .replace(/\s/g, '') // Remove spaces
         .replace(/[^\w\s]|_/g, '') // Remove symbols
         .replace(/\s+/g, ' '); // Replace multiple spaces with a single space

      return wordsRelatedToCrime.some((word) => {
         const regex = new RegExp(`\\b${word}\\b|${word}`, 'i');
         return regex.test(title);
      });
   });
}

const parameters = youtubeSearches.map((search) => {
   const hasSearchTerms = search.searchTerms.length !== 0 && !search.channelId;

   return hasSearchTerms ?
      // Search the globally
      {
         part: 'snippet',
         q: search.searchTerms.join('|'), // To search for multiple terms under a single request
         publishedAfter: date10DaysAgo,
         publishedBefore: currentDate,
         order: 'date',
         maxResults: 50
      } :
      // Search the specific channel
      {
         part: 'snippet',
         channelId: search.channelId,
         q: channelSearchTerms, // To reduce the response size
         publishedAfter: date10DaysAgo,
         publishedBefore: currentDate,
         order: 'date',
         maxResults: 50
      }
});

(async () => {
   const allData = [];
   const paginationSearchLimit = 3;

   // Make an api request for each parameter
   for (const [index, parameter] of parameters.entries()) {

      const isAChannelSearch = (parameter.channelId) !== undefined;
      if (isAChannelSearch) {
         // Search the channel specified in the parameter - use `nextPageToken` since pagination is used in the API response
         let nextPageToken = null;
         let pagesSearched = 0;

         do {
            if (pagesSearched > paginationSearchLimit) break;

            youtube.search.list({ ...parameter, pageToken: nextPageToken }, (err, res) => {
               if (err) {
                  console.log('Error fetching videos:', err);
                  return;
               }

               const objective = youtubeSearches[index].objective;
               const rawVideos = res.data.items;
               const filteredVideos = filterVideosByTitle(rawVideos);

               allData.push({ objective, videos: filteredVideos });
               nextPageToken = res.data.nextPageToken; // Get the token for the next page
            });

            pagesSearched++;
            await delay(2000); // Wait for 2 seconds before making the next request to reduce the frequency of requests made

         } while (nextPageToken);

      } else {
         // Search globally - nextPageToken is not used here since the pagination is not used in the API response
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
      }

      console.log(`(${index}/${parameters.length}) complete`); // Show the progress
      await delay(2000); // Wait 2 sec before making the next request to reduce the frequency of requests made
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