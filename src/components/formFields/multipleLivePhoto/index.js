/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import React, {
  useState, useEffect, forwardRef, useRef
} from 'react';
import { styled } from '@mui/material/styles';
import {
  IconButton, Tooltip, Grid, Button, Slide
} from '@mui/material';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import PageLoader from '../../PageLoader';
import CustomFileList from './customfileList';
import { Service } from '../../../service';
import ErrorText from '../errorHandler';
import CustomToaster from '../../mesaageToaster';
import {
  ButtonPrimary, DialogTitleStyled, DialogStyled, DialogClose,
  DialogContentStyled, ContainerItemStyled, LoadingButtonPrimary,
  WebCamContainerStyled,
  WebCamStyled
} from '../../styledComponents';
import ImageWithWatermark from '../../WaterMarkImage';
import { customerConfigHandler } from '../../../views/customer360/utils';

const Transition = forwardRef((props, ref) => <Slide direction='up' ref={ref} {...props} />);

const CustomIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.input.primary,
  position: 'absolute',
  bottom: '10px',
  right: '10px'
}));

const LivePhotoUploadStyled = styled(Button)(({ theme }) => ({
  color: theme.button.primary,
  backgroundColor: theme.button.secondary,
  height: '100%',
  '&.MuiButton-root': {
    backgroundColor: theme.button.secondary,
    width: '100%',
    height: '56px'
  }
}));

const FACING_MODE_USER = 'user';
const FACING_MODE_ENVIRONMENT = 'environment';

const videoConstraints = {
  width: 940,
  height: 700,
  facingMode: FACING_MODE_USER,
};

const screen = {
  height: 700,
  width: 940
};

const livenessAPIImages = ['document_live_photo_customer'];

const MultipleLivePhoto = (props) => {
  const {
    register, unregister, errors, input, setValue, getValues, setError
  } = props;
  const [loading, setLoading] = useState({ loader: false, name: null });
  const [image, setImage] = useState({});
  const [allImages, setAllImages] = useState([]);
  const [open, setOpen] = useState(false);
  const [facingMode, setFacingMode] = React.useState(FACING_MODE_USER);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const isMaskAPIFailed = useRef(0);
  const livelinessAPIFailed = useRef(0);

  const fetchAllImages = async (matchedKeys) => {
    const requests = [];
    const pathArray = [];
    matchedKeys.forEach((ele) => {
      const path = getValues(ele);
      if (path) {
        if (Array.isArray(path)) {
          path.forEach((docPath) => {
            requests.push(Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${docPath}`));
            pathArray.push(docPath);
          });
        } else {
          requests.push(Service.get(`${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${path}`));
          pathArray.push(path);
        }
      }
    });
    if (requests.length) {
      setLoading({ loader: true, name: 'onUpload' });
      Promise.all(requests).then((responses) => {
        const allImgArray = responses.map((ele, ind) => ({
          name: `${input.label}.${input?.isPreview ?? 'jpeg'}`,
          type: `image/${input?.isPreview ?? 'jpeg'}`,
          url: ele?.data?.data?.full_path,
          path: pathArray[ind]
        }));
        setAllImages(allImgArray);
      }).catch((err) => {
        console.log('Error', err);
        setAlertShow({ open: true, msg: 'Something went wrong while fetching documents.', alertType: 'error' });
      }).finally(() => {
        setLoading({ loader: false, name: null });
      });
    } else {
      setAllImages([]);
    }
  };

  useEffect(() => {
    const matchedKeys = (Object.keys(getValues())).filter((ele) => ele.includes(input.name));
    fetchAllImages(matchedKeys);
  }, [getValues(input.name)]);

  useEffect(() => {
    register(input.name, { required: input?.validation?.isRequired });
  }, []);

  const handleSwitch = React.useCallback(() => {
    setFacingMode((prevState) => (prevState === FACING_MODE_USER ? FACING_MODE_ENVIRONMENT
      : FACING_MODE_USER));
  }, []);

  const handleOpen = (e) => {
    e.preventDefault();
    if (input?.disable || input.disabled) {
      setOpen(false);
    } else if (input?.maxUploadCount && allImages.length >= input?.maxUploadCount) {
      alert(input?.maxUploadMsg);
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setImage(null);
    setOpen(false);
    isMaskAPIFailed.current = 0;
  };

  const checkLiveliness = async (imageSrc) => {
    try {
      const humanBase64 = imageSrc.split('data:image/jpeg;base64,')[1];
      const { data: response } = await Service.post(process.env.REACT_APP_LIVENESS_SERVICE, {
        file_base64: humanBase64
      });
      if (!response?.data?.result?.isLive || response?.data?.result?.multipleFacesDetected) {
        const check = window.confirm('Image captured by the user is not clear. Do you still want to continue?');
        if (!check) {
          return false;
        }
      }
      livelinessAPIFailed.current = 0;
      return true;
    } catch (err) {
      console.log('Error', err);
      const livelinessFailureConfig = await customerConfigHandler();

      livelinessAPIFailed.current += 1; // Increment the failure count

      // Check if the failure count has reached the retry_count specified in config
      if (livelinessAPIFailed.current >= livelinessFailureConfig?.liveliness?.default?.retry_count) {
        if (livelinessFailureConfig?.liveliness?.default?.stop) { // If hard stop is enabled
          window.alert('Too many failures in validating liveliness. Please refresh the page and try again.');
          return false;
        }

        // If not hard stop enabled
        const check = window.confirm('Unable to validate liveliness. Do you still want to continue?');
        livelinessAPIFailed.current = 0; // Reset the count after the confirmation
        return check; // Return the user's decision
      }

      window.alert('Unable to validate liveliness. Try again!');
      return false; // Return false for failures lesser than retry count
    }
  };

  const webcamRef = React.useRef(null);
  // eslint-disable-next-line
  const capture = React.useCallback(async () => {
    try {
      setLoading({ loader: true, name: 'onMasking' });
      const imageSrc = webcamRef.current.getScreenshot();
      if (livenessAPIImages.includes(input.name)) {
        const flag = await checkLiveliness(imageSrc);
        if (!flag) {
          return;
        }
      }
      if (isMaskAPIFailed.current <= 1 && ((input.name === 'id_proof_url' && getValues('id_proof_name') === 'Aadhaar Card')
      || (input.name === 'address_proof_url' && getValues('address_proof_name') === 'Aadhaar Card'))) {
        const aadhaarBase64 = imageSrc.split('data:image/jpeg;base64,')[1];
        const { data } = await Service.post(process.env.REACT_APP_MASK_AADHAR, {
          image_b64: aadhaarBase64
        });
        if (data?.data?.status === 1) {
          isMaskAPIFailed.current = 0;
          setImage({
            file: `data:image/jpeg;base64,${data.data.image}`,
            name: `${input.label}.jpeg`,
            type: 'image/jpeg',
            url: ''
          });
        } else {
          isMaskAPIFailed.current += 1;
          if (isMaskAPIFailed.current === 1) {
            setAlertShow({ open: true, msg: 'The Image of the proof is not captured properly. Please capture the image again.', alertType: 'error' });
          } else if (isMaskAPIFailed.current === 2) {
            setAlertShow({ open: true, msg: 'The Aadhaar masking of the image has failed. Please capture the image again after masking the Aadhaar manually.', alertType: 'error' });
          } else {
            setAlertShow({ open: true, msg: data?.data?.message ?? 'Something went wrong, Please try again', alertType: 'error' });
          }
        }
      } else {
        setImage({
          file: imageSrc,
          name: `${input.label}.jpeg`,
          type: 'image/jpeg',
          url: ''
        });
      }
    } catch (err) {
      console.log('Error', err);
      setAlertShow({ open: true, msg: 'Document could not be captured, Please try again.', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  });

  const dataURLtoFile = (dataurl, filename) => (fetch(dataurl)
    .then((res) => res.arrayBuffer())
    .then((buf) => new File([buf], filename, { type: 'image/jpeg' }))
  );

  const uploadimage = async () => {
    try {
      setLoading({ loader: true, name: 'onUpload' });
      const formData = new FormData();
      formData.append('module', 'GOLD');
      const fileToUpload = await dataURLtoFile(image.file, image.name);
      let URL = `${process.env.REACT_APP_GENERATE_S3_URL}?module=GOLD&doc=${image.name}`;
      const { filePath } = input;
      if (filePath) {
        URL = `${URL}&path=${filePath}`;
      }
      const { data, status } = await Service.get(URL);
      if (data?.success && status === 200) {
        const res = await Service.putWithFile(data.data.put, fileToUpload, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Access-Control-Allow-Origin': '*'
          }
        });
        if (res.status === 200) {
          setAllImages([...allImages, {
            name: `${input.label}.jpeg`,
            type: 'image/jpeg',
            url: data.data.get,
            path: data.data.path
          }]);
          setImage(null);
          if (!allImages.length) {
            setValue(input.name, data.data.path, { shouldValidate: true });
          } else {
            register(`${input.name}_${allImages.length}`, { value: data.data.path });
          }
          if ((input?.name === 'id_proof_url' && getValues('id_proof_name') === 'Aadhaar Card')) {
            setValue('id_proof_number', getValues('aadhaar_verification_mode') === 'Offline' ? getValues('aadharCardOffline') : getValues('aadharCardOnline'));
          }
          if ((input?.name === 'address_proof_url' && getValues('address_proof_name') === 'Aadhaar Card')) {
            setValue('address_proof_number', getValues('aadhaar_verification_mode') === 'Offline' ? getValues('aadharCardOffline') : getValues('aadharCardOnline'));
          }
        }
      }
      if (setError) {
        setError(input.name, null);
      }
    } catch (err) {
      console.log('err', err);
      setImage(null);
      setAlertShow({ open: true, msg: 'Document could not be uploaded, Please try again', alertType: 'error' });
    } finally {
      setLoading({ loader: false, name: null });
    }
  };

  const handleConfirmClick = (e) => {
    e.preventDefault();
    uploadimage();
    setOpen(false);
    isMaskAPIFailed.current = 0;
  };
  const removeImg = (index) => {
    // eslint-disable-next-line no-alert
    const check = window.confirm('Do you want to delete the file');
    if (check) {
      const tempImages = [...allImages];
      tempImages.splice(index, 1);
      tempImages.forEach((item, ind) => {
        if (ind) {
          setValue(`${input.name}_${ind}`, item.path);
        } else {
          setValue(input.name, item.path);
        }
      });
      if (allImages.length > 1) {
        unregister(`${input.name}_${allImages.length - 1}`);
      } else {
        setValue(input.name, null, { shouldValidate: true });
        if ((input?.name === 'id_proof_url' && getValues('id_proof_name') === 'Aadhaar Card')) {
          setValue('id_proof_number', null);
        }
        if ((input?.name === 'address_proof_url' && getValues('address_proof_name') === 'Aadhaar Card')) {
          setValue('address_proof_number', null);
        }
      }
      setAllImages(tempImages);
      setImage(null);
    }
  };

  return (
    <>
      {
          loading.loader && loading.name === 'onUpload' ? <PageLoader /> : null
      }
      <LivePhotoUploadStyled disabled={input?.disable ?? false} onClick={!loading.loader && handleOpen} type='button' style={{ color: '#666666' }}>
        {
          input?.validation?.isRequired ? `${input.label}* ${input?.notUploaded ? '- Not Uploaded' : ''}` : `${input.label} ${input?.notUploaded ? '- Not Uploaded' : ''}`
        }
      </LivePhotoUploadStyled>
      {allImages.length ? <CustomFileList img={allImages} removeImg={removeImg} disabled={(input?.disable || input.disabled) ?? false} input={input} /> : null}
      <ErrorText input={{ ...input, name: input.name }} errors={errors} />
      <CustomToaster
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <DialogStyled
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <DialogTitleStyled>
          <span>{input.label}</span>
          <DialogClose
            onClick={handleClose}
          >
            x
          </DialogClose>
        </DialogTitleStyled>
        <DialogContentStyled>
          <Grid container rowSpacing={1} columnSpacing={2}>
            <Grid item xs={12} md={image?.file ? 6 : 12}>
              <ContainerItemStyled>
                <WebCamContainerStyled>
                  <WebCamStyled
                    audio={false}
                    height={screen.height}
                    ref={webcamRef}
                    screenshotQuality={1}
                    screenshotFormat='image/jpeg'
                    width={screen.width}
                    videoConstraints={{ videoConstraints, facingMode }}
                    style={{ borderRadius: '15px', marginTop: '5px' }}
                  />
                </WebCamContainerStyled>
                <LoadingButtonPrimary
                  onClick={(e) => {
                    e.preventDefault();
                    capture();
                  }}
                  loading={loading.loader && loading.name === 'onMasking'}
                >
                  Take Snapshot
                </LoadingButtonPrimary>
              </ContainerItemStyled>
            </Grid>
            {
              image?.file && (
                <Grid item xs={12} md={6}>
                  <ContainerItemStyled>
                    {
                      (input?.withWatermark && input?.watermarkContent)
                        ? <ImageWithWatermark image={image} setImage={setImage} imageUrl={image.file} watermarkText={input?.watermarkContent} />
                        : (
                          <img
                            src={image?.file}
                            width='auto'
                            height='auto'
                            alt='imageFromCam'
                            style={{
                              borderRadius: '15px', marginTop: '5px', marginBottom: '6.4px'
                            }}
                          />
                        )
                    }

                    <ButtonPrimary
                      onClick={handleConfirmClick}
                    >
                      Confirm
                    </ButtonPrimary>
                  </ContainerItemStyled>
                </Grid>
              )
            }
          </Grid>
          <Tooltip title='Switch Camera'>
            <CustomIconButton onClick={handleSwitch}>
              <FlipCameraAndroidIcon />
            </CustomIconButton>
          </Tooltip>
        </DialogContentStyled>
      </DialogStyled>
    </>
  );
};

export default MultipleLivePhoto;
