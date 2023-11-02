import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class JukeboxArea extends Interactable {
  private _isInteracting = false;

  /**
   * Building the scene for jukebox area
   */
  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);
    this.setDepth(-1);
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
  }

  /**
   * End interaction
   *
   * If it is currently interacting, emits a 'endInteraction' event with this AukeboxArea.
   * And also set _isInteracting to false
   */
  overlapExit(): void {
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  /**
   * Interact with area
   */
  interact(): void {
    this._isInteracting = true;
  }

  /**
   * Returns the type of the interactable
   */
  getType(): KnownInteractableTypes {
    return 'jukeboxArea';
  }
}
