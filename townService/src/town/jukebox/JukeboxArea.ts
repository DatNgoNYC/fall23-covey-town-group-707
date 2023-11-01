import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  JukeboxArea as JukeboxAreaModel,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import Jukebox from './Jukebox';

export default class JukeboxArea extends InteractableArea {
  private _jukebox: Jukebox = new Jukebox();

  public toModel(): JukeboxAreaModel {
    return {
      id: this.id,
      occupants: this.occupants.map(player => player.id),
      type: 'JukeboxArea',
      curSong: this._jukebox.curSong,
      queue: this._jukebox.queue,
    };
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'AddSongToQueue') {
      this._jukebox.addSongToQueue(command.song);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'VoteOnSongInQueue') {
      this._jukebox.voteOnSongInQueue(command.song, command.vote);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }

    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }

  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): JukeboxArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new JukeboxArea(name, rect, broadcastEmitter);
  }
}
