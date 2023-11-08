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
} from '@chakra-ui/react';
import React from 'react';

type SuggestionFormProps = {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
};

function SuggestionForm(): JSX.Element {
  /* - song and artist input will use form input component
  - results will be a scrollable flex container. chakra has a flex container.
  - Search and addtoqueue should be wrapped around containers so we can justify it to the right */
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
        <Button>search</Button>
        <Button>add</Button>
      </Flex>
    </Container>
  );
}

export default function SuggestionFormWrapper({ showForm, setShowForm }: SuggestionFormProps): JSX.Element {
  return (
    <Modal isOpen={showForm} onClose={() => {setShowForm(false)}} closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent minH='80vh'>
        <ModalHeader>{'Song Suggest'}</ModalHeader>
        <ModalCloseButton />
        <SuggestionForm />
      </ModalContent>
    </Modal>
  );
}