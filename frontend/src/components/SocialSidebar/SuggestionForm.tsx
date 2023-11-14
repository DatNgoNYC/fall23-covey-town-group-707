import {
  Button,
  Container,
  Flex,
  Input,
  ListItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  OrderedList,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Song } from '../../../../shared/types/CoveyTownSocket';

type SuggestionFormProps = {
  showForm: boolean;
  handleClose: () => void;
};

function SuggestionForm({handleSearch}:{handleSearch: (searchResults: Song[]) => void}): JSX.Element {
  /* - song and artist input will use form input component
  - results will be a scrollable flex container. chakra has a flex container.
  - Search and addtoqueue should be wrapped around containers so we can justify it to the right */

  // return <Button onClick={() => searchSong("Style", "Taylor Swift")}>search</Button>;

  function searchSong({songName, artistName, handleSearch} : {songName: string, artistName: string, handleSearch: (searchResults: Song[]) => void}){
    console.log("HERE");
    const YOUTUBE_API_KEY = `AIzaSyAwJ9S1H92Mx9QqbEMBrDew49NxfMcar6w`;
    console.log(YOUTUBE_API_KEY);
    const searchTerm = `${songName}+${artistName}`;
    const numResults = 10;
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${numResults}&q=${searchTerm}&key=${YOUTUBE_API_KEY}`;
    url = encodeURI(url);
    console.log(url);

    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log(data.items);
        console.log(data.items[0].id.videoId);
        // console.log(data.items[1].id.videoId);
        let searchResults:Song[] = [];
        data.items.map(result => {
          searchResults.push({songName: result.snippet.title, artistName: result.snippet.channelTitle, videoId: result.id.videoId});
        })
        handleSearch(searchResults);
    });
}

  return (
    <Container>
      <Input placeholder='Song name' />
      <Input placeholder='Artist name' />
      <Flex overflow={'scroll'} flexDirection='column' maxH={`50vh`}>
        <Container></Container>
        <Container></Container>
        <Container></Container>
      </Flex>
      <Flex>
        <Button onClick={() => searchSong({songName: "Style", artistName: "Taylor Swift", handleSearch: handleSearch})}>search</Button>
        <Button>add</Button>
      </Flex>
    </Container>
  );
}

function SearchResultDisplay({searchResult}:{searchResult: Song[]}): JSX.Element {
  if (searchResult.length == 0) {
    return <></>;
  }
  return (
    <OrderedList>
        {searchResult.map(searchResultItem => {
          return (
            <ListItem key={searchResultItem.videoId}>
              {searchResultItem.songName}
              {searchResultItem.artistName}
            </ListItem>
          );
        })}
      </OrderedList>
  )
}

export default function SuggestionFormWrapper({
  showForm,
  handleClose,
}: SuggestionFormProps): JSX.Element {
  const [searchResult, setSearchResult] = useState<Song[]>([]);
  return (
    <Modal isOpen={showForm} onClose={handleClose} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent minH='80vh'>
        <ModalHeader>{'Song Suggest'}</ModalHeader>
        <ModalCloseButton />
        <SuggestionForm handleSearch={setSearchResult}/>
        <SearchResultDisplay searchResult={searchResult}/>
      </ModalContent>
    </Modal>
  );
}
