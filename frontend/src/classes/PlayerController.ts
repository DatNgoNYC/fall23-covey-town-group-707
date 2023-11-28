import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import {
  Player as PlayerModel,
  PlayerLocation,
  Emotion,
  DanceMove,
} from '../types/CoveyTownSocket';
export const MOVEMENT_SPEED = 175;

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
  emotion: (newEmotion: Emotion) => void;
  dance: (newDanceMove: DanceMove) => void;
};

export type PlayerGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean /* For the local player, the game scene will calculate the current location, and we should NOT apply updates when we receive events */;
};
export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private _emotion: Emotion;
  
  private _danceMove: DanceMove | undefined;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PlayerGameObjects;

  constructor(
    id: string,
    userName: string,
    location: PlayerLocation,
    emotion?: Emotion,
    danceMove?: DanceMove | undefined,
  ) {
    super();
    this._id = id;
    this._userName = userName;
    this._location = location;
    // default emotion is neutral
    this._emotion = emotion ? emotion : 'NEUTRAL';
    this._danceMove = danceMove;
  }

  set location(newLocation: PlayerLocation) {
    this._location = newLocation;
    this._updateGameComponentLocation();
    this.emit('movement', newLocation);
  }

  get location(): PlayerLocation {
    return this._location;
  }

  set danceMove(newDanceMove: DanceMove | undefined) {
    this._danceMove = newDanceMove;
    this._updateSpriteDanceMove();
  }

  get danceMove(): DanceMove | undefined {
    return this._danceMove;
  }

  set emotion(newEmotion: Emotion) {
    this._emotion = newEmotion;
    this._updateSpriteEmotion();
  }

  get emotion(): Emotion {
    return this._emotion;
  }
  
  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  toPlayerModel(): PlayerModel {
    return {
      id: this.id,
      userName: this.userName,
      location: this.location,
      emotion: this.emotion,
      danceMove: this.danceMove,
    };
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite, label } = this.gameObjects;
      if (!sprite.anims) return;
      sprite.setX(this.location.x);
      sprite.setY(this.location.y);
      if (this.location.moving) {
        sprite.anims.play(`misa-${this.location.rotation}-walk`, true);
        switch (this.location.rotation) {
          case 'front':
            sprite.body.setVelocity(0, MOVEMENT_SPEED);
            break;
          case 'right':
            sprite.body.setVelocity(MOVEMENT_SPEED, 0);
            break;
          case 'back':
            sprite.body.setVelocity(0, -MOVEMENT_SPEED);
            break;
          case 'left':
            sprite.body.setVelocity(-MOVEMENT_SPEED, 0);
            break;
        }
        sprite.body.velocity.normalize().scale(175);
      } else {
        sprite.body.setVelocity(0, 0);
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${this.location.rotation}`);
      }
      label.setX(sprite.body.x);
      label.setY(sprite.body.y - 20);
    }
  }

  private _updateSpriteDanceMove() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite } = this.gameObjects;
      if (!sprite.anims) return;
      // when avatar is dancing
      if (this.danceMove) {
        switch (this.danceMove) {
          case 'Disco':
            sprite.anims.play('misa-disco', true);
            break;
          case 'Bob':
            sprite.anims.play('misa-bob', true);
            break;
          case 'Beyonce':
            sprite.anims.play('misa-beyonce', true);
            break;
          case 'Spin':
            sprite.anims.play('misa-spin', true);
            break;
        }
      } else {
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-front`);
      }
    }
  }

  private _updateSpriteEmotion() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite } = this.gameObjects;

      switch (this.emotion) {
        case 'HAPPY':
          sprite.setTexture('atlas', 'misa-happy');
          break;
        case 'ANGRY':
          sprite.setTexture('atlas', 'misa-angry');
          break;
        case 'FEAR':
          sprite.setTexture('atlas', 'misa-fear');
          break;
        case 'SAD':
          sprite.setTexture('atlas', 'misa-sad');
          break;
        case 'SURPRISED':
          sprite.setTexture('atlas', 'misa-surprised');
          break;
        case 'CONFUSED':
          sprite.setTexture('atlas', 'misa-confused');
          break;
        case 'DISGUSTED':
          sprite.setTexture('atlas', 'misa-disgusted');
          break;
        case 'NEUTRAL':
        default:
          sprite.setTexture('atlas', 'misa-front');
          break;
      }
    }
  }

  static fromPlayerModel(modelPlayer: PlayerModel): PlayerController {
    return new PlayerController(
      modelPlayer.id,
      modelPlayer.userName,
      modelPlayer.location,
      modelPlayer.emotion,
      modelPlayer.danceMove,
    );
  }
}
