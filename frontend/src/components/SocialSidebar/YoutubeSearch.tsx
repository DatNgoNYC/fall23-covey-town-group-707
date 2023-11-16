import { Song } from '../../../../shared/types/CoveyTownSocket';

/**
 * A function to call the Youtube Data API to search for songs in the Youtube Catalogue using the song name and artist name given
 *
 * @param songName the name of the song to search up
 * @param artistName the name of the artist of the song to search up
 * @returns a list 10 songs which is the search result from the youtube api call
 */
function searchSong({ songName, artistName }: { songName: string; artistName: string }) {
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  const searchTerm = `${songName}+${artistName}`;
  const numResults = 10;
  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${numResults}&q=${searchTerm}&key=${youtubeApiKey}`;
  url = encodeURI(url);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const searchResults: Song[] = [];
      data.items.map(result => {
        searchResults.push({
          songName: result.snippet.title,
          artistName: result.snippet.channelTitle,
          videoId: result.id.videoId,
        });
      });
      return searchResults;
    });
}