import { Song, SongQueueItem } from '../../types/CoveyTownSocket';
import Jukebox from './Jukebox';

describe('Jukebox', () => {
  let jukebox: Jukebox;
  let song1: Song;
  let song2: Song;
  let song3: Song;
  let song4: Song;
  let song5: Song;
  let song6: Song;

  beforeEach(() => {
    jukebox = new Jukebox();

    song1 = {
      songName: 'Sue Me',
      artistName: 'Sabrina Carpenter',
      videoId: 'xyz',
    };
    song2 = {
      songName: 'Feather',
      artistName: 'Sabrina Carpenter',
      videoId: 'abc',
    };
    song3 = {
      songName: 'Roses',
      artistName: 'Chainsmokers',
      videoId: 'def',
    };
    song4 = {
      songName: 'Feather',
      artistName: 'Sabrina Carpenter',
      videoId: 'ghi',
    };
    song5 = {
      songName: "Driver's License",
      artistName: 'Olivia Rodrigo',
      videoId: 'ghi',
    };
    song6 = {
      songName: 'Bejeweled',
      artistName: 'Taylor Swift',
      videoId: 'jkl',
    };
  });

  describe('addSongToQueue', () => {
    it('should add the given song into the queue', () => {
      const expectedSongQueue: SongQueueItem[] = [
        {
          song: song1,
          numUpvotes: 0,
          numDownvotes: 0,
        },
        {
          song: song6,
          numUpvotes: 0,
          numDownvotes: 0,
        },
      ];

      jukebox.addSongToQueue(song1);
      jukebox.addSongToQueue(song6);

      expect(jukebox.queue.length).toEqual(2);
      expect(jukebox.queue).toEqual(expectedSongQueue);
    });
    it('should throw an error if the song is already in queue', () => {
      jukebox.addSongToQueue(song1);
      expect(jukebox.queue.length).toEqual(1);

      expect(() => jukebox.addSongToQueue(song1)).toThrowError('Song already in queue.');
      expect(jukebox.queue.length).toEqual(1);
    });
  });

  describe('voteOnSongInQueue', () => {
    it('should error if the provided song is not in the queue', () => {
      expect(() => jukebox.voteOnSongInQueue(song4, 'Upvote')).toThrowError('Song not in queue.');
    });
    it('should add an upvote to the provided song', () => {
      const expectedSongQueueItem: SongQueueItem = {
        song: song4,
        numUpvotes: 1,
        numDownvotes: 0,
      };

      jukebox.addSongToQueue(song4);

      jukebox.voteOnSongInQueue(song4, 'Upvote');
      expect(jukebox.queue[0]).toEqual(expectedSongQueueItem);
    });
    it('should add an upvote to the correct provided song and sorts', () => {
      const expectedSongQueue: SongQueueItem[] = [
        {
          song: song2,
          numUpvotes: 1,
          numDownvotes: 0,
        },
        {
          song: song1,
          numUpvotes: 0,
          numDownvotes: 0,
        },
        {
          song: song3,
          numUpvotes: 0,
          numDownvotes: 0,
        },
      ];

      jukebox.addSongToQueue(song1);
      jukebox.addSongToQueue(song2);
      jukebox.addSongToQueue(song3);

      jukebox.voteOnSongInQueue(song2, 'Upvote');
      expect(jukebox.queue).toEqual(expectedSongQueue);
    });
    it('should add a downvote to the provided song', () => {
      const expectedSongQueueItem: SongQueueItem = {
        song: song5,
        numUpvotes: 0,
        numDownvotes: 1,
      };

      jukebox.addSongToQueue(song5);

      jukebox.voteOnSongInQueue(song5, 'Downvote');
      expect(jukebox.queue[0]).toEqual(expectedSongQueueItem);
    });
    it('should add an downvote to the correct provided song and sorts', () => {
      const expectedSongQueue: SongQueueItem[] = [
        {
          song: song1,
          numUpvotes: 0,
          numDownvotes: 0,
        },
        {
          song: song3,
          numUpvotes: 0,
          numDownvotes: 0,
        },
        {
          song: song5,
          numUpvotes: 0,
          numDownvotes: 1,
        },
      ];

      jukebox.addSongToQueue(song1);
      jukebox.addSongToQueue(song5);
      jukebox.addSongToQueue(song3);

      jukebox.voteOnSongInQueue(song5, 'Downvote');
      expect(jukebox.queue).toEqual(expectedSongQueue);
    });
  });

  describe('playNextSongInQueue', () => {
    it('should play the next song in the queue', () => {
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
    });

    it("should set the current song as undefined if there's no next song in queue", () => {
      jukebox.addSongToQueue(song1);

      jukebox.playNextSongInQueue();
      expect(jukebox.curSong).toEqual(song1);
      expect(jukebox.queue.length).toEqual(0);

      jukebox.playNextSongInQueue();
      expect(jukebox.curSong).toEqual(undefined);
      expect(jukebox.queue.length).toEqual(0);
    });
  });
});
