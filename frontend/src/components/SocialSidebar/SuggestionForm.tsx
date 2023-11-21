import {
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
import JukeboxAreaController from '../../classes/interactable/JukeboxAreaController';
import { Song } from '../../types/CoveyTownSocket';
import { searchSong } from './YoutubeSearch';
import assert from 'assert';

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
      {songs.map(song => {
        return <ResultCard key={song.videoId} song={song} onClickHandler={onClickHandler} />;
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
      <Flex>
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
export default function SuggestionFormWrapper({
  controller,
  showForm,
  handleClose,
}: SuggestionFormWrapperProps): JSX.Element {
  return (
    <Modal isOpen={showForm} onClose={handleClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{'Suggest a song!'}</ModalHeader>
        <ModalCloseButton />
        <SuggestionForm controller={controller} />
      </ModalContent>
    </Modal>
  );
}
