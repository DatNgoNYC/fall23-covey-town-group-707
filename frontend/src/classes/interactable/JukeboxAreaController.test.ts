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
  }: {
    _id?: string;
    occupants: string[];
    curSong?: Song;
    queue?: SongQueueItem[];
  }) {
    const id = _id || nanoid();
    const model: JukeboxAreaModel = {
      id: id,
      occupants: occupants,
      type: 'JukeboxArea',
      curSong: curSong,
      queue: queue || [],
    };
    const ret = new JukeboxAreaController(id, mockTownController, undefined, [], model);
    return ret;
  }

  describe('Test isActive', () => {
    it('set to active if there are players in the area', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      expect(controller.occupants).toBe([]);
      players.map(player => controller.occupants.push(player));
      expect(controller.occupants).toBe(players);

      expect(controller.isActive()).toBe(true);
    });
    it('is not active if there are no players in the area', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      expect(controller.occupants).toBe([]);
      expect(controller.isActive()).toBe(false);
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
      };
      expect(controller.toInteractableAreaModel).toBe(model);
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
      };
      expect(controller.toInteractableAreaModel).toBe(model);

      const modelChanged: JukeboxAreaModel = {
        id: controller.id,
        occupants: playerIds,
        type: 'JukeboxArea',
        curSong: songs[0],
        queue: [queueItems[1], queueItems[2]],
      };
      players.map(player => controller.occupants.push(player));
      controller.curSong = songs[0];
      controller.queue = [queueItems[1], queueItems[2]];
      expect(controller.toInteractableAreaModel).toBe(modelChanged);
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
      };
      controller.updateFrom(model, []);
      const curSongChangedCalled = emitSpy.mock.calls.find(call => call[0] === 'curSongChanged');
      expect(curSongChangedCalled).toBeDefined();
      if (curSongChangedCalled) expect(curSongChangedCalled[1]).toEqual(false);
      expect(controller.toInteractableAreaModel).toBe(model);
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
      };
      controller.updateFrom(model, []);
      const queueChangedCalled = emitSpy.mock.calls.find(call => call[0] === 'queueChanged');
      expect(queueChangedCalled).toBeDefined();
      if (queueChangedCalled) expect(queueChangedCalled[1]).toEqual(false);
      expect(controller.toInteractableAreaModel).toBe(model);
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
      };
      controller.updateFrom(model, []);
      const noSongChangeCalled = emitSpy.mock.calls.find(call => call[0] === 'curSongChanged');
      expect(noSongChangeCalled).not.toBeDefined();
      const noQueueChangeCalled = emitSpy.mock.calls.find(call => call[0] === 'queueChanged');
      expect(noQueueChangeCalled).not.toBeDefined();
      expect(controller.toInteractableAreaModel).toBe(model);
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
      };
      expect(controller.toInteractableAreaModel).toBe(model);

      const modelChanged: JukeboxAreaModel = {
        id: controller.id,
        occupants: playerIds,
        type: 'JukeboxArea',
        curSong: songs[0],
        queue: [queueItems[1], queueItems[2]],
      };
      controller.updateFrom(model, players);
      expect(controller.toInteractableAreaModel).toBe(modelChanged);
    });
  });
  describe('Test vote', () => {
    it('increases votes for a song when given an upvote', async () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
        curSong: songs[0],
        queue: [queueItems[1], queueItems[2]],
      });
      expect(controller.queue[0].numUpvotes).toBe(22);
      const vote: JukeboxVote = 'Upvote';
      await controller.vote(vote, songs[0]);
      expect(controller.queue[0].numUpvotes).toBe(23);
    });
    it('decreases votes for a song when given a downvote', async () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
        curSong: songs[0],
        queue: [queueItems[1], queueItems[2]],
      });
      expect(controller.queue[1].numDownvotes).toBe(5);
      const vote: JukeboxVote = 'Downvote';
      await controller.vote(vote, songs[1]);
      expect(controller.queue[1].numDownvotes).toBe(6);
    });
  });
  describe('Test useJukeboxAreaCurSong', () => {
    it('returns current song if one is playing', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
        curSong: songs[0],
        queue: [queueItems[1], queueItems[2]],
      });
      expect(useJukeboxAreaCurSong(controller)).toBe(songs[0]);
    });
    it('returns song default message if no song is playing', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
      });
      expect(useJukeboxAreaCurSong(controller)).toBe({
        songName: 'No song playing...',
        artistName: 'No song playing...',
        videoId: '',
      });
    });
  });
  describe('test useJukeboxAreaQueue', () => {
    it('returns the current queue', () => {
      const controller = jukeboxControllerWithProp({
        occupants: [],
        curSong: songs[0],
        queue: [],
      });
      expect(useJukeboxAreaQueue(controller)).toBe([]);
      controller.queue = [queueItems[1], queueItems[2]];
      expect(useJukeboxAreaQueue(controller)).toBe([queueItems[1], queueItems[2]]);
    });
  });
});
