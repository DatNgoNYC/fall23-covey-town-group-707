import { LocalVideoTrack } from 'twilio-video';
import useTownController from '../../../../../hooks/useTownController';
import { Emotion } from '../../../../../types/CoveyTownSocket';
import useMediaStreamTrack from '../useMediaStreamTrack/useMediaStreamTrack';
import useVideoContext from '../useVideoContext/useVideoContext';
import { useEffect } from 'react';
import AWS from 'aws-sdk';
import TownController from '../../../../../classes/TownController';
import assert from 'assert';

// timeout delay between API requests in ms
const EMOTION_API_REQUEST_DELAY = 3000;

/**
 * Gets the current frame of a given media stream.
 * 
 * @param mediaStreamTrack is the stream to take the frame of
 * @returns the image as a Buffer object
 */
async function captureFrame(mediaStreamTrack: MediaStreamTrack): Promise<Buffer> {
  // ImageCapture: https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture/ImageCapture
  const imageCapture = new (window as any).ImageCapture(mediaStreamTrack);

  const imageBlob: Blob = await imageCapture.takePhoto();
  const imageArrayBuffer: ArrayBuffer = await imageBlob.arrayBuffer();
  const imageBuffer: Buffer = Buffer.from(imageArrayBuffer);

  return imageBuffer;
}

/**
 * Makes an API request to Rekognition, making use of the DetectFaces endpoint
 * provided. It identifies the emotions in the given image, and returns the emotion
 * that the model predicted with the greatest confidence for the first face idenitified
 * in the image.
 * 
 * The function returns a promise that either resolves to an emotion or undefined, or rejects
 * with the error if there were any when making an API request.
 * 
 * @param client AWS Rekognition client to use for API call 
 * @param image to detect emotion from
 * @returns a promise that resolves with the emotion recognized (AWS type) or undefined if none
 */
function emotionDetectionRequest(
  client: AWS.Rekognition,
  image: Buffer,
): Promise<AWS.Rekognition.EmotionName | undefined> {
  // request parameters
  const params = {
    Image: {
      Bytes: image,
    },
    // gets all attributes from the API request
    Attributes: ['ALL'],
  };

  return new Promise((resolve, reject) => {
    client.detectFaces(params, (err, response) => {
      if (err) {
        reject(err);
      } else {
        if (response.FaceDetails) {
          const firstFaceEmotions: AWS.Rekognition.Emotions | undefined =
            response.FaceDetails[0].Emotions;

          if (firstFaceEmotions) {
            const topEmotionPrediction: AWS.Rekognition.EmotionName | undefined =
              firstFaceEmotions[0].Type;

            resolve(topEmotionPrediction);
          }
        }
      }

      resolve(undefined);
    });
  });
}

/**
 * Hook that identifies the emotion of the person using the frame from 
 * the local video track's media stream. This useEffect is created on first mount,
 * and then re-rendered whenever the media stream changes. The video frame is taken
 * after every EMOTION_API_REQUEST_DELAY milliseconds using a timeout.
 */
export function useIdentifyEmotion() {
  const debugAWS = process.env.NEXT_PUBLIC_TOWN_AWS_DEV_MODE;

  const townController: TownController = useTownController();

  const { localTracks } = useVideoContext();

  const localVideoTrack: LocalVideoTrack | undefined = localTracks.find(
    track => track.kind === 'video',
  ) as LocalVideoTrack | undefined;
  const mediaStreamTrack: MediaStreamTrack | undefined = useMediaStreamTrack(localVideoTrack);

  assert(process.env.NEXT_PUBLIC_TOWN_AWS_REGION, 'AWS Region must be defined');
  assert(process.env.NEXT_PUBLIC_TOWN_AWS_ACCESS_KEY_ID, 'AWS Access Key must be defined');
  assert(process.env.NEXT_PUBLIC_TOWN_AWS_SECRET_ACCESS_KEY, 'AWS Secret Key must be defined');

  AWS.config.update({
    region: process.env.NEXT_PUBLIC_TOWN_AWS_REGION,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_TOWN_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_TOWN_AWS_SECRET_ACCESS_KEY,
    },
  });

  const client: AWS.Rekognition = new AWS.Rekognition();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const detectUserEmotion = async () => {
      let userEmotion: Emotion = 'NEUTRAL';

      try {
        if (mediaStreamTrack) {
          const imageBuffer = await captureFrame(mediaStreamTrack);
          let detectedAWSEmotion: AWS.Rekognition.EmotionName | undefined;

          if (debugAWS && debugAWS.toLowerCase() === 'true') {
            const emotions: AWS.Rekognition.EmotionName[] = [
              'NEUTRAL',
              'HAPPY',
              'SAD',
              'SURPRISED',
              'ANGRY',
              'FEAR',
              'CONFUSED',
              'DISGUSTED',
            ];

            detectedAWSEmotion = emotions[Math.floor(Math.random() * emotions.length)];
          } else {
            detectedAWSEmotion = await emotionDetectionRequest(client, imageBuffer);
          }

          switch (detectedAWSEmotion) {
            case 'HAPPY':
              userEmotion = 'HAPPY';
              break;
            case 'SAD':
              userEmotion = 'SAD';
              break;
            case 'ANGRY':
              userEmotion = 'ANGRY';
              break;
            case 'SURPRISED':
              userEmotion = 'SURPRISED';
              break;
            case 'FEAR':
              userEmotion = 'FEAR';
              break;
            case 'CONFUSED':
              userEmotion = 'CONFUSED';
              break;
            case 'DISGUSTED':
              userEmotion = 'DISGUSTED';
              break;
            default:
              userEmotion = 'NEUTRAL';
              break;
          }
        }
      } catch (error) {
        console.error('Error detecting emotions:', error);
      } finally {
        townController.emitEmotionChange(userEmotion);
        timeout = setTimeout(detectUserEmotion, EMOTION_API_REQUEST_DELAY);
      }
    };

    detectUserEmotion();

    return () => clearTimeout(timeout);
  }, [mediaStreamTrack]);
}
