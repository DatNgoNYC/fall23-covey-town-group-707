import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  InteractableCommand,
  InteractableCommandReturnType,
  JukeboxArea as JukeboxAreaModel,
  Song,
  TownEmitter,
  ViewingArea as ViewingAreaModel,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import Jukebox from './Jukebox';
import ViewingArea from '../ViewingArea';
import Player from '../../lib/Player';

/**
 * Represents an interactable area on the map that contains a Jukebox.
 */
export default class JukeboxArea extends InteractableArea {
  private _jukebox: Jukebox;

  private _viewingArea: ViewingArea;

  public constructor(
    id: string,
    { x, y, width, height }: BoundingBox,
    townEmitter: TownEmitter,
    viewingArea: ViewingArea,
  ) {
    super(id, { x, y, width, height }, townEmitter);

    this._viewingArea = viewingArea;
    this._jukebox = new Jukebox(undefined, []);
  }

  /**
   * Provides the model representation of the state of jukebox in the interactable area.
   * @returns the model representation of the jukebox property
   */
  public toModel(): JukeboxAreaModel {
    return {
      id: this.id,
      occupants: this.occupantsByID,
      type: 'JukeboxArea',
      curSong: this._jukebox.curSong,
      queue: this._jukebox.queue,
      videoPlayer: this._viewingArea.toModel(),
    };
  }

  public get isActive(): boolean {
    return true;
  }

  /**
   * Updates the state of this ViewingArea, setting the video, isPlaying and progress properties
   *
   * @param viewingArea updated model
   */
  public updateModel(newViewingAreaModel: ViewingAreaModel) {
    this._viewingArea.updateModel(newViewingAreaModel);
  }

  /**
   * Adds a new player to this interactable area.
   *
   * Adds the player to this area's occupants array, sets the player's interactableID, informs players in the town
   * that the player's interactableID has changed, and informs players in the town that the area has changed.
   *
   * Assumes that the player specified is a member of this town.
   *
   * @param player Player to add
   */
  public add(player: Player): void {
    super.add(player);
    this._viewingArea.add(player);
  }

  /**
   * Removes a player from this interactable area.
   *
   * Removes the player from this area's occupants array, clears the player's interactableID, informs players in the town
   * that the player's interactableID has changed, and informs players in the town that the area has changed
   *
   * Assumes that the player specified is an occupant of this interactable area
   *
   * @param player Player to remove
   */
  public remove(player: Player): void {
    super.remove(player);
    this._viewingArea.remove(player);
  }

  /**
   * Given a list of players, adds all of the players that are within this interactable area
   *
   * @param allPlayers list of players to examine and potentially add to this interactable area
   */
  public addPlayersWithinBounds(allPlayers: Player[]) {
    super.addPlayersWithinBounds(allPlayers);
    this._viewingArea.addPlayersWithinBounds(allPlayers);
  }

  /**
   * Creates a youtube video URL using the videoID property of the given song
   *
   * @param song to create URL for
   * @returns formatted URL if there's a song, or empty string if song is undefined
   */
  private _formatSongURL(song: Song | undefined) {
    const youtubeURL = 'https://www.youtube.com/watch?v=';

    if (song) {
      return `${youtubeURL}${song.videoId}`;
    }

    return '';
  }

  /**
   * Handles commands sent to the JukeboxArea by a user in this interactable area.
   *
   * Supported commands:
   * - AddSongToQueue -> adds the provided song to the jukebox's queue
   * - VoteOnSongInQueue -> casts the provided vote on the given song in the queue
   *
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @param command represents the command to handle
   * @param player player making the request
   * @returns the interactable command return type defined for the respective command
   *  (undefined for the currently supported commands)
   * - InvalidParametersError if the command is not supported or is invalid
   * - Any command besides AddSongToQueue, VoteOnSongInQueue: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
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

    // pass to viewing area's handle method if it's none of the jukebox commands
    // if not a valid command, this will throw an error
    return this._viewingArea.handleCommand(command);
  }

  /**
   * Creates a new JukeboxArea object that will represent a Jukebox Area object in the town map.
   *
   * @param mapObject An ITiledMapObject that represents a rectangle in which this conversation area exists
   * @param broadcastEmitter An emitter that can be used by this conversation area to broadcast updates
   * @returns a new Jukebox area with the bounding box created from the input map object nad broadcastEmitter
   * @throws error if the area is not correctly formed
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): JukeboxArea {
    const { name, width, height } = mapObject;

    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }

    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };

    const viewingArea = ViewingArea.fromMapObject(mapObject, broadcastEmitter);

    return new JukeboxArea(name, rect, broadcastEmitter, viewingArea);
  }
}
