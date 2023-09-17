# Description
- This is an automation tool that shows the latest crime news from multiple regions around the world
- It uses the YouTube API and makes a request for the crime news for a single regions (e.g. New York)
- Then it compiles all the findings, filters out the non-crime-related news and outputs the data onto a .txt file
- The file contains the areas, youtube video title and link of the crimes occurred in those areas

# Improvements
- The tool can filter articles more accurately by adding more unique crime related terms in the `wordsRelatedToCrime.js` array
- More areas can be added to the `youtubeSearches.js` array (please use the same object data as the previous elements in the list)
- Output the data into a Google Document to make it easier to move to other google docs

# Warning
- There can only be 100 API requests per day. Currently, the tool makes 31 requests so the tool can only be used 2 times a day at maximum

# Setup
- Clone this repository
```
git clone https://github.com/rekredhead/youtube-crime-news-collector.git
```
- Install the dependencies
```
npm install
```
- Create/Use a Google Cloud Console Project and enable the YouTube Data API [https://console.cloud.google.com/apis/library/youtube.googleapis.com]
- Create an API Key and keep it saved
- Create a `.env` file containing the following:
```
API_KEY="(your-api-key)"
```
- Run the app:
```
npm start
```