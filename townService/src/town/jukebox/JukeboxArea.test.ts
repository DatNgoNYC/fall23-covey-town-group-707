import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import {
  AddSongToQueueCommand,
  Song,
  TownEmitter,
  ViewingAreaUpdateCommand,
  VoteOnSongInQueueCommand,
  ViewingArea as ViewingAreaModel,
  JoinGameCommand,
} from '../../types/CoveyTownSocket';
import JukeboxArea from './JukeboxArea';
import ViewingArea from '../ViewingArea';

describe('JukeboxArea', () => {
  let jukeboxArea: JukeboxArea;
  let viewingArea: ViewingArea;
  let song1: Song;
  let song2: Song;
  let song3: Song;
  let song4: Song;
  let song5: Song;
  let song6: Song;

  beforeEach(() => {
    const id = nanoid();

    viewingArea = new ViewingArea(
      { id, isPlaying: false, elapsedTimeSec: 0, occupants: [] },
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    jukeboxArea = new JukeboxArea(
      id,
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
      viewingArea,
    );

    song1 = {
      songName: 'Sugar',
      artistName: 'Maroon 5',
      videoId: 'abc',
    };
    song2 = {
      songName: 'Senorita',
      artistName: 'Shawn Mendes',
      videoId: 'def',
    };
    song3 = {
      songName: 'Travel',
      artistName: 'Mamamoo',
      videoId: 'ghi',
    };
    song4 = {
      songName: 'abcdefu',
      artistName: 'Gayle',
      videoId: 'jkl',
    };
    song5 = {
      songName: 'Starry Nights',
      artistName: 'Mamamoo',
      videoId: 'mno',
    };
    song6 = {
      songName: 'Blank Space',
      artistName: 'Taylor Swift',
      videoId: 'xyz',
    };
  });

  describe('handleCommand', () => {
    describe('AddSongToQueue', () => {
      let command1: AddSongToQueueCommand;
      let command2: AddSongToQueueCommand;

      beforeEach(() => {
        command1 = { type: 'AddSongToQueue', song: song1 };
        command2 = { type: 'AddSongToQueue', song: song2 };
      });

      describe('when there is no current song playing', () => {
        it('should play the given song', () => {
          const updateModelSpy = jest.spyOn(jukeboxArea, 'updateModel');
          expect(jukeboxArea.toModel().curSong).toEqual(undefined);

          jukeboxArea.handleCommand(command1);

          const newJukeboxAreaModel = jukeboxArea.toModel();
          const newViewingAreaModel = {
            id: jukeboxArea.id,
            occupants: [],
            type: 'ViewingArea',
            video: `https://www.youtube.com/watch?v=${song1.videoId}`,
            isPlaying: true,
            elapsedTimeSec: 0,
          };

          expect(updateModelSpy).toHaveBeenCalledTimes(1);
          expect(updateModelSpy).toHaveBeenCalledWith(newViewingAreaModel);

          expect(newJukeboxAreaModel.curSong).toEqual(song1);
          expect(newJukeboxAreaModel.queue.length).toEqual(0);
          expect(newJukeboxAreaModel.videoPlayer).toEqual(newViewingAreaModel);
        });
      });

      describe('when there is a song already playing', () => {
        it('should add the given song to the queue', () => {
          expect(jukeboxArea.toModel().curSong).toEqual(undefined);

          jukeboxArea.handleCommand(command1);

          const firstJukeboxAreaModel = jukeboxArea.toModel();

          expect(firstJukeboxAreaModel.curSong).toEqual(song1);
          expect(firstJukeboxAreaModel.queue.length).toEqual(0);

          jukeboxArea.handleCommand(command2);

          const secondJukeboxAreaModel = jukeboxArea.toModel();

          expect(secondJukeboxAreaModel.curSong).toEqual(song1);
          expect(secondJukeboxAreaModel.queue.length).toEqual(1);
          expect(secondJukeboxAreaModel.queue[0]).toEqual({
            song: song2,
            numUpvotes: 0,
            numDownvotes: 0,
          });
        });
      });
    });

    describe('VoteOnSongInQueue', () => {
      let upvoteCommand: VoteOnSongInQueueCommand;
      let downvoteCommand: VoteOnSongInQueueCommand;

      beforeEach(() => {
        // add all the songs to the queue
        // Note: song5 will be set as the currently playing song
        jukeboxArea.handleCommand({ type: 'AddSongToQueue', song: song5 });
        jukeboxArea.handleCommand({ type: 'AddSongToQueue', song: song3 });
        jukeboxArea.handleCommand({ type: 'AddSongToQueue', song: song4 });
        expect(jukeboxArea.toModel().queue.length).toEqual(2);

        upvoteCommand = { type: 'VoteOnSongInQueue', song: song3, vote: 'Upvote' };
        downvoteCommand = { type: 'VoteOnSongInQueue', song: song4, vote: 'Downvote' };
      });

      it('should add an upvote to the given song', () => {
        expect(jukeboxArea.toModel().queue.find(e => e.song.videoId === song3.videoId)).toEqual({
          song: song3,
          numUpvotes: 0,
          numDownvotes: 0,
        });

        jukeboxArea.handleCommand(upvoteCommand);

        expect(jukeboxArea.toModel().queue.find(e => e.song.videoId === song3.videoId)).toEqual({
          song: song3,
          numUpvotes: 1,
          numDownvotes: 0,
        });
      });

      it('should add a downvote to the given song', () => {
        expect(jukeboxArea.toModel().queue.find(e => e.song.videoId === song4.videoId)).toEqual({
          song: song4,
          numUpvotes: 0,
          numDownvotes: 0,
        });

        jukeboxArea.handleCommand(downvoteCommand);

        expect(jukeboxArea.toModel().queue.find(e => e.song.videoId === song4.videoId)).toEqual({
          song: song4,
          numUpvotes: 0,
          numDownvotes: 1,
        });
      });
    });

    describe('ViewingAreaUpdate', () => {
      beforeEach(() => {
        // Note: song1 will be set as the currently playing song
        jukeboxArea.handleCommand({ type: 'AddSongToQueue', song: song3 });
      });

      it('should update the viewing area if the song is still playing', () => {
        jukeboxArea.handleCommand({ type: 'AddSongToQueue', song: song4 });
        jukeboxArea.handleCommand({ type: 'AddSongToQueue', song: song5 });
        expect(jukeboxArea.toModel().queue.length).toEqual(2);

        expect(jukeboxArea.toModel().videoPlayer).toEqual({
          id: jukeboxArea.id,
          video: 'https://www.youtube.com/watch?v=ghi',
          isPlaying: true,
          elapsedTimeSec: 0,
          occupants: [],
          type: 'ViewingArea',
        });

        // update currently playing song
        const newViewingAreaModel: ViewingAreaModel = {
          id: jukeboxArea.id,
          video: 'https://www.youtube.com/watch?v=abc',
          isPlaying: true,
          elapsedTimeSec: 20,
          occupants: [],
          type: 'ViewingArea',
        };

        const updateCommand: ViewingAreaUpdateCommand = {
          type: 'ViewingAreaUpdate',
          update: newViewingAreaModel,
        };

        jukeboxArea.handleCommand(updateCommand);

        expect(jukeboxArea.toModel().videoPlayer).toEqual(newViewingAreaModel);
        expect(jukeboxArea.toModel().queue.length).toEqual(2);
      });

      describe('when the current song playing ends', () => {
        it('should update the viewing area with the next song in queue', () => {
          jukeboxArea.handleCommand({ type: 'AddSongToQueue', song: song4 });
          jukeboxArea.handleCommand({ type: 'AddSongToQueue', song: song5 });
          expect(jukeboxArea.toModel().queue.length).toEqual(2);

          expect(jukeboxArea.toModel().videoPlayer).toEqual({
            id: jukeboxArea.id,
            video: 'https://www.youtube.com/watch?v=ghi',
            isPlaying: true,
            elapsedTimeSec: 0,
            occupants: [],
            type: 'ViewingArea',
          });

          // update currently playing song
          const songEndedModel: ViewingAreaModel = {
            id: jukeboxArea.id,
            video: 'https://www.youtube.com/watch?v=abc',
            isPlaying: false,
            elapsedTimeSec: 20,
            occupants: [],
            type: 'ViewingArea',
          };

          const expectedNewModel: ViewingAreaModel = {
            id: jukeboxArea.id,
            video: 'https://www.youtube.com/watch?v=jkl',
            isPlaying: true,
            elapsedTimeSec: 0,
            occupants: [],
            type: 'ViewingArea',
          };

          const updateCommand: ViewingAreaUpdateCommand = {
            type: 'ViewingAreaUpdate',
            update: songEndedModel,
          };

          jukeboxArea.handleCommand(updateCommand);

          expect(jukeboxArea.toModel().videoPlayer).toEqual(expectedNewModel);
          expect(jukeboxArea.toModel().curSong).toEqual(song4);
          expect(jukeboxArea.toModel().queue).toEqual([
            { song: song5, numUpvotes: 0, numDownvotes: 0 },
          ]);
        });

        it('should set song/video to be undefined if there is no next song in queue', () => {
          expect(jukeboxArea.toModel().queue.length).toEqual(0);

          const songEndedModel: ViewingAreaModel = {
            id: jukeboxArea.id,
            video: 'https://www.youtube.com/watch?v=abc',
            isPlaying: false,
            elapsedTimeSec: 100,
            occupants: [],
            type: 'ViewingArea',
          };

          const expectedNewModel: ViewingAreaModel = {
            id: jukeboxArea.id,
            occupants: jukeboxArea.occupantsByID,
            type: 'ViewingArea',
            video: undefined,
            isPlaying: false,
            elapsedTimeSec: 0,
          };

          const nextUpdateCommand: ViewingAreaUpdateCommand = {
            type: 'ViewingAreaUpdate',
            update: songEndedModel,
          };

          jukeboxArea.handleCommand(nextUpdateCommand);
          expect(jukeboxArea.toModel().videoPlayer).toEqual(expectedNewModel);
          expect(jukeboxArea.toModel().curSong).toEqual(undefined);
        });
      });
    });

    describe('Invalid Command', () => {
      it('should throw an error if the command is not supported', () => {
        const invalidCommand: JoinGameCommand = { type: 'JoinGame' };

        expect(() => jukeboxArea.handleCommand(invalidCommand)).toThrowError(
          'Unknown command type',
        );
      });
    });
  });
});
