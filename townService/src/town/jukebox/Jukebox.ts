import InvalidParametersError from '../../lib/InvalidParametersError';
import { JukeboxVote, Song, SongQueueItem } from '../../types/CoveyTownSocket';

/**
 * Represents a Jukebox object, which has a current song that's playing, and a
 * queue of songs that will play next.
 */
export default class Jukebox {
  // currently playing song
  private _curSong?: Song;

  // sorted queue of songs
  private _queue: SongQueueItem[];

  /**
   * Creates a new Jukebox model with the provided parameters.
   *
   * If no song is provided, defaults to undefined.
   * If no queue is provided, defaults to an empty list.
   *
   * @param curSong the current song playing in the Jukebox
   * @param queue the songs in the queue to play next
   */
  constructor(curSong?: Song | undefined, queue: SongQueueItem[] = []) {
    this._curSong = curSong;
    this._queue = queue;
  }

  /**
   * Gets the song currently playing the jukebox.
   *
   * curSong can be undefined, which means that there is no song
   * currently playing.
   */
  public get curSong(): Song | undefined {
    return this._curSong;
  }

  public set curSong(song: Song | undefined) {
    this._curSong = song;
  }

  /**
   * Gets the list of songs in the jukebox queue.
   *
   * The queue is sorted in descending order of upvotes - downvotes (net votes).
   */
  public get queue(): SongQueueItem[] {
    return this._queue;
  }

  public set queue(queue: SongQueueItem[]) {
    this._queue = queue;
  }

  /**
   * Adds the given song to the jukebox queue. The queue item is initialized
   * with 0 upvotes and 0 downvotes.
   *
   * @param song represents the song to add
   * @throws InvalidParametersError if the song is already in the queue
   */
  public addSongToQueue(song: Song) {
    if (this.queue.filter(queueSong => queueSong.song.videoId === song.videoId).length !== 0) {
      throw new InvalidParametersError('Song already in queue.');
    }

    this._queue.push({ song, numUpvotes: 0, numDownvotes: 0 });
  }

  public playNextSongInQueue() {
    const nextSongInQueue = this.queue.shift();
    this._curSong = nextSongInQueue?.song;
  }

  /**
   * Adds the given vote to the song provided in the queue, and sorts the queue
   * to ensure that it remains sorted in descending order of net votes (upvotes - downvotes).
   * Filters out any songs that have downvotes from over 50% of the occupants.
   * Does not do anything if the vote cast is the same as the player's previous vote on the song.
   *
   * @param song represents the song the user casts a vote on
   * @param vote represents the type of the vote
   * @throws InvalidParametersError if the song specified is not in the queue
   */
  public voteOnSongInQueue(
    song: Song,
    vote: JukeboxVote,
    prevVote: JukeboxVote,
    numOccupants: number,
  ) {
    const songInQueue: SongQueueItem | undefined = this.queue.find(
      queueItem => queueItem.song.videoId === song.videoId,
    );

    if (songInQueue === undefined) {
      throw new InvalidParametersError('Song not in queue.');
    }

    if (vote !== prevVote) {
      switch (vote) {
        case 'Upvote': {
          songInQueue.numUpvotes += 1;
          songInQueue.numDownvotes -= prevVote === 'None' ? 0 : 1;

          break;
        }
        case 'Downvote':
          songInQueue.numDownvotes += 1;
          songInQueue.numUpvotes -= prevVote === 'None' ? 0 : 1;

          break;
        case 'None':
        default:
          break;
      }

      this._queue = this._queue
        .filter(songQueueItem => songQueueItem.numDownvotes <= 0.5 * numOccupants)
        .sort((a, b) => b.numUpvotes - b.numDownvotes - (a.numUpvotes - a.numDownvotes));
    }
  }
}
