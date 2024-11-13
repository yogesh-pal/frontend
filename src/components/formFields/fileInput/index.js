/* eslint-disable max-len */
import styled from '@emotion/styled';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import ListItem from '@mui/material/ListItem';
import { CircularProgress } from '@mui/material';
import ErrorText from '../errorHandler';
import { Service } from '../../../service';
import CustomFileList from './customfileList';
import CustomToaster from '../../mesaageToaster';

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

const FileInput = (props) => {
  const {
    register, errors, input, setValue,
    getValues, defaultValue, clearErrors
  } = props;
  const [img, setImg] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState([]);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });

  const getFullDocUrl = () => {
    Service.get(
      `${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${defaultValue}`
    ).then((response) => {
      const nameArray = defaultValue.split('.');
      setImg([[response?.data?.data?.full_path, nameArray[nameArray.length - 1]]]);
    }).catch((error) => {
      console.log('Error', error);
      setAlertShow({ open: true, msg: 'Error while fetching document, Please try again', alertType: 'error' });
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (defaultValue && typeof (defaultValue) === 'string' && !defaultValue?.includes('blob')) {
      getFullDocUrl();
      setLoading(true);
    }
    if (Array.isArray(defaultValue) && defaultValue.length && Array.isArray(defaultValue[0]) && defaultValue[0].length) {
      setImg([[defaultValue[0][0], defaultValue[0][1]]]);
    }
  }, []);

  const handleImage = (e) => {
    const t = [];
    setShowError([]);
    const fileObj = e.target.files;
    Object.keys(fileObj).forEach((file) => {
      if ((fileObj[file].size / 1024 / 1024) > input?.fileSize) {
        setShowError((prev) => ([...prev, `Please Upload file of size less than ${input?.fileSize} MB`]));
      } else if (input?.fileType && !input.fileType.includes(fileObj[file].type)) {
        setShowError((prev) => ([...prev, input?.fileTypeMsg ?? 'Only PDF files are allowed']));
      } else {
        t.push([
          URL.createObjectURL(fileObj[file]),
          fileObj[file].name,
          fileObj[file].type,
          fileObj[file]
        ]);
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

export default FileInput;
