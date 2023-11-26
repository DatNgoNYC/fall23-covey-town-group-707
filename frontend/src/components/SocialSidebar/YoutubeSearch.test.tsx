import { Song } from '../../types/CoveyTownSocket';
import { searchSong } from './YoutubeSearch';

const resolveValue = {
  items: [
    {
      snippet: {
        title: 'Blank Space',
        channelTitle: 'Taylor Swift',
      },
      id: {
        kind: 'youtube#video',
        videoId: 'abc',
      },
    },
    {
      snippet: {
        title: 'Love Song',
        channelTitle: 'Taylor Swift',
      },
      id: {
        kind: 'youtube#video',
        videoId: 'def',
      },
    },
  ],
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(resolveValue),
  }),
) as jest.Mock;

describe('test searchSong', () => {
  const apiKey = 'testKey';

  const songName1 = 'Blank Space';
  const artistName1 = 'Taylor Swift';
  const videoId1 = 'abc';

  const songName2 = 'Love Song';
  const artistName2 = 'Taylor Swift';
  const videoId2 = 'def';

  let result: Song[];

  beforeEach(async () => {
    result = await searchSong({
      songName: songName1,
      artistName: artistName1,
      youtubeApiKey: apiKey,
    });
  });

  it('should fetch using the correctly formatted URL', async () => {
    expect(global.fetch).toBeCalledWith(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURI(
        songName1 + '+' + artistName1,
      )}&key=${apiKey}`,
    );
  });
  it('should return a list of correctly formatted songs', async () => {
    const expectedResult: Song[] = [
      {
        songName: songName1,
        artistName: artistName1,
        videoId: videoId1,
      },
      {
        songName: songName2,
        artistName: artistName2,
        videoId: videoId2,
      },
    ];

    expect(result).toEqual(expectedResult);
  });
});
