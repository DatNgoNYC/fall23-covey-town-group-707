import _ from 'lodash';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import { JukeboxArea as JukeboxAreaModel, JukeboxVote, Song, SongQueueItem } from '../../types/CoveyTownSocket';
import { useEffect, useState } from 'react';
import TownController from '../TownController';

export type JukeboxAreaEvents = BaseInteractableEventMap & {
  curSongChanged: (curSong: Song | undefined) => void;
  queueChanged: (queue: SongQueueItem[]) => void;
};

export default class JukeboxAreaController extends InteractableAreaController<
  JukeboxAreaEvents,
  JukeboxAreaModel
> {
  private _model: JukeboxAreaModel;

  protected _townController: TownController;

  constructor(id: string, queue: SongQueueItem[] = [], townController: TownController, curSong?: Song) {
    super(id);
    this._townController = townController;
    this._model = {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'JukeboxArea',
      curSong,
      queue,
    };
  }

  get curSong(): Song | undefined {
    return this._model.curSong;
  }

  set curSong(song: Song | undefined) {
    this._model.curSong = song;
  }

  get queue(): SongQueueItem[] {
    return this._model.queue;
  }

  set queue(queue: SongQueueItem[]) {
    this._model.queue = [...queue];
  }

  toInteractableAreaModel(): JukeboxAreaModel {
    return this._model;
  }

  protected _updateFrom(newModel: JukeboxAreaModel): void {
    if (this.curSong !== newModel.curSong) {
      this.emit('curSongChanged', newModel.curSong);
    }

    if (_.isEqual(this.queue, newModel.queue)) {
      this.emit('queueChanged', newModel.queue);
    }

    this._model = newModel;
  }

  public isActive(): boolean {
    return this.occupants.length > 0;
  }

  public async vote(jukeboxVote: JukeboxVote, song: Song) {
    await this._townController.sendInteractableCommand(this.id, {
      type: 'VoteOnSongInQueue',
      song: song,
      vote: jukeboxVote,
    });
  }
}

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
