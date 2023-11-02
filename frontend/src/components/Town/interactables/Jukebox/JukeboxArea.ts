import Interactable, { KnownInteractableTypes } from '../../Interactable';

export default class JukeboxArea extends Interactable {
  getType(): KnownInteractableTypes {
    throw new Error('Method not implemented.');
  }
}
