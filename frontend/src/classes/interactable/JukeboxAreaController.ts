import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import {
  JukeboxArea as JukeboxAreaModel,
  JukeboxVote,
  Song,
  SongQueueItem,
} from '../../types/CoveyTownSocket';
import { useEffect, useState } from 'react';
import TownController from '../TownController';

export type JukeboxAreaEvents = BaseInteractableEventMap & {
  curSongChanged: (curSong: Song | undefined) => void;
  queueChanged: (queue: SongQueueItem[]) => void;
};

/**
 * This class is responsible for managing the state of the jukebox area, and for sending commands to the server
 */
export default class JukeboxAreaController extends InteractableAreaController<
  JukeboxAreaEvents,
  JukeboxAreaModel
> {
  private _model: JukeboxAreaModel;

  protected _townController: TownController;

  /**
   * Constructor to create a JukeboxAreaController
   */
  constructor(
    id: string,
    townController: TownController,
    curSong?: Song,
    queue: SongQueueItem[] = [],
    model?: JukeboxAreaModel,
  ) {
    super(id);
    this._townController = townController;

    if (model) {
      this._model = model;
    } else {
      this._model = {
        id: this.id,
        occupants: this.occupants.map(player => player.id),
        type: 'JukeboxArea',
        curSong,
        queue,
      };
    }
  }

  /**
   * Returns the song that is currently playing
   */
  get curSong(): Song | undefined {
    return this._model.curSong;
  }

  /**
   * Set the song that is currently playing to the input value
   */
  set curSong(song: Song | undefined) {
    this._model.curSong = song;
  }

  /**
   * Returns the queue of songs
   */
  get queue(): SongQueueItem[] {
    return this._model.queue;
  }

  /**
   * Set the queue of songs to the input value
   */
  set queue(queue: SongQueueItem[]) {
    this._model.queue = [...queue];
  }

  /**
   * Return a representation of this JukeboxAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  toInteractableAreaModel(): JukeboxAreaModel {
    return this._model;
  }

  /**
   * Checks if the two given songs are the same.
   *
   * @param songOne first song to compare with
   * @param songTwo second song to compare
   * @returns true if both songs have the same values for the properties
   */
  private _isSongSame(songOne: Song | undefined, songTwo: Song | undefined) {
    // videoID is the unique identifier for a song, so we check to
    // see if the videoID is the same
    return songOne?.videoId === songTwo?.videoId;
  }

  /**
   * Checks if the two given queues are the same.
   *
   * @param queueOne first queue to compare with
   * @param queueTwo second queue to compare
   * @returns true if both queues have the same songs, in the same order in the list
   */
  private _isQueueSame(queueOne: SongQueueItem[], queueTwo: SongQueueItem[]) {
    if (queueOne.length !== queueTwo.length) {
      return false;
    }

    for (let i = 0; i < queueOne.length; i++) {
      if (
        !this._isSongSame(queueOne[i].song, queueTwo[i].song) ||
        queueOne[i].numUpvotes !== queueTwo[i].numUpvotes ||
        queueOne[i].numDownvotes !== queueTwo[i].numDownvotes
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Updates the internal state of this JukeboxAreaController to match the new model.
   *
   * It updates the current song, song queue of this jukebox area, and this._model.
   *
   * If the current song has changed, emits a 'curSongChanged' event with the new current song. If the current song has not changed,
   *  does not emit the event.
   *
   * If the queue has changed, emits a 'queueChanged' event with true if it is our turn, and false otherwise.
   * If the queue has not changed, does not emit the event.
   *
   * @param newModel the model to update the controller
   */
  protected _updateFrom(newModel: JukeboxAreaModel): void {
    if (!this._isSongSame(this.curSong, newModel.curSong)) {
      this.emit('curSongChanged', newModel.curSong);
    }

    if (!this._isQueueSame(this.queue, newModel.queue)) {
      this.emit('queueChanged', newModel.queue);
    }

    this._model = newModel;
  }

  /**
   * @returns true if the game has occupants
   */
  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  /**
   * Sends a request to the server to vote on a song in queue
   *
   * @param jukeboxVote Whether it is a upvote or downvote
   * @param song The song to vote on
   */
  public async vote(jukeboxVote: JukeboxVote, song: Song) {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'VoteOnSongInQueue',
      song: song,
      vote: jukeboxVote,
    });
  }
}

/**
 * A react hook to retrieve the current playing song of a JukeboxAreaController.
 * If there is currently no song playing, then we will return a song object where the song name and artist name are both "No song playing...".
 *
 * This hook will re-render any components that use it when the topic changes.
 *
 * @param controller the controller whose current song to use
 * @returns the current song or a song with songName and artistName as "No song playing..." if current song is undefined
 */
export function useJukeboxAreaCurSong(controller: JukeboxAreaController): Song {
  const [curSong, setCurSong] = useState(controller.curSong);
  const noSongPlaying: Song = {
    songName: 'No song playing...',
    artistName: 'No song playing...',
    videoId: '',
  };

  useEffect(() => {
    controller.addListener('curSongChanged', setCurSong);

    return () => {
      controller.removeListener('curSongChanged', setCurSong);
    };
  }, [controller]);

  return curSong || noSongPlaying;
}

/**
 * A react hook to retrieve the queue of songs of a JukeboxAreaController.
 * If there is no song in the queue, then we will return an empty list
 *
 * This hook will re-render any components that use it when the topic changes.
 *
 * @param controller the controller whose song queue to use
 * @returns the queue
 */
export function useJukeboxAreaQueue(controller: JukeboxAreaController): SongQueueItem[] {
  const [queue, setQueue] = useState(controller.queue);

  useEffect(() => {
    controller.addListener('queueChanged', setQueue);

    return () => {
      controller.removeListener('queueChanged', setQueue);
    };
  }, [controller]);

  return queue;
}
