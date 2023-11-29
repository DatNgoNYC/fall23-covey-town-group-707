import {
  Box,
  Button,
  HStack,
  Heading,
  IconButton,
  ListItem,
  OrderedList,
  StackDivider,
  Text,
  VStack,
} from '@chakra-ui/react';
import useTownController from '../../hooks/useTownController';
import JukeboxAreaController, {
  useJukeboxAreaCurSong,
  useJukeboxAreaQueue,
} from '../../classes/interactable/JukeboxAreaController';
import React, { useEffect, useState } from 'react';
import { JukeboxVote, Song, SongQueueItem } from '../../types/CoveyTownSocket';
import PlayerController from '../../classes/PlayerController';
import { useInteractableAreaOccupants } from '../../classes/interactable/InteractableAreaController';
import SuggestionFormWrapper from './SuggestionForm';
import { AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import { MdOutlineLibraryMusic, MdOutlineSpaceBar } from 'react-icons/md';
import { Bs1Square, Bs2Square, Bs3Square, Bs4Square } from 'react-icons/bs';

interface UseSuggestionFormModalResult {
  isOpen: boolean;
  toggleModal: () => void;
}

export function useSuggestionFormModal(): UseSuggestionFormModalResult {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    toggleModal,
  };
}

type JukeboxAreaViewProps = {
  controller: JukeboxAreaController;
  ourPlayer: PlayerController;
  toggleModal: () => void;
};

type SongQueueItemDisplayProps = {
  songQueueItem: SongQueueItem;
  handleVote: (jukeboxVote: JukeboxVote, song: Song, prevVote: JukeboxVote) => void;
};

/**
 * Displays a song, the song name and artist name for the song
 */
function SongDisplay({ song }: { song: Song }): JSX.Element {
  const songSubstring = song.songName.substring(0, 35);
  const artistSubstring = song.artistName.substring(0, 35);

  return (
    <Box>
      <h4 style={{ color: 'teal' }}>Song name:</h4>
      <Text>{song.songName.length <= 35 ? songSubstring : songSubstring.concat('...')}</Text>
      <h4 style={{ color: 'teal' }}>Artist name:</h4>
      <Text>{song.artistName.length <= 35 ? artistSubstring : artistSubstring.concat('...')}</Text>
    </Box>
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
  const [prevVote, setPrevVote] = useState<JukeboxVote>('None');

  const handleUpvote = () => {
    handleVote('Upvote', songQueueItem.song, prevVote);
    setPrevVote('Upvote');
  };

  const handleDownvote = () => {
    handleVote('Downvote', songQueueItem.song, prevVote);
    setPrevVote('Downvote');
  };

  return (
    <VStack>
      <SongDisplay song={songQueueItem.song} />
      <Box>
        <HStack>
          <IconButton
            variant={prevVote === 'Upvote' ? 'solid' : 'outline'}
            colorScheme='teal'
            size='sm'
            fontSize='20px'
            icon={<AiOutlineLike />}
            onClick={handleUpvote}
            aria-label='Upvote'>
            Upvote
          </IconButton>
          <Text>{songQueueItem.numUpvotes}</Text>
          <IconButton
            variant={prevVote === 'Downvote' ? 'solid' : 'outline'}
            colorScheme='teal'
            size='sm'
            fontSize='20px'
            icon={<AiOutlineDislike />}
            onClick={handleDownvote}
            aria-label='Downvote'>
            Downvote
          </IconButton>
          <Text>{songQueueItem.numDownvotes}</Text>
        </HStack>
      </Box>
    </VStack>
  );
}

/**
 * Displays information in the jukebox for a JukeboxAreaController
 *
 * Displays the current song playing, the queue of songs.
 *
 * See relevant hooks: useTownController.
 */
function JukeboxDashboardView({
  controller,
  ourPlayer,
  toggleModal,
}: JukeboxAreaViewProps): JSX.Element {
  const occupants = useInteractableAreaOccupants(controller);
  const song = useJukeboxAreaCurSong(controller);
  const queue = useJukeboxAreaQueue(controller);

  if (occupants.filter(p => p === ourPlayer).length === 0) {
    return <></>;
  }

  return (
    <VStack
      align='left'
      spacing={2}
      borderColor='gray.500'
      height='100%'
      divider={<StackDivider borderColor='gray.200' />}
      borderRadius='4px'>
      <Box>
        <Heading as='h2' fontSize='l'>
          Jukebox Area:
        </Heading>
        <h4 style={{ color: 'teal' }}>Controls:</h4>
        <HStack>
          <Text>Press </Text>
          <MdOutlineSpaceBar color='teal' />
          <Text> (spacebar) to jam!</Text>
        </HStack>
        <HStack>
          <Text>Hold </Text>
          <Bs1Square color='teal' />
          <Bs2Square color='teal' />
          <Bs3Square color='teal' />
          <Bs4Square color='teal' />
          <Text> to dance!</Text>
        </HStack>
        <Button
          leftIcon={<MdOutlineLibraryMusic />}
          colorScheme='teal'
          variant='outline'
          size='sm'
          onClick={handleSuggestSong}>
          Suggest Song
        </Button>
        <SuggestionFormWrapper
          controller={controller}
          showForm={showForm}
          handleClose={handleClose}
        />
      </Box>
      <Box>
        <Heading as='h3' fontSize='m'>
          Current song playing:
        </Heading>
        <SongDisplay song={song} />
      </Box>
      <Box>
        <Heading as='h3' fontSize='m'>
          Song queue:
        </Heading>
        <Box overflowY='auto' maxH='220px'>
          <OrderedList>
            {queue.map(queueItem => {
              return (
                <ListItem key={queueItem.song.videoId}>
                  <SongQueueItemDisplay
                    songQueueItem={queueItem}
                    handleVote={(vote, songVotedOn, prevVote) =>
                      controller.vote(vote, songVotedOn, prevVote)
                    }
                  />
                </ListItem>
              );
            })}
          </OrderedList>
        </Box>
      </Box>
    </VStack>
  );
}

/**
 * Displays information in the jukebox
 *
 * See relevant hooks: useTownController.
 */
export default function JukeboxDashboard(): JSX.Element {
  const townController = useTownController();
  const { isOpen, toggleModal } = useSuggestionFormModal();

  // Add this useEffect to monitor changes in isOpen
  useEffect(() => {
    console.log('isOpen value in JukeboxDashboard:', isOpen);
  }, [isOpen]);

  return (
    <Box>
      {townController.jukeboxAreas.map(controller => (
        <JukeboxDashboardView
          controller={controller}
          ourPlayer={townController.ourPlayer}
          key={controller.id}
          toggleModal={toggleModal}
        />
      ))}
      <SuggestionFormWrapper isOpen={isOpen} handleClose={toggleModal} />
    </Box>
  );
}
