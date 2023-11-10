import InvalidParametersError from '../../lib/InvalidParametersError';
import {
  JukeboxVote,
  Song,
  SongQueueItem,
  ViewingArea as ViewingAreaModel,
} from '../../types/CoveyTownSocket';

const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';

/**
 * Represents a Jukebox object, which has a current song that's playing, and a
 * queue of songs that will play next.
 */
export default class Jukebox {
  // currently playing song
  private _curSong?: Song;

  // sorted queue of songs
  private _queue: SongQueueItem[];

  // represents state of the video playing in the area
  private _videoPlayer: ViewingAreaModel;

  /**
   * Creates a new Jukebox model with the provided parameters.
   *
   * If no song is provided, defaults to undefined.
   * If no queue is provided, defaults to an empty list.
   *
   * @param curSong the current song playing in the Jukebox
   * @param queue the songs in the queue to play next
   */
  constructor(
    curSong?: Song | undefined,
    queue: SongQueueItem[] = [],
    viewingAreaModel?: ViewingAreaModel,
  ) {
    this._curSong = curSong;
    this._queue = queue;

    if (viewingAreaModel) {
      this._videoPlayer = viewingAreaModel;
    } else {
      // we don't need id, occupants
      this._videoPlayer = {
        type: 'ViewingArea',
        id: '',
        occupants: [],
        video: this._formatSongURL(this._curSong),
        isPlaying: this._curSong !== undefined,
        elapsedTimeSec: 0,
      };
    }
  }

  /**
   * Creates a youtube video URL using the videoID property of the given song
   *
   * @param song to create URL for
   * @returns formatted URL if there's a song, or empty string if song is undefined
   */
  private _formatSongURL(song: Song | undefined) {
    if (song) {
      return `${YOUTUBE_URL}${song.videoId}`;
    }

    return '';
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

  /**
   * Gets the list of songs in the jukebox queue.
   *
   * The queue is sorted in descending order of upvotes - downvotes (net votes).
   */
  public get queue(): SongQueueItem[] {
    return this._queue;
  }

  /**
   * Gets the ViewingAreaModel for the video player of the jukebox.
   */
  public get videoPlayer(): ViewingAreaModel {
    return this._videoPlayer;
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

  /**
   * Adds the given vote to the song provided in the queue, and sorts the queue
   * to ensure that it remains sorted in descending order of net votes (upvotes - downvotes).
   *
   * @param song represents the song the user casts a vote on
   * @param vote represents the type of the vote - either upvote or downvote (JukeboxVote)
   * @throws InvalidParametersError if the song specified is not in the queue
   */
  public voteOnSongInQueue(song: Song, vote: JukeboxVote) {
    const songInQueue: SongQueueItem | undefined = this.queue.find(
      queueItem => queueItem.song.videoId === song.videoId,
    );

    if (songInQueue === undefined) {
      throw new InvalidParametersError('Song not in queue.');
    }

    if (vote === 'Upvote') {
      songInQueue.numUpvotes += 1;
    } else if (vote === 'Downvote') {
      songInQueue.numDownvotes += 1;
    }

    this._queue = this._queue.sort(
      (a, b) => b.numUpvotes - b.numDownvotes - (a.numUpvotes - a.numDownvotes),
    );
  }
}
