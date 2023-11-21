import { nanoid } from 'nanoid';
import assert from 'assert';
import { mock } from 'jest-mock-extended';
import {
  JukeboxArea as JukeboxAreaModel,
  JukeboxVote,
  Song,
  SongQueueItem,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import JukeboxAreaController, {
  useJukeboxAreaCurSong,
  useJukeboxAreaQueue,
} from './JukeboxAreaController';
import TownController from '../TownController';
import ViewingArea from '../../components/Town/interactables/ViewingArea';

describe('JukeboxAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const players = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];
  const playerIds: string[] = players.map(player => player.id);
  const songs = [
    { songName: 'firework', artistName: 'katy perry', videoId: nanoid() },
    { songName: 'you belong with me', artistName: 'taylor swift', videoId: nanoid() },
    { songName: 'fireflies', artistName: 'owl city', videoId: nanoid() },
  ];
  const queueItems = [
    { song: songs[0], numUpvotes: 3, numDownvotes: 8 },
    { song: songs[1], numUpvotes: 22, numDownvotes: 0 },
    { song: songs[2], numUpvotes: 6, numDownvotes: 5 },
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...players],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  function jukeboxControllerWithProp({
    _id,
    occupants,
    queue,
    curSong,
    viewingArea,
    model,
  }: {
    _id?: string;
    occupants: string[];
    curSong?: Song;
    queue?: SongQueueItem[];
    viewingArea?: ViewingArea;
    model?: JukeboxAreaModel;
  }) {
    const id = _id || nanoid();
    const controllerModel: JukeboxAreaModel = model
      ? model
      : ({
          id: id,
          occupants: occupants,
          type: 'JukeboxArea',
          curSong: curSong,
          queue: queue || [],
          videoPlayer: viewingArea || {
            id: id,
            occupants: occupants,
            type: 'ViewingArea',
            video: undefined,
            isPlaying: false,
            elapsedTimeSec: 0,
          },
        } as JukeboxAreaModel);
    const ret = new JukeboxAreaController(id, controllerModel, mockTownController);
    return ret;
  }

  describe('Test isActive', () => {
    it('set to active if there are players in the area', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      expect(controller.occupants).toEqual([]);
      players.map(player => controller.occupants.push(player));
      expect(controller.occupants).toEqual(players);

      expect(controller.isActive()).toEqual(true);
    });
    it('is not active if there are no players in the area', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      expect(controller.occupants).toEqual([]);
      expect(controller.isActive()).toEqual(false);
    });
  });
  describe('Test toInteractableAreaModel', () => {
    test('model is created with correct values', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      const model: JukeboxAreaModel = {
        id: controller.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: undefined,
          isPlaying: false,
          elapsedTimeSec: 0,
        },
      };
      expect(controller.toInteractableAreaModel()).toEqual(model);
    });
    test('model has correct values after it has been changed', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      const model: JukeboxAreaModel = {
        id: controller.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: undefined,
          isPlaying: false,
          elapsedTimeSec: 0,
        },
      };
      expect(controller.toInteractableAreaModel()).toEqual(model);

      const modelChanged: JukeboxAreaModel = {
        id: controller.id,
        occupants: playerIds,
        type: 'JukeboxArea',
        curSong: songs[0],
        queue: [queueItems[1], queueItems[2]],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: 'abc',
          isPlaying: true,
          elapsedTimeSec: 15,
        },
      };
      controller.updateFrom(modelChanged, players);
      expect(controller.toInteractableAreaModel()).toEqual(modelChanged);
    });
  });
  describe('Test _updateFrom', () => {
    it('emits change for curSong if the song has changed', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      const emitSpy = jest.spyOn(controller, 'emit');
      const model: JukeboxAreaModel = {
        id: controller.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: songs[1],
        queue: [],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: 'def',
          isPlaying: true,
          elapsedTimeSec: 20,
        },
      };
      controller.updateFrom(model, []);
      const curSongChangedCalled = emitSpy.mock.calls.find(call => call[0] === 'curSongChanged');
      expect(curSongChangedCalled).toBeDefined();
      if (curSongChangedCalled) expect(curSongChangedCalled[1]).toEqual(songs[1]);
      expect(controller.toInteractableAreaModel()).toEqual(model);
    });
    it('emits chenge for queue if the queue has been changed', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      const emitSpy = jest.spyOn(controller, 'emit');
      const model: JukeboxAreaModel = {
        id: controller.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: queueItems,
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: undefined,
          isPlaying: false,
          elapsedTimeSec: 0,
        },
      };
      controller.updateFrom(model, []);
      const queueChangedCalled = emitSpy.mock.calls.find(call => call[0] === 'queueChanged');
      expect(queueChangedCalled).toBeDefined();
      if (queueChangedCalled) {
        expect(queueChangedCalled[1]).toEqual(queueItems);
      }
      expect(controller.toInteractableAreaModel()).toEqual(model);
    });
    test('model does not change if no change has occured', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      const emitSpy = jest.spyOn(controller, 'emit');
      const model: JukeboxAreaModel = {
        id: controller.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: undefined,
          isPlaying: false,
          elapsedTimeSec: 0,
        },
      };
      controller.updateFrom(model, []);
      const noSongChangeCalled = emitSpy.mock.calls.find(call => call[0] === 'curSongChanged');
      expect(noSongChangeCalled).not.toBeDefined();
      const noQueueChangeCalled = emitSpy.mock.calls.find(call => call[0] === 'queueChanged');
      expect(noQueueChangeCalled).not.toBeDefined();
      expect(controller.toInteractableAreaModel()).toEqual(model);
    });
    test('the model returned has the changes from the given model', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      const model: JukeboxAreaModel = {
        id: controller.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: undefined,
          isPlaying: false,
          elapsedTimeSec: 0,
        },
      };
      expect(controller.toInteractableAreaModel()).toEqual(model);

      const modelChanged: JukeboxAreaModel = {
        id: controller.id,
        occupants: playerIds,
        type: 'JukeboxArea',
        curSong: songs[0],
        queue: [queueItems[1], queueItems[2]],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: 'abc',
          isPlaying: true,
          elapsedTimeSec: 15,
        },
      };
      controller.updateFrom(modelChanged, players);
      expect(controller.toInteractableAreaModel()).toEqual(modelChanged);
    });
  });
  describe('Test vote', () => {
    it('increases votes for a song when given an upvote', async () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
        curSong: songs[0],
        queue: [queueItems[1], queueItems[2]],
      });

      const model: JukeboxAreaModel = {
        id: nanoid(),
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [{ song: songs[1], numUpvotes: 23, numDownvotes: 0 }, queueItems[2]],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: undefined,
          isPlaying: false,
          elapsedTimeSec: 0,
        },
      };

      expect(controller.queue[0].numUpvotes).toEqual(22);
      const vote: JukeboxVote = 'Upvote';
      await controller.vote(vote, songs[0]);

      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'VoteOnSongInQueue',
        song: songs[0],
        vote: vote,
      });

      controller.updateFrom(model, []);
      expect(controller.queue[0].numUpvotes).toEqual(23);
    });
    it('decreases votes for a song when given a downvote', async () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
        curSong: songs[0],
        queue: [queueItems[1], queueItems[2]],
      });

      const model: JukeboxAreaModel = {
        id: nanoid(),
        occupants: [],
        type: 'JukeboxArea',
        curSong: songs[0],
        queue: [queueItems[1], { song: songs[2], numUpvotes: 6, numDownvotes: 6 }],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: 'abc',
          isPlaying: true,
          elapsedTimeSec: 20,
        },
      };

      expect(controller.queue[1].numDownvotes).toEqual(5);
      const vote: JukeboxVote = 'Downvote';
      await controller.vote(vote, songs[2]);

      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'VoteOnSongInQueue',
        song: songs[2],
        vote: vote,
      });

      controller.updateFrom(model, []);
      expect(controller.queue[1].numDownvotes).toEqual(6);
    });
  });
  describe('Test queueSong', () => {
    it('adds a song to queue', async () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
        curSong: songs[0],
        queue: [],
      });

      const model: JukeboxAreaModel = {
        id: nanoid(),
        occupants: [],
        type: 'JukeboxArea',
        curSong: songs[0],
        queue: [queueItems[1]],
        videoPlayer: {
          id: controller.id,
          occupants: [],
          type: 'ViewingArea',
          video: 'abc',
          isPlaying: true,
          elapsedTimeSec: 20,
        },
      };

      expect(controller.queue).toEqual([]);
      await controller.queueSong(songs[1]);

      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'AddSongToQueue',
        song: songs[1],
      });

      controller.updateFrom(model, []);
      expect(controller.queue).toEqual([queueItems[1]]);
      expect(controller.toInteractableAreaModel()).toEqual(model);
    });
  });
});
