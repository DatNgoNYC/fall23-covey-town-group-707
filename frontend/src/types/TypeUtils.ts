import {
  ConversationArea,
  Interactable,
  TicTacToeGameState,
  ViewingArea,
  GameArea,
  JukeboxArea,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

export function isTicTacToeArea(
  interactable: Interactable,
): interactable is GameArea<TicTacToeGameState> {
  return interactable.type === 'TicTacToeArea';
}

/**
 * Test to see if an interactable is a jukebox area
 *
 * @param interactable represents the interactable to type check
 * @returns true if the given interactable is a jukebox area
 */
export function isJukeboxArea(interactable: Interactable): interactable is JukeboxArea {
  return interactable.type === 'JukeboxArea';
}
