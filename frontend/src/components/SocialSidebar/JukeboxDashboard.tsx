import { Box, Button, HStack, Heading, ListItem, OrderedList, Text } from '@chakra-ui/react';
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
      <Text>
        Song name: {song.songName}
      </Text>
      <Text>
        Artist name: {song.artistName}
      </Text>
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

  return (
    <Box>
      <Heading as='h3' fontSize='m'>
        Current song playing:
      </Heading>
      <SongDisplay song={song} />
      <Heading as='h3' fontSize='m'>
        Song queue:
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

  console.log(jukeboxAreaController.length.toString())
  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Jukebox Area:
      </Heading>
      {jukeboxAreaController.map(controller => (
        <JukeboxDashboardView controller={controller} key={controller.id} />
      ))}
      <Button>
        Suggest Song
      </Button>
    </Box>
  );
  // }
}
