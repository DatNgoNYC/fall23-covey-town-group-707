import { nanoid } from 'nanoid';
import { JukeboxArea as JukeboxAreaModel } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import JukeboxAreaController from './JukeboxAreaController';

describe('JukeboxAreaController', () => {
  const players = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
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

  let controller: JukeboxAreaController = new JukeboxAreaController(nanoid());
  beforeEach(() => {
    controller = new JukeboxAreaController(nanoid());
  });

  describe('Test isActive', () => {
    it('set to active if there are players in the area', () => {
      expect(controller.occupants).toBe([]);
      players.map(player => controller.occupants.push(player));
      expect(controller.occupants).toBe(players);

      expect(controller.isActive()).toBe(true);
    });
    it('is not active if there are no players in the area', () => {
      expect(controller.occupants).toBe([]);
      expect(controller.isActive()).toBe(false);
    });
  });
  describe('Test toInteractableAreaModel', () => {
    it('model is created with correct values', () => {
      const model: JukeboxAreaModel = {
        id: controller.id,
        occupants: [],
        type: 'JukeboxArea',
        curSong: undefined,
        queue: [],
      };
      expect(controller.toInteractableAreaModel).toBe(model);
    });
    it('model has correct values after it has been changed', () => {
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
    it('emit change for curSong if the song has changed', () => {
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
    it('emit chenge for queue if the queue has been changed', () => {
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
    it('model does not change if no change has occured', () => {
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
    it('the model returned has the changes from the given model', () => {
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
});
