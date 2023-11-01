import { Box, Button, HStack, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import useTownController from '../../hooks/useTownController';
import JukeboxAreaController, {
  useJukeboxAreaCurSong,
  useJukeboxAreaQueue,
} from '../../classes/interactable/JukeboxAreaController';
import React from 'react';
import { JukeboxVote, Song, SongQueueItem } from '../../types/CoveyTownSocket';

type JukeboxAreaViewProps = {
  controller: JukeboxAreaController;
};

type SongQueueItemDisplayProps = {
  songQueueItem: SongQueueItem;
  handleVote: (jukeboxVote: JukeboxVote, song: Song) => void;
};

function SongDisplay({ song }: { song: Song }): JSX.Element {
  return (
    <>
      <Heading as='h4' fontSize='m'>
        Song name: {song.songName}
      </Heading>
      <Heading as='h4' fontSize='m'>
        Artist name: {song.artistName}
      </Heading>
    </>
  );
}

function SongQueueItemDisplay({
  songQueueItem,
  handleVote,
}: SongQueueItemDisplayProps): JSX.Element {
  return (
    <HStack>
      <SongDisplay song={songQueueItem.song} />
      <Button onClick={() => handleVote('Upvote', songQueueItem.song)} aria-label='Upvote'>
        Upvote
      </Button>
      <Button onClick={() => handleVote('Downvote', songQueueItem.song)} aria-label='Downvote'>
        Downvote
      </Button>
    </HStack>
  );
}

function JukeboxDashboardView({ controller }: JukeboxAreaViewProps): JSX.Element {
  const song = useJukeboxAreaCurSong(controller);
  const queue = useJukeboxAreaQueue(controller);

  // make text bold

  return (
    <Box>
      <Heading as='h3' fontSize='m'>
        Current song playing:
      </Heading>
      <SongDisplay song={song} />
      <Heading as='h3' fontSize='m'>
        Song queue::
      </Heading>
      <OrderedList>
        {queue.map(queueItem => {
          return (
            <ListItem key={queueItem.song.videoId}>
              <SongQueueItemDisplay
                songQueueItem={queueItem}
                handleVote={async (vote, songVotedOn) => controller.vote(vote, songVotedOn)}
              />
            </ListItem>
          );
        })}
      </OrderedList>
    </Box>
  );
}

export default function JukeboxDashboard(): JSX.Element {
  const townController = useTownController();
  const jukeboxAreaController = townController.jukeboxAreas;
  // const curSong = jukeboxAreaController.curSong;

  // if (jukeboxAreaController.length === 0) {
  //   return <></>;
  // } else {
  console.log(jukeboxAreaController.length.toString())
  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Jukebox Area:
      </Heading>
      hi
      {jukeboxAreaController.map(controller => (
        <JukeboxDashboardView controller={controller} key={controller.id} />
      ))}
    </Box>
  );
  // }
}
