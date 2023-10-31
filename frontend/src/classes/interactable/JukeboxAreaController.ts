import _ from 'lodash';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';
import { JukeboxArea as JukeboxAreaModel, Song, SongQueueItem } from '../../types/CoveyTownSocket';

export type JukeboxAreaEvents = BaseInteractableEventMap & {
  curSongChanged: (curSong: Song | undefined) => void;
  queueChanged: (queue: SongQueueItem[]) => void;
};

export default class JukeboxAreaController extends InteractableAreaController<
  JukeboxAreaEvents,
  JukeboxAreaModel
> {
  private _model: JukeboxAreaModel;

  constructor(id: string, curSong?: Song, queue: SongQueueItem[] = []) {
    super(id);
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
}
