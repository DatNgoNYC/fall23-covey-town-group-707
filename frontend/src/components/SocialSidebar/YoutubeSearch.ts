import { Song } from '../../../../shared/types/CoveyTownSocket';

type ResultJSON = { snippet: { title: string; channelTitle: string }; id: { videoId: string } };

/**
 * A function to call the Youtube Data API to search for songs in the Youtube Catalogue using the song name and artist name given
 *
 * @param songName the name of the song to search up
 * @param artistName the name of the artist of the song to search up
 * @returns a list 10 songs which is the search result from the youtube api call
 */
export async function searchSong({
  songName,
  artistName,
  youtubeApiKey,
}: {
  songName: string;
  artistName: string;
  youtubeApiKey: string;
}): Promise<Song[]> {
  const searchTerm = `${songName}+${artistName}`;
  const numResults = 10;
  let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${numResults}&q=${searchTerm}&key=${youtubeApiKey}`;
  url = encodeURI(url);
  const searchResults: Song[] = [];

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      data.items.map((result: ResultJSON) => {
        searchResults.push({
          songName: result.snippet.title,
          artistName: result.snippet.channelTitle,
          videoId: result.id.videoId,
        });
      });
      return searchResults;
    });
}
