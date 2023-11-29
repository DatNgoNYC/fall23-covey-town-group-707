import {
  Box,
  Button,
  Container,
  Flex,
  Image,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Song } from '../../types/CoveyTownSocket';
import { searchSong } from './YoutubeSearch';
import assert from 'assert';
import useTownController from '../../hooks/useTownController';

type SuggestionFormWrapperProps = {
  isOpen: boolean;
  handleClose: () => void;
};

type ResultsContainerProps = {
  songs: Song[];
  onClickHandler: (song: Song) => void;
  chosenSong: Song | undefined;
};
type ResultCardProps = {
  song: Song;
  onClickHandler: (song: Song) => void;
  chosenSong: Song | undefined;
};

function ResultCard({ song, onClickHandler, chosenSong }: ResultCardProps): JSX.Element {
  return (
    <Flex
      bg={chosenSong?.videoId === song.videoId ? 'teal.50' : 'white'}
      onClick={() => {
        onClickHandler(song);
      }}
      direction='row'
      align='center'
      maxW='100%'
      maxH='150px'
      overflow='hidden'>
      <Image
        maxW='50%'
        minW='50%'
        src={`https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg`}
        alt=''
      />
      <Box
        flex='1' // Takes up the other half of the width
        p='2' // Padding for song info
        textAlign='left'>
        <p className='name'>{song.songName}</p>
        <p className='artist'>{song.artistName}</p>
      </Box>
    </Flex>
  );
}

function ResultsContainer({
  songs,
  onClickHandler,
  chosenSong,
}: ResultsContainerProps): JSX.Element {
  const resultsContainerStyling: React.CSSProperties = {
    gap: '20px',
    overflowY: 'scroll',
  };

  return (
    <Stack style={resultsContainerStyling}>
      {songs.map(song => {
        return (
          <ResultCard
            key={song.videoId}
            song={song}
            onClickHandler={onClickHandler}
            chosenSong={chosenSong}
          />
        );
      })}
    </Stack>
  );
}

/* This is the modal content and what the user sees and interacts with. */
export function SuggestionForm(): JSX.Element {
  const townController = useTownController();
  const [songName, setSongName] = React.useState('');
  const [artistName, setArtistName] = React.useState('');
  const [results, setResults] = React.useState<Song[]>([]);
  const [song, setSong] = useState<Song>();
  const toast = useToast();

  const resultsClickHandler = (result: Song) => {
    setSong(result);
  };
  const searchEventHandler = async () => {
    const youtubeApiKey = process.env.NEXT_PUBLIC_TOWN_YOUTUBE_API_KEY;
    assert(youtubeApiKey, 'NEXT_PUBLIC_TOWN_YOUTUBE_API_KEY must be defined');
    try {
      const songs: Song[] = await searchSong({ songName, artistName, youtubeApiKey });
      setResults(songs);
    } catch (error) {
      toast({
        title: 'Error searching for song',
        description: (error as Error).toString(),
        status: 'error',
      });
    }
  };
  const queueEventHandler = async () => {
    try {
      if (song === undefined) {
        throw new Error('Song is not defined');
      }

      // We use the townController hook here so we can get the JukeboxArea and send the queue command to the backend.
      const controller = townController.jukeboxAreas.find(jukeboxAreaController => {
        if (jukeboxAreaController.occupantsByID.includes(townController.ourPlayer.id)) {
          return jukeboxAreaController;
        }
      });

      if (controller === undefined) {
        throw new Error('Area does not exist');
      } else {
        controller.queueSong(song);
      }
    } catch (error) {
      toast({
        title: 'Error queueing song',
        description: (error as Error).toString(),
        status: 'error',
      });
    }
  };

  return (
    <Container>
      <Flex marginBottom={`30px`}>
        <Flex>
          <Input
            aria-label='songName'
            placeholder='Song Name'
            onChange={event => {
              setSongName(event.target.value);
            }}
            onKeyDown={event => {
              // The character model will move around if we don't stop the key event propagation.
              event.stopPropagation();
            }}
          />
          <Input
            aria-label='artistName'
            placeholder='Artist Name'
            onChange={event => {
              setArtistName(event.target.value);
            }}
            onKeyDown={event => {
              event.stopPropagation();
            }}
          />
        </Flex>
        <Button aria-label='search' onClick={searchEventHandler}>
          Search
        </Button>
      </Flex>
      <ResultsContainer songs={results} onClickHandler={resultsClickHandler} chosenSong={song} />
      <Button aria-label='queue' onClick={queueEventHandler} marginTop={`30px`}>
        Add to Queue
      </Button>
    </Container>
  );
}

/* This is the wrapper for our form. It returns the modal component containing the main component implementing the suggestion features. */
export default function SuggestionFormWrapper({
  isOpen,
  handleClose,
}: SuggestionFormWrapperProps): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={handleClose} closeOnOverlayClick={false}>
      <ModalOverlay
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      />
      <ModalContent
        style={{
          padding: '20px',
          maxWidth: `calc(max(30vw, 550px))`,
          display: 'flex',
          flexDirection: 'column',
        }}>
        <ModalHeader>{'Suggest a song!'}</ModalHeader>
        <ModalCloseButton />
        <SuggestionForm />
      </ModalContent>
    </Modal>
  );
}
