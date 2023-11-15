import {
  Button,
  Container,
  Flex,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import JukeboxAreaController from '../../classes/interactable/JukeboxAreaController';
import { Song } from '../../types/CoveyTownSocket';

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
    <div
      onClick={() => {
        onClickHandler(song);
      }}>
      <div className='thumbnail'>`create api for video thumbnail`</div>
      <div className='songInfo'>
        <div className='name'>{song.songName}</div>
        <div className='artist'>{song.artistName}</div>
      </div>
    </div>
  );
}

function ResultsContainer({ songs, onClickHandler }: ResultsContainerProps): JSX.Element {
  if (songs.length === 0) {
    return <></>;
  }

  return (
    <Stack>
      {songs.map(song => {
        <ResultCard
          song={song}
          onClickHandler={() => {
            onClickHandler(song);
          }}
        />;
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

  const resultsClickHandler = (result: Song) => {
    setSong(result);
  };
  const searchEventHandler = async () => {
    try {
      if (!song) {
        // error toast - we should disable the button later too though
      }

      const mockYoutubeAPI = (mockSong: { songName: string; artistName: string }) => {
        return [{ songName: mockSong.songName, artistName: mockSong.artistName, videoId: 'null' }];
      };

      const songs: Song[] = mockYoutubeAPI({ songName, artistName });
      setResults(songs);
    } catch (error) {
      // toast the error
    }
  };
  const queueEventHandler = async () => {
    try {
      if (song === undefined) {
        return; //toast: "you need to pick a song first" also grey out the button when song not selected
      }
      controller.queueSong(song);
    } catch (error) {
      // toast the error
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
