import { Song, SongQueueItem } from '../../types/CoveyTownSocket';
import Jukebox from './Jukebox';

describe('Jukebox', () => {
  let jukebox: Jukebox;

  beforeEach(() => {
    jukebox = new Jukebox();
  });

  describe('addSongToQueue', () => {
    it('should add the given song into the queue', () => {
      const song: Song = {
        songName: 'Sue Me',
        artistName: 'Sabrina Carpenter',
        videoId: 'xyz',
      };

      const expectedSongQueueItem: SongQueueItem = {
        song,
        numUpvotes: 0,
        numDownvotes: 0,
      };

      jukebox.addSongToQueue(song);

      expect(jukebox.queue.length).toEqual(1);
      expect(jukebox.queue[0]).toEqual(expectedSongQueueItem);
    });
    it('should throw an error if the song is already in queue', () => {
      const song: Song = {
        songName: 'Sue Me',
        artistName: 'Sabrina Carpenter',
        videoId: 'xyz',
      };

      jukebox.addSongToQueue(song);
      expect(jukebox.queue.length).toEqual(1);

      expect(() => jukebox.addSongToQueue(song)).toThrowError('Song already in queue.');
      expect(jukebox.queue.length).toEqual(1);
    });
  });

  describe('voteOnSongInQueue', () => {
    it('should error if the provided song is not in the queue', () => {
      const song: Song = {
        songName: 'Feather',
        artistName: 'Sabrina Carpenter',
        videoId: 'abc',
      };

      expect(() => jukebox.voteOnSongInQueue(song, 'Upvote')).toThrowError('Song not in queue.');
    });
    it('should add an upvote to the provided song', () => {
      const song: Song = {
        songName: 'Feather',
        artistName: 'Sabrina Carpenter',
        videoId: 'abc',
      };

      const expectedSongQueueItem: SongQueueItem = {
        song,
        numUpvotes: 1,
        numDownvotes: 0,
      };

      jukebox.addSongToQueue(song);

      jukebox.voteOnSongInQueue(song, 'Upvote');
      expect(jukebox.queue[0]).toEqual(expectedSongQueueItem);
    });
    it('should add an upvote to the correct provided song and sorts', () => {
      const song1: Song = {
        songName: 'Sue Me',
        artistName: 'Sabrina Carpenter',
        videoId: 'xyz',
      };
      const song2: Song = {
        songName: 'Feather',
        artistName: 'Sabrina Carpenter',
        videoId: 'abc',
      };
      const song3: Song = {
        songName: 'Roses',
        artistName: 'Chainsmokers',
        videoId: 'def',
      };

      const expectedSongQueueItem: SongQueueItem = {
        song: song2,
        numUpvotes: 1,
        numDownvotes: 0,
      };

      jukebox.addSongToQueue(song1);
      jukebox.addSongToQueue(song2);
      jukebox.addSongToQueue(song3);

      jukebox.voteOnSongInQueue(song2, 'Upvote');
      expect(jukebox.queue[0]).toEqual(expectedSongQueueItem);
    });
    it('should add a downvote to the provided song', () => {
      const song: Song = {
        songName: "Driver's License",
        artistName: 'Olivia Rodrigo',
        videoId: 'ghi',
      };

      const expectedSongQueueItem: SongQueueItem = {
        song,
        numUpvotes: 0,
        numDownvotes: 1,
      };

      jukebox.addSongToQueue(song);

      jukebox.voteOnSongInQueue(song, 'Downvote');
      expect(jukebox.queue[0]).toEqual(expectedSongQueueItem);
    });
    it('should add an downvote to the correct provided song and sorts', () => {
      const song1: Song = {
        songName: 'Sue Me',
        artistName: 'Sabrina Carpenter',
        videoId: 'xyz',
      };
      const song2: Song = {
        songName: "Driver's License",
        artistName: 'Olivia Rodrigo',
        videoId: 'ghi',
      };
      const song3: Song = {
        songName: 'Roses',
        artistName: 'Chainsmokers',
        videoId: 'def',
      };

      const expectedSongQueueItem: SongQueueItem = {
        song: song2,
        numUpvotes: 0,
        numDownvotes: 1,
      };

      jukebox.addSongToQueue(song1);
      jukebox.addSongToQueue(song2);
      jukebox.addSongToQueue(song3);

      jukebox.voteOnSongInQueue(song2, 'Downvote');
      expect(jukebox.queue[2]).toEqual(expectedSongQueueItem);
    });
  });

  describe('playNextSongInQueue', () => {
    it('should play the next song in the queue', () => {
      const song1: Song = {
        songName: 'Sue Me',
        artistName: 'Sabrina Carpenter',
        videoId: 'xyz',
      };
      const song2: Song = {
        songName: 'Feather',
        artistName: 'Sabrina Carpenter',
        videoId: 'abc',
      };

      jukebox.addSongToQueue(song1);
      jukebox.addSongToQueue(song2);

      expect(jukebox.curSong).toEqual(undefined);
      expect(jukebox.queue.length).toEqual(2);

      jukebox.playNextSongInQueue();
      expect(jukebox.curSong).toEqual(song1);
      expect(jukebox.queue.length).toEqual(1);

      jukebox.playNextSongInQueue();
      expect(jukebox.curSong).toEqual(song2);
      expect(jukebox.queue.length).toEqual(0);

      jukebox.playNextSongInQueue();
      expect(jukebox.curSong).toEqual(undefined);
      expect(jukebox.queue.length).toEqual(0);
    });
  });
});
