/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/* eslint-disable no-undef */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/media-has-caption */
import React, {
  useEffect, useRef, useState
} from 'react';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import CircularProgress from '@mui/material/CircularProgress';
import * as ort from 'onnxruntime-web';
import * as tf from '@tensorflow/tfjs';
import { Backdrop, Grid } from '@mui/material';
import { ButtonPrimary } from '../../components/styledComponents';
import MobileSamEncoder from '../../assets/models/mobilesam.encoder.onnx';
import MobileSamDecoder from '../../assets/models/mobilesam.decoder.quant.onnx';

const MobileSam = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [imageEmbeddings, setImageembeddings] = useState(null);
  const [isLoading, setIsLoading] = useState({ value: true, msg: 'Fetching Models' });
  //   const [decodingSession, setDecodingSession] = useState(null);
  const encoderRef = useRef(null);
  const decoderRef = useRef(null);

  const canvasRef = useRef(null);
  // const webcamRef = useRef(null);
  // const maskedCanvasRef = useRef(null);
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  const openCamera = async (mode) => {
    // Stop any active video streams
    if (videoRef?.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop()); // Stop each active track
    }
    setIsCameraOpen(true);
    try {
      const stream = await window.navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode }
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (err) {
      console.error('Error accessing camera: ', err);
    }
    setFacingMode(mode);
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // Convert the canvas content to a data URL (base64) and save it
    const imageUrl = canvasRef.current.toDataURL('image/png');
    setCapturedImage(imageUrl);

    // Stop the video stream once the picture is taken
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    setIsCameraOpen(false);
  };

  // const downloadSegment = (canvas, partName = 'MaskedPortion') => {
  //   const link = document.createElement('a');
  //   link.href = canvas.toDataURL();
  //   link.download = `${partName}.png`;
  //   link.click();
  // };
  function calculateImageSizeInBytes(dataURL) {
    // Remove the base64 prefix (e.g., "data:image/jpeg;base64,")
    const base64String = dataURL.split(',')[1];

    // Convert the base64 string length to the equivalent number of bytes
    const sizeInBytes = (base64String.length * 3) / 4;

    return (sizeInBytes / 1024).toFixed(2); // Convert bytes to KB
  }

  function compressImageToJPEG(img, quality) {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = 512;
    canvas.height = 512;

    // Draw image to canvas
    context.drawImage(img, 0, 0);
    const originalSize = calculateImageSizeInBytes(canvas.toDataURL('image/jpeg', 1));
    const compressedImageDataURL = canvas.toDataURL('image/jpeg', quality); // Quality between 0 and 1
    const compressedSize = calculateImageSizeInBytes(compressedImageDataURL);
    console.log(`Original size: ${originalSize} bytes, Compressed size: ${compressedSize} bytes`);
    // Create a new image from the compressed data
    const compressedImage = new Image();
    compressedImage.src = compressedImageDataURL;

    // You need to wait until the compressed image is loaded before drawing it back to the canvas
    compressedImage.onload = function () {
      // Clear the canvas if needed
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the compressed image back onto the canvas
      context.drawImage(compressedImage, 0, 0, canvas.width, canvas.height);

      // Optionally return the compressed image
    };
    return compressedImage;
  }

  // Example usage:

  async function handleClick(event) {
    try {
      setIsLoading(() => ({ value: true, msg: 'Please wait, generating mask' }));
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      context.putImageData(imageData, 0, 0);
      context.fillStyle = 'green';
      context.fillRect(x, y, 10, 10);
      const pointCoords = new ort.Tensor(new Float32Array([x, y, 0, 0]), [1, 2, 2]);
      const pointLabels = new ort.Tensor(new Float32Array([0, -1]), [1, 2]);
      const maskInput = new ort.Tensor(new Float32Array(256 * 256), [1, 1, 256, 256]);
      const hasMask = new ort.Tensor(new Float32Array([0]), [1,]);
      const origianlImageSize = new ort.Tensor(new Float32Array([684, 1024]), [2,]);

      ort.env.wasm.numThreads = 1;
      // const decodingSession = await ort.InferenceSession.create(MobileSamDecoder);
      const decodingSession = decoderRef.current;
      const decodingFeeds = {
        image_embeddings: imageEmbeddings,
        point_coords: pointCoords,
        point_labels: pointLabels,
        mask_input: maskInput,
        has_mask_input: hasMask,
        orig_im_size: origianlImageSize
      };

      const start = Date.now();
      const results = await decodingSession.run(decodingFeeds);
      const mask = results.masks;
      const maskImageData = mask.toImageData();
      context.globalAlpha = 0.5;
      // convert image data to image bitmap
      const imageBitmap = await createImageBitmap(maskImageData);
      context.drawImage(imageBitmap, 0, 0);
      const end = Date.now();
      console.log(`generating masks took ${(end - start) / 1000} seconds`);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setIsLoading({
        value: false,
        msg: ''
      });
    }
  }

  function applyBlur(img) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image
    context.drawImage(img, 0, 0);

    // Apply a blur filter to the context (CSS style)
    context.filter = 'blur(5px)'; // Adjust the blur radius as needed
    context.drawImage(img, 0, 0);

    // Get the blurred image data
    return context.getImageData(0, 0, img.width, img.height);
  }

  async function handleImage(img) {
    try {
      // setIsLoading(() => ({ value: true, msg: 'Please wait, generating Image Embeddings' }));
      ort.env.wasm.numThreads = 1;
      // const updatedImg = compressImageToJPEG(img, 0.1);
      // console.log('updatedImg', updatedImg);
      // const updatedImg = applyBlur(img);
      const updatedImg = img;
      const resizedTensor = await ort.Tensor.fromImage(updatedImg, { resizedWidth: 512, resizedHeight: 512 });
      const resizeImage = resizedTensor.toImageData();
      let imageDataTensor = await ort.Tensor.fromImage(resizeImage);
      const imageImageData = imageDataTensor.toImageData();
      setImageData(imageImageData);
      const canvas = canvasRef.current;
      canvas.width = imageImageData.width;
      canvas.height = imageImageData.height;
      const context = canvas.getContext('2d');
      context.putImageData(imageImageData, 0, 0);

      let tf_tensor = tf.tensor(imageDataTensor.data, imageDataTensor.dims);
      tf_tensor = tf_tensor.reshape([3, 512, 512]);
      tf_tensor = tf_tensor.transpose([1, 2, 0]).mul(255);
      imageDataTensor = new ort.Tensor(tf_tensor.dataSync(), tf_tensor.shape);

      // ort.env.wasm.numThreads = 1;
      // const session = await ort.InferenceSession.create(MobileSamEncoder);
      const session = encoderRef.current;
      const feeds = { input_image: imageDataTensor };
      const start = Date.now();
      let results;
      try {
        results = await session.run(feeds);
        console.log('Encoding result:', results);
        const { image_embeddings } = results;
        setImageembeddings(image_embeddings);
      } catch (error) {
        console.log(`caught error: ${error}`);
        document.getElementById('status').textContent = `Error: ${error}`;
      }
      const end = Date.now();
      const time_taken = (end - start) / 1000;
      console.log(`Computing image embedding took ${time_taken} seconds`);
      setIsLoading({
        value: false,
        msg: ''
      });
    } catch (err) {
      console.log('Error:', err);
    }
  }

  const videoConstraints = {
    width: 470,
    height: 350,
    facingMode: 'user',
  };
  // const AccessCamera = async (mode) => {
  //   try {
  //     const stream = await window.navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: { exact: mode } }
  //     });
  //     videoRef.current.srcObject = stream;
  //     videoRef.current.play();
  //   } catch (err) {
  //     console.error('Error accessing camera: ', err);
  //     alert(`Unable to access, ${err}`);
  //   }
  // };

  useEffect(() => {
    // AccessCamera();
    if (capturedImage) {
      const img = new Image();
      img.src = capturedImage;
      img.onload = () => {
        setIsLoading(() => ({ value: true, msg: 'Please wait, processing image' }));
        setTimeout(() => {
          handleImage(img);
        }, 100);
        // handleImage(img);
      };
    }
  }, [capturedImage]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await Promise.all([ort.InferenceSession.create(MobileSamEncoder), ort.InferenceSession.create(MobileSamDecoder)]);
        encoderRef.current = res[0];
        decoderRef.current = res[1];
        setIsLoading({
          value: false,
          msg: ''
        });
      } catch (err) {
        console.log('Error:', err);
      }
    };
    fetchModels();
  }, []);

  // useEffect(() => {
  //   AccessCamera(facingMode);
  // }, [facingMode]);
  return (
    <>
      {isLoading.value ? (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open
        >
          <Grid item style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress color='inherit' />
            {isLoading.msg}
          </Grid>

        </Backdrop>
      ) : null}
      {/* <Box display='flex' justifyContent='center' alignItems='center' style={{ zIndex: 10001 }}>
        {isLoading ? <CircularProgress /> : null}
      </Box> */}
      <Grid container flexDirection='column' justifyContent='center' alignItems='center' marginTop='50px'>
        <Grid item xs={12}>
          {' '}
          {!isCameraOpen && (
          <ButtonPrimary onClick={() => openCamera(facingMode)}>Open Camera</ButtonPrimary>
          )}
        </Grid>

        <Grid item xs={12}>
          {isCameraOpen && (
          <Grid item flexDirection='column' alignItems='center'>
            <video ref={videoRef} autoPlay muted style={{ width: '100%', maxWidth: '400px' }} />
            <br />
            <Grid display='flex' item justifyContent='center'>
              <ButtonPrimary onClick={capturePhoto}>Capture Photo</ButtonPrimary>
              <ButtonPrimary onClick={() => {
                const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
                openCamera(newFacingMode);
              }}
              >
                <FlipCameraAndroidIcon />
              </ButtonPrimary>
            </Grid>
          </Grid>
          )}
        </Grid>
        <Grid item xs={12}>
          <canvas
            ref={canvasRef}
        // width={500}
        // height={300}
            onClick={handleClick}
            style={{ border: '1px solid black' }}
          />
        </Grid>
        {/* <Grid item xs={12}>
          <div
            style={{
              position: 'relative'
            }}
          >

            <Webcam
              audio={false}
              height={350}
              ref={webcamRef}
              screenshotFormat='image/jpeg'
              width={470}
              videoConstraints={{ videoConstraints, facingMode: 'user' }}
              style={{ borderRadius: '15px', marginTop: '5px' }}
              onUserMedia={() => console.log('Camera stream started')}
              onUserMediaError={(error) => alert(`Camera stream error: ${error}`)}
            />
          </div>

        </Grid> */}

        {/* <canvas
        ref={maskedCanvasRef}
      />
      <button disabled={!maskedCanvasRef.current} onClick={() => downloadSegment(maskedCanvasRef.current)}>
        Download
      </button> */}
      </Grid>
    </>
  );
};

export default MobileSam;
