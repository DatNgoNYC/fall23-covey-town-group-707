import React from 'react';
import { ViewingAreaVideo } from './ViewingAreaVideo';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import JukeboxArea from './JukeboxArea';
import { InteractableID } from '../../../types/CoveyTownSocket';
import JukeboxAreaController, {
  noSongPlaying,
  useJukeboxAreaCurSong,
  useJukeboxViewingAreaController,
} from '../../../classes/interactable/JukeboxAreaController';

/**
 *  The JukeboxVideoPlayer plays a song video, if the URL is set, using the ViewingAreaVideo component
 *
 * @param interactableID is the the ID of the Jukebox area
 * @returns the video player component if there's a song playing
 */
function JukeboxVideoPlayer({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const jukeboxAreaController =
    useInteractableAreaController<JukeboxAreaController>(interactableID);
  const viewingAreaController = useJukeboxViewingAreaController(jukeboxAreaController);

  const curSong = useJukeboxAreaCurSong(jukeboxAreaController);

  if (curSong.videoId !== noSongPlaying.videoId) {
    return <ViewingAreaVideo controller={viewingAreaController} />;
  }

  return <></>;
}

/**
 * Wrapper component for displaying the song video, if there's a jukebox area
 * @returns the video player component
 */
export function JukeboxVideoPlayerWrapper(): JSX.Element {
  const jukeboxArea = useInteractable<JukeboxArea>('jukeboxArea');

  if (jukeboxArea) {
    return <JukeboxVideoPlayer interactableID={jukeboxArea.name} />;
  }

  return <></>;
}
