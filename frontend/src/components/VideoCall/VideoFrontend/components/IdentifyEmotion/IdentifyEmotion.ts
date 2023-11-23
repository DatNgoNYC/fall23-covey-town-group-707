import { LocalVideoTrack } from 'twilio-video';
import useTownController from '../../../../../hooks/useTownController';
import { Emotion } from '../../../../../types/CoveyTownSocket';
import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { useEffect } from 'react';
import AWS from 'aws-sdk';
import TownController from '../../../../../classes/TownController';
import assert from 'assert';

const EMOTION_API_REQUEST_DELAY = 5000;

async function captureFrame(mediaStreamTrack: MediaStreamTrack): Promise<Buffer> {
  // TODO: fix the any typecasting
  const imageCapture = new (window as any).ImageCapture(mediaStreamTrack);

  const imageBlob: Blob = await imageCapture.takePhoto();
  const imageArrayBuffer: ArrayBuffer = await imageBlob.arrayBuffer();
  const imageBuffer: Buffer = Buffer.from(imageArrayBuffer);

  return imageBuffer;
}

function emotionDetectionRequest(client: AWS.Rekognition, image: Buffer): Promise<AWS.Rekognition.EmotionName | undefined> {
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
  const debugAWS = process.env.NEXT_PUBLIC_TOWN_AWS_DEV_MODE;
  
  const townController: TownController = useTownController();

  const { localTracks } = useVideoContext();

  const localVideoTrack: LocalVideoTrack | undefined = localTracks.find(
    track => track.kind === 'video',
  ) as LocalVideoTrack | undefined;
  const mediaStreamTrack: MediaStreamTrack | undefined = useMediaStreamTrack(localVideoTrack);

  assert(process.env.NEXT_PUBLIC_TOWN_AWS_ACCESS_KEY_ID, "AWS Access Key must be defined");
  assert(process.env.NEXT_PUBLIC_TOWN_AWS_SECRET_ACCESS_KEY, "AWS Secret Key must be defined");

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
          console.log(mediaStreamTrack);
          const imageBuffer = await captureFrame(mediaStreamTrack);
          console.log(imageBuffer)
          let detectedAWSEmotion:
          | AWS.Rekognition.EmotionName
          | undefined;

          if (debugAWS && debugAWS.toLowerCase() === 'true') {
            const emo: AWS.Rekognition.EmotionName[] = ['HAPPY', 'SAD', 'ANGRY', 'SURPRISED', 'FEAR', 'NEUTRAL'];

            detectedAWSEmotion = emo[Math.floor(Math.random() * emo.length)];
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
            default:
              userEmotion = 'NEUTRAL';
              break;
          }
        }
      } catch (error) {
        console.error('Error detecting emotions:', error);
      } finally {
        console.log(userEmotion);
        townController.emitEmotionChange(userEmotion);
        timeout = setTimeout(detectUserEmotion, EMOTION_API_REQUEST_DELAY);
      }
    };

    detectUserEmotion();

    return () => clearTimeout(timeout);
  }, [mediaStreamTrack]);
}
