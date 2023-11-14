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

export function JukeboxVideoPlayerWrapper(): JSX.Element {
  const jukeboxArea = useInteractable<JukeboxArea>('jukeboxArea');

  if (jukeboxArea) {
    return <JukeboxVideoPlayer interactableID={jukeboxArea.name} />;
  }

  return <></>;
}
