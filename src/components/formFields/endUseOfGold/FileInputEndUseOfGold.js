/* eslint-disable max-len */
import styled from '@emotion/styled';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import ListItem from '@mui/material/ListItem';
import { CircularProgress } from '@mui/material';
import ErrorText from '../errorHandler';
import { Service } from '../../../service';
import CustomToaster from '../../mesaageToaster';
import CustomFileList from '../fileInput/customfileList';

const CustomShowError = styled.div`
  margin-top: 15px;
  color: red;
  font-size: 11px;
`;

const FileUploadStyled = styled(Button)(({ theme }) => ({
  color: theme.button.primary,
  backgroundColor: theme.button.secondary,
  height: '100%',
  '&.MuiButton-root': {
    backgroundColor: theme.button.secondary,
    width: '100%'
  }
}));

const ListStyled = styled(List)(() => ({
  paddingTop: '0px',
  paddingBottom: '0px'
}));

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  color: theme.input.primary,
  backgroundColor: theme.input.secondary,
  paddingTop: '0px',
  paddingBottom: '0px',
  height: '57px',
  borderRadius: '5px',
  display: 'flex',
  justifyContent: 'center'
}));

const FileInputEndUseOfGold = (props) => {
  const {
    register, errors, input, setValue,
    getValues, clearErrors, isS3Upload
  } = props;
  const [img, setImg] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState([]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });

  const getFullDocUrl = (tempDefaultValue) => {
    Service.get(
      `${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${tempDefaultValue}`
    ).then((response) => {
      const nameArray = tempDefaultValue.split('/');
      setImg([[response?.data?.data?.full_path, nameArray[1]]]);
    }).catch((error) => {
      console.log('Error', error);
      setAlertShow({ open: true, msg: 'Error while fetching document, Please try again', alertType: 'error' });
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    const tempDefaultValue = getValues(input?.name);
    if (tempDefaultValue && typeof (tempDefaultValue) === 'string' && !tempDefaultValue?.includes('blob')) {
      getFullDocUrl(tempDefaultValue);
      setLoading(true);
    } else if (tempDefaultValue && Array.isArray(tempDefaultValue) && typeof (tempDefaultValue[0]) === 'string' && !tempDefaultValue[0]?.includes('blob')) {
      getFullDocUrl(tempDefaultValue[0]);
      setLoading(true);
    }
  }, []);

  const uploadFileToS3 = async (file) => {
    const fileName = file[0][1];
    const uploadFile = file[0][3];
    const fileType = file[0][2];
    let URL = `${process.env.REACT_APP_GENERATE_S3_URL}?module=GOLD&doc=${fileName}`;
    if (input?.filePath) {
      URL = `${URL}&path=${input?.filePath}`;
    }
    const { data } = await Service.get(URL);
    const { path, put } = data.data;

    if (put) {
      await Service.putWithFile(put, uploadFile, {
        headers: {
          'Content-Type': fileType,
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    setValue(input.name, path);
  };

  const handleImage = (e) => {
    const t = [];
    setShowError([]);
    const fileObj = e.target.files;
    Object.keys(fileObj).forEach((file) => {
      if ((fileObj[file].size / 1024 / 1024) > input?.fileSize) {
        setShowError((prev) => ([...prev, `Please Upload file of size less than ${input?.fileSize} MB`]));
      } else if (!fileObj[file].type.includes('pdf')) {
        setShowError((prev) => ([...prev, input?.fileTypeMsg ?? 'Only PDF files are allowed']));
      } else {
        t.push([
          URL.createObjectURL(fileObj[file]),
          fileObj[file].name,
          fileObj[file].type,
          fileObj[file]
        ]);
        if (isS3Upload) {
          uploadFileToS3(t);
        }
      }
    });
    setImg((prev) => ([...prev, ...t]));
    const temp = getValues(input.name);
    if (temp) {
      setValue(input.name, [...temp, ...t]);
    } else {
      setValue(input.name, t);
    }
    clearErrors(input.name);
  };

  const removeImg = (index) => {
    setShowError('');
    const temp = [...img];
    // eslint-disable-next-line no-alert
    const check = window.confirm('Do you want to delete the file');
    if (check) {
      temp.splice(index, 1);
      setImg(temp);
    }
    setValue(input.name, null);
  };

  return (
    <>
      <CustomToaster
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      {
        loading ? (
          <ListStyled dense={false}>
            <ListItemStyled>
              <CircularProgress color='inherit' />
            </ListItemStyled>
          </ListStyled>
        )
          : (
            <>
              {
        img.length > 0 && !input?.isMulti
          ? (
            <CustomFileList img={img} removeImg={removeImg} disabled={input?.disabled ?? false} />
          )
          : (
            <FileUploadStyled
              variant='contained'
              component='label'
              hidden
            >
              {input?.label ?? 'Upload File'}
              <input
                type='file'
                accept='application/pdf'
                {...register(
                  input?.name,
                  { required: input?.validation?.isRequired }
                )}
                // eslint-disable-next-line react/jsx-boolean-value
                disabled={!input?.isMulti && img?.length >= 1}
                multiple={input?.isMulti}
                hidden
                onChange={handleImage}
              />
            </FileUploadStyled>
          )
        }
              {
        showError && showError?.map((val) => (
          <CustomShowError>
            {val}
          </CustomShowError>
        ))
      }
            </>
          )
    }
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default FileInputEndUseOfGold;
