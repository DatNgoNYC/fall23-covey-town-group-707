import { LocalVideoTrack } from 'twilio-video';
import useTownController from '../../../../../hooks/useTownController';
import { Emotion } from '../../../../../types/CoveyTownSocket';
import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useEffect } from 'react';
import AWS from 'aws-sdk';
import TownController from '../../../../../classes/TownController';

const EMOTION_API_REQUEST_DELAY = 5000;
const REGION = 'us-east-1';
const credentials = new AWS.SharedIniFileCredentials({ profile: 'default' });
AWS.config.credentials = credentials;
AWS.config.update({ region: REGION });

const client = new AWS.Rekognition();

async function captureFrame(mediaStreamTrack: MediaStreamTrack): Promise<Buffer> {
  // TODO: fix the any typecasting
  const imageCapture = new (window as any).ImageCapture(mediaStreamTrack);

  const imageBlob: Blob = await imageCapture.takePhoto();
  const imageArrayBuffer: ArrayBuffer = await imageBlob.arrayBuffer();
  const imageBuffer: Buffer = Buffer.from(imageArrayBuffer);

  return imageBuffer;
}

function emotionDetectionRequest(image: Buffer): Promise<AWS.Rekognition.EmotionName | undefined> {
  // const image: Buffer = fs.readFileSync('IMG_9555.jpg');

  const params = {
    Image: {
      Bytes: image,
    },
    Attributes: ['ALL'], // 'EMOTIONS'
  };

  return new Promise((resolve, reject) => {
    client.detectFaces(params, (err, response) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        if (response.FaceDetails) {
          const firstFaceEmotions: AWS.Rekognition.Emotions | undefined =
            response.FaceDetails[0].Emotions;

          if (firstFaceEmotions) {
            const topEmotionPrediction: AWS.Rekognition.EmotionName | undefined =
              firstFaceEmotions[0].Type;

            resolve(topEmotionPrediction);
            // console.log('Detected faces:', response.FaceDetails[0].Emotions);}
          }
        }
      }

      resolve(undefined);
    });
  });
}

export function IdentifyEmotion() {
  const townController: TownController = useTownController();

  const { localTracks } = useVideoContext();

  const localVideoTrack: LocalVideoTrack | undefined = localTracks.find(
    track => track.kind === 'video',
  ) as LocalVideoTrack | undefined;
  const mediaStreamTrack: MediaStreamTrack | undefined = useMediaStreamTrack(localVideoTrack);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const detectUserEmotion = async () => {
      let userEmotion: Emotion;

      try {
        if (mediaStreamTrack) {
          const imageBuffer = await captureFrame(mediaStreamTrack);

          const detectedAWSEmotion:
            | AWS.Rekognition.EmotionName
            | undefined = await emotionDetectionRequest(imageBuffer);

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
            default:
              userEmotion = 'NEUTRAL';
              break;
          }
        }
      } catch (error) {
        console.error('Error detecting emotions:', error);
      } finally {
        // emit userEmotion here
        timeout = setTimeout(detectUserEmotion, EMOTION_API_REQUEST_DELAY);
      }
    };

    detectUserEmotion();

    return () => clearTimeout(timeout);
  }, []);
}
