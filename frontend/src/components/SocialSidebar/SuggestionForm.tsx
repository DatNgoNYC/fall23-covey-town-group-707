import {
  Button,
  Container,
  Flex,
  Image,
  Image,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useToast,
  Stack,
  useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import JukeboxAreaController from '../../classes/interactable/JukeboxAreaController';
import { Song } from '../../types/CoveyTownSocket';
import { searchSong } from './YoutubeSearch';

type SuggestionFormWrapperProps = {
  controller: JukeboxAreaController;
type SuggestionFormWrapperProps = {
  controller: JukeboxAreaController;
  showForm: boolean;
  handleClose: () => void;
};
type SuggestionFormProps = {
  controller: JukeboxAreaController;
};
type ResultsContainerProps = {
  songs: Song[];
  onClickHandler: (song: Song) => void;
};
type ResultCardProps = {
  song: Song;
  onClickHandler: (song: Song) => void;
};

function ResultCard({ song, onClickHandler }: ResultCardProps): JSX.Element {
  return (
    <Flex
      onClick={() => {
        onClickHandler(song);
      }}>
      <Image
        flex={`1 1 0`}
        className='thumbnail'
        src={`https://img.youtube.com/vi/${song.videoId}/hqdefault.jpg`}
        alt=''
      />
      <Flex className='songInfo' flex={`1 1 0`} dir='vertical'>
        <p className='name'>{song.songName}</p>
        <p className='artist'>{song.artistName}</p>
      </Flex>
    </Flex>
  );
}

function ResultsContainer({ songs, onClickHandler }: ResultsContainerProps): JSX.Element {
  if (songs.length === 0) {
    return <></>;
  }

  return (
    <Stack>
      {songs.map((song, index) => {
        return (
          <ResultCard
            key={index}
            song={song}
            onClickHandler={() => {
              onClickHandler(song);
            }}
          />
        );
      })}
    </Stack>
  );
}

/* This is the modal content and what the user sees and interacts with. */
export function SuggestionForm({ controller }: SuggestionFormProps): JSX.Element {
  // use controller.queueSong(song:Song) later when we send the song to backend
  const [songName, setSongName] = React.useState('');
  const [artistName, setArtistName] = React.useState('');
  const [results, setResults] = React.useState<Song[]>([]);
  const [song, setSong] = useState<Song>();
  const toast = useToast();

  const resultsClickHandler = (result: Song) => {
    setSong(result);
  };
  const searchEventHandler = async () => {
    try {
      const songs: Song[] = await searchSong({ songName, artistName });
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
        return;
      }
      controller.queueSong(song);
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
      <ResultsContainer songs={results} onClickHandler={resultsClickHandler} />
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
      <ResultsContainer songs={results} onClickHandler={resultsClickHandler} />
      <Flex>
        <Button aria-label='search' onClick={searchEventHandler}>
          Search
        </Button>
        <Button aria-label='queue' onClick={queueEventHandler}>
          Add to Queue
        </Button>
        <Button aria-label='search' onClick={searchEventHandler}>
          Search
        </Button>
        <Button aria-label='queue' onClick={queueEventHandler}>
          Add to Queue
        </Button>
      </Flex>
    </Container>
  );
}

/* This is the wrapper for our form. It returns the modal component containing the main component implementing the suggestion features. */
/* This is the wrapper for our form. It returns the modal component containing the main component implementing the suggestion features. */
export default function SuggestionFormWrapper({
  controller,
  showForm,
  handleClose,
}: SuggestionFormWrapperProps): JSX.Element {
}: SuggestionFormWrapperProps): JSX.Element {
  return (
    <Modal isOpen={showForm} onClose={handleClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{'Suggest a song!'}</ModalHeader>
      <ModalContent>
        <ModalHeader>{'Suggest a song!'}</ModalHeader>
        <ModalCloseButton />
        <SuggestionForm controller={controller} />
        <SuggestionForm controller={controller} />
      </ModalContent>
    </Modal>
  );
}
