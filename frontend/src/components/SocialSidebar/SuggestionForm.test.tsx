import { getByPlaceholderText, render, screen } from '@testing-library/react';
import SuggestionForm from './SuggestionForm';
import React from 'react';
import JukeboxAreaController from '../../classes/interactable/JukeboxAreaController';
import { userEvent } from '@testing-library/user-event/dist/types/setup';
import TownController from '../../classes/TownController';
import { Song } from '../../types/CoveyTownSocket';
jest.mock('../../classes/interactable/JukeboxAreaController');
jest.mock('../../classes/TownController');

const MockJukeboxAreaController = JukeboxAreaController as jest.Mock<JukeboxAreaController>;
const MockTownController = TownController as jest.Mock<TownController>;

beforeEach(() => {});

describe('Suggestion form', () => {
  describe('Search Button', () => {
    it('should call the Youtube Search API client with the songName and artistName state', async () => {
      // render component using render(), have to
      render(
        <SuggestionForm
          controller={new MockJukeboxAreaController()}
          showForm={false}
          handleClose={function (): void {
            throw new Error('Function not implemented.');
          }}
        />,
      );
      // type into the songName using testing-library keyboard()
      const songNameInput = screen.getByPlaceholderText('Song Name');

      await userEvent.type(songNameInput, 'Catcat Doll');

      // type into artistName
      // click search button, should be called once and with the states we set above
      //
    });
    //fail
    it('should call the API client once', () => {});
  });
  describe('Queue Button', () => {
    it('should call the JukeboxAreaController queueSong() method with the song state', () => {
      // test if jukeboxareacontroller's queue method is called and with the correct song?
      // set state for song
      // click the queue button
      // expect it to be called once with the correct arguments, use mockJukeboxAreaController
      // how do we actually render the component?
    });
    it('Should call the queue method once', () => {});
    //fail
  });
});
