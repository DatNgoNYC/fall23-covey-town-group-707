import InvalidParametersError from '../../lib/InvalidParametersError';
import { JukeboxVote, Song, SongQueueItem } from '../../types/CoveyTownSocket';

export default class Jukebox {
  private _curSong?: Song;

  private _queue: SongQueueItem[] = [];

  public get curSong(): Song | undefined {
    return this._curSong;
  }

  public get queue(): SongQueueItem[] {
    return this._queue;
  }

  public addSongToQueue(song: Song) {
    if (this.queue.filter(queueSong => queueSong.song.videoId === song.videoId).length !== 0) {
      throw new InvalidParametersError('Song already in queue.');
    }

    this._queue.push({ song, numUpvotes: 0, numDownvotes: 0 });
  }

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
