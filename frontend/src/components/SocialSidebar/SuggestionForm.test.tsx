import { render, screen } from '@testing-library/react';
import React from 'react';
import TownController from '../../classes/TownController';
import userEvent from '@testing-library/user-event';
import { SuggestionForm } from './SuggestionForm';
import JukeboxAreaController from '../../classes/interactable/JukeboxAreaController';
import { nanoid } from 'nanoid';
jest.mock('../../classes/interactable/JukeboxAreaController');
jest.mock('../../classes/TownController');

describe('Suggestion form', () => {
  const MockTownController = TownController as jest.Mock<TownController>;
  let controller = new JukeboxAreaController(nanoid(), new MockTownController());

  beforeEach(() => {
    MockTownController.mockClear();
    controller = new JukeboxAreaController(nanoid(), new MockTownController());
  });

  describe('Search Button', () => {
    // const spy = jest.spyOn(apiClientModuleReference, 'callApi');
    beforeEach(() => {
      // spy.mockRestore();
    });
    it('should call the Youtube Search API client with the songName and artistName state', async () => {
      render(
        <SuggestionForm controller={new JukeboxAreaController('test', new MockTownController())} />,
      );
      const songNameInput = screen.getByPlaceholderText('Song Name');
      const artistNameInput = screen.getByPlaceholderText('Artist Name');
      const searchButton = screen.getByRole('button', { name: 'search' });

      await userEvent.type(songNameInput, "Devil's Advocate");
      await userEvent.type(artistNameInput, 'The Neighborhood');
      await userEvent.click(searchButton);

      // expect(spy).toBeCalledTimes(1);
      // expect(spy).toBeCalledWith(...);
    });
    it('should show a toast when the api call fails', () => {});
    it('should call the API client once', () => {});
  });
  describe('Queue Button', () => {
    const spy = jest.spyOn(controller, 'queueSong');

    beforeEach(() => {
      spy.mockClear();
    });
    it('should call the JukeboxAreaController queueSong() method with the song state', () => {
      render(
        <SuggestionForm controller={new JukeboxAreaController('test', new MockTownController())} />,
      );
    });
    it('should show a toast when the queueSong() method call fails', () => {
      // test if jukeboxareacontroller's queue method is called and with the correct song?
      // set state for song
      // click the queue button
      // expect it to be called once with the correct arguments, use mockJukeboxAreaController
      // how do we actually render the component?
    });
    it('Should call the queue method once', () => {});
  });
});
