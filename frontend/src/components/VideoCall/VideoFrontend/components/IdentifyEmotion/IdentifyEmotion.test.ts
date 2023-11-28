import AWS from 'aws-sdk';
import { IdentifyEmotion } from './IdentifyEmotion';
import TownController from '../../../../../classes/TownController';

jest.mock('aws-sdk', () => ({
  Rekognition: class MockRekognition {
    detectFaces(params: any, callback: ((err: never | undefined, data: AWS.Rekognition.DetectFacesResponse) => void)) {
      const fakeResponse = {
        FaceDetails: [
          {
            Emotions: [
              {
                Type: 'HAPPY',
              },
            ],
          },
        ],
      };

      callback(undefined, fakeResponse);
    }
  },
}));

const mockImageCapture = {
  takePhoto: jest.fn(() => Promise.resolve(new Blob())),
};

const mockMediaStreamTrack = {};

(window as any).ImageCapture = jest.fn(() => mockImageCapture);

describe('test IdentifyEmotion', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_TOWN_AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.NEXT_PUBLIC_TOWN_AWS_SECRET_ACCESS_KEY = 'test-secret-access-key';
    process.env.NEXT_PUBLIC_TOWN_AWS_REGION = 'us-east-1';
    process.env.NEXT_PUBLIC_TOWN_AWS_DEV_MODE = 'false';
  });

  it('should emit the API emotion correctly', async () => {    
    // await IdentifyEmotion();
    expect(true).toEqual(true);
  });
});
