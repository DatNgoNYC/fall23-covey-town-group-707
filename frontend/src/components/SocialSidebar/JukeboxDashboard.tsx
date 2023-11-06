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

/**
 * Displays a song, the song name and artist name for the song
 */
function SongDisplay({ song }: { song: Song }): JSX.Element {
  return (
    <>
      <Text>Song name: {song.songName}</Text>
      <Text>Artist name: {song.artistName}</Text>
    </>
  );
}

/**
 * Displays each song in the queue
 *
 * Displays the song name, artist name for each item in queue
 * Also displays upvote and downvote buttons
 * Also displays upvote and downvote count next to its corresponding button
 */
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

/**
 * Displays information in the jukebox for a JukeboxAreaController
 *
 * Displays the current song playing, the queue of songs.
 *
 * See relevant hooks: useTownController.
 */
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
                handleVote={(vote, songVotedOn) => controller.vote(vote, songVotedOn)}
              />
            </ListItem>
          );
        })}
      </OrderedList>
    </Box>
  );
}

/**
 * Displays information in the jukebox
 *
 * See relevant hooks: useTownController.
 */
export default function JukeboxDashboard(): JSX.Element {
  const townController = useTownController();
  const jukeboxAreaController = townController.jukeboxAreas;

  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Jukebox Area:
      </Heading>
      {jukeboxAreaController.map(controller => (
        <JukeboxDashboardView controller={controller} key={controller.id} />
      ))}
      <Button>Suggest Song</Button>
    </Box>
  );
}
