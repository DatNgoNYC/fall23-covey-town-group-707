import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import {
  AddSongToQueueCommand,
  TownEmitter,
  ViewingAreaUpdateCommand,
  VoteOnSongInQueueCommand,
  ViewingArea as ViewingAreaModel,
  JoinGameCommand,
} from '../../types/CoveyTownSocket';
import JukeboxArea from './JukeboxArea';
import ViewingArea from '../ViewingArea';
import Player from '../../lib/Player';

describe('JukeboxArea', () => {
  let jukeboxArea: JukeboxArea;
  let viewingArea: ViewingArea;

  const song1 = {
    songName: 'Style',
    artistName: 'Taylor Swift',
    videoId: 'abc',
  };
  const song2 = {
    songName: 'Senorita',
    artistName: 'Shawn Mendes',
    videoId: 'def',
  };
  const song3 = {
    songName: 'Travel',
    artistName: 'Mamamoo',
    videoId: 'ghi',
  };
  const song4 = {
    songName: 'abcdefu',
    artistName: 'Gayle',
    videoId: 'jkl',
  };
  const song5 = {
    songName: 'Starry Nights',
    artistName: 'Mamamoo',
    videoId: 'mno',
  };

  const townEmitter = mock<TownEmitter>();

  const player1: Player = new Player('player1', townEmitter);
  const player2: Player = new Player('player2', townEmitter);

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
  });

  describe('Test toModel', () => {
    it('creates the correct jukebox area model', () => {
      const model = {
        id: jukeboxArea.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: viewingArea.toModel(),
      };
      expect(jukeboxArea.toModel()).toEqual(model);
    });
  });
  describe('Test updateModel', () => {
    it('updates the viewing area with the one passed in', () => {
      const model = {
        id: jukeboxArea.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: viewingArea.toModel(),
      };
      const newViewingAreaModel: ViewingAreaModel = {
        id: jukeboxArea.id,
        occupants: [],
        type: 'ViewingArea',
        video: `https://www.youtube.com/watch?v=${song1.videoId}`,
        isPlaying: true,
        elapsedTimeSec: 0,
      };
      const newModel = {
        id: jukeboxArea.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: newViewingAreaModel,
      };

      expect(jukeboxArea.toModel()).toEqual(model);
      jukeboxArea.updateModel(newViewingAreaModel);
      expect(jukeboxArea.toModel()).toEqual(newModel);
    });
  });
  describe('Test add', () => {
    it('adds a player to the interactable area', () => {
      const model = {
        id: jukeboxArea.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: viewingArea.toModel(),
      };
      const newViewingAreaModel: ViewingAreaModel = {
        id: jukeboxArea.id,
        occupants: [player1.id],
        type: 'ViewingArea',
        video: undefined,
        isPlaying: false,
        elapsedTimeSec: 0,
      };
      const newModel = {
        id: jukeboxArea.id,
        occupants: [player1.id],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: newViewingAreaModel,
      };

      expect(jukeboxArea.toModel()).toEqual(model);
      jukeboxArea.add(player1);
      expect(jukeboxArea.toModel()).toEqual(newModel);
      expect(jukeboxArea.occupants).toEqual([player1]);

      jukeboxArea.add(player2);
      expect(jukeboxArea.occupants).toEqual([player1, player2]);
    });
  });
  describe('Test remove', () => {
    it('removes a player from the interactable area', () => {
      const model = {
        id: jukeboxArea.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: viewingArea.toModel(),
      };
      const newViewingAreaModel: ViewingAreaModel = {
        id: jukeboxArea.id,
        occupants: [player2.id],
        type: 'ViewingArea',
        video: undefined,
        isPlaying: false,
        elapsedTimeSec: 0,
      };
      const newModel = {
        id: jukeboxArea.id,
        occupants: [player2.id],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: newViewingAreaModel,
      };

      expect(jukeboxArea.toModel()).toEqual(model);
      jukeboxArea.add(player1);
      jukeboxArea.add(player2);
      expect(jukeboxArea.occupants).toEqual([player1, player2]);

      jukeboxArea.remove(player1);
      expect(jukeboxArea.occupants).toEqual([player2]);
      expect(jukeboxArea.toModel()).toEqual(newModel);

      jukeboxArea.remove(player2);
      expect(jukeboxArea.occupants).toEqual([]);
      expect(jukeboxArea.toModel()).toEqual(model);
    });
  });
  describe('Test addPlayersWithinBounds', () => {
    it('adds all players passed in the given array', () => {
      const model = {
        id: jukeboxArea.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: viewingArea.toModel(),
      };
      const newViewingAreaModel: ViewingAreaModel = {
        id: jukeboxArea.id,
        occupants: [player1.id, player2.id],
        type: 'ViewingArea',
        video: undefined,
        isPlaying: false,
        elapsedTimeSec: 0,
      };
      const newModel = {
        id: jukeboxArea.id,
        occupants: [player1.id, player2.id],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: newViewingAreaModel,
      };

      expect(jukeboxArea.toModel()).toEqual(model);
      jukeboxArea.addPlayersWithinBounds([player1, player2]);
      expect(jukeboxArea.occupants).toEqual([player1, player2]);
      expect(jukeboxArea.toModel()).toEqual(newModel);
    });
  });
  describe('Test handleCommand', () => {
    describe('test command AddSongToQueue', () => {
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

    describe('test command VoteOnSongInQueue', () => {
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

      it('should add an upvote to the given song when given an upvote', () => {
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

      it('should add a downvote to the given song when given a downvote', () => {
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

    describe('test command ViewingAreaUpdate', () => {
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

    describe('when given an invalid command', () => {
      it('should throw an error if the command is not supported', () => {
        const invalidCommand: JoinGameCommand = { type: 'JoinGame' };

        expect(() => jukeboxArea.handleCommand(invalidCommand)).toThrowError(
          'Unknown command type',
        );
      });
    });
  });
});
