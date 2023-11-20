// jest.mock('../../classes/interactable/JukeboxAreaController');
// jest.mock('../../classes/TownController');
// jest.mock('../../../../townService/src/town/jukebox/JukeboxArea');
// import { render, screen, waitFor } from '@testing-library/react';
// import { mock, mockDeep } from 'jest-mock-extended';
// import React from 'react';
// import TownController from '../../classes/TownController';
// import userEvent from '@testing-library/user-event';
// import { SuggestionForm } from './SuggestionForm';
// import JukeboxAreaController from '../../classes/interactable/JukeboxAreaController';
// import JukeboxArea from '../../../../townService/src/town/jukebox/JukeboxArea';
// import { nanoid } from 'nanoid';
// // import * as apiClient from './YoutubeSearch';
// jest.mock('./YoutubeSearch', () => {
//   return {
//     searchSong: jest.fn(async (songName: string, artistName: string): Promise<Song[]> => {
//       console.log(`songName: ${songName}, artistName: ${artistName}`);
//       return 'mock function' as unknown as Promise<Song[]>;
//     }),
//   };
// });
// import { Song, TownEmitter } from '../../../../townService/src/types/CoveyTownSocket';
// import ViewingArea from '../../../../townService/src/town/ViewingArea';
// import { searchSong } from './YoutubeSearch';

// describe('Suggestion form', () => {
//   const MockJukeboxAreaController = JukeboxAreaController as jest.Mock<JukeboxAreaController>;
//   const MockTownController = TownController as jest.Mock<TownController>;
//   const mockJukeboxArea = JukeboxArea as jest.MockedClass<typeof JukeboxArea>;
//   const mockJukeboxAreaInstance = new mockJukeboxArea(
//     nanoid(),
//     { x: 0, y: 0, width: 100, height: 100 },
//     mock<TownEmitter>(),
//     mock<ViewingArea>(),
//   );

//   let controller = new MockJukeboxAreaController(
//     nanoid(),
//     mockJukeboxAreaInstance,
//     new MockTownController(),
//   );

//   beforeEach(() => {
//     MockTownController.mockClear();
//     controller = new MockJukeboxAreaController(
//       nanoid(),
//       mockJukeboxAreaInstance,
//       new MockTownController(),
//     );
//   });

//   describe('Search Button', () => {
//     const spy = jest.spyOn(searchSong, 'searchSong');
//     spy.mockImplementation(async function (args_0): Promise<Song[]> {
//       console.log(`searchSong called with: ${JSON.stringify(args_0)}`);
//       return Promise.resolve(('mock purposes' as unknown) as Song[]);
//     });
//     beforeEach(() => {
//       spy.mockRestore();
//     });
//     it('should call the Youtube Search API client with the songName and artistName state', async () => {
//       render(
//         <SuggestionForm
//           controller={
//             new MockJukeboxAreaController('test', mockJukeboxAreaInstance, new MockTownController())
//           }
//         />,
//       );
//       // const songNameInput = screen.getByLabelText('songName');
//       // const artistNameInput = screen.getByLabelText('artistName');
//       const searchButton = screen.getByLabelText('search');

//       // await userEvent.type(songNameInput, "Devil's Advocate");
//       // await userEvent.type(artistNameInput, 'The Neighborhood');
//       await userEvent.click(searchButton);

//       await waitFor(() => {
//         expect(spy).toBeCalledTimes(1);
//       });
//     });
//     it('should show a toast when the api call fails', () => {});
//     it('should call the API client once', () => {});
//   });
//   describe('Queue Button', () => {
//     const spy = jest.spyOn(controller, 'queueSong');

//     beforeEach(() => {
//       spy.mockClear();
//     });
//     it('should call the JukeboxAreaController queueSong() method with the song state', () => {
//       render(
//         <SuggestionForm
//           controller={
//             new MockJukeboxAreaController('test', mockJukeboxAreaInstance, new MockTownController())
//           }
//         />,
//       );
//     });
//     it('should show a toast when the queueSong() method call fails', () => {
//       // test if jukeboxareacontroller's queue method is called and with the correct song?
//       // set state for song
//       // click the queue button
//       // expect it to be called once with the correct arguments, use mockJukeboxAreaController
//       // how do we actually render the component?
//     });
//     it('Should call the queue method once', () => {});
//   });
// });
