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
    <Container backgroundColor={'blue'}>
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
  isOpen,
  handleClose,
}: SuggestionFormWrapperProps): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={handleClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{'Suggest a song!'}</ModalHeader>
        <ModalCloseButton />
        <SuggestionForm />
      </ModalContent>
    </Modal>
  );
}
