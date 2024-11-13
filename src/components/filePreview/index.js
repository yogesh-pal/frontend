/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import { useLocation } from 'react-router-dom';
import FileViewer from 'react-file-viewer';
import styled from '@emotion/styled';
import { Backdrop, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { Service } from '../../service';
import { useScreenSize } from '../../customHooks';

const WrapperContainer = styled.div(({ fileUrl }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  background: fileUrl ? '#333333' : '#fff'
}));

const CustomFileViewer = styled(({ screen, ...other }) => <div {...other} />)`
height: calc(100vh - 130px) !important;
width: ${(props) => (props.screen === 'sm' || props.screen === 'xs' ? '90%' : '70%')};
margin-top:20px;
.pg-viewer-wrapper{
  overflow-y: auto;
  .pg-viewer{
    .pdf-viewer{
      background: #ebebeb;
      canvas{
        width: 100%;
        padding:20px 20px 0 20px;
      }
    }
    .photo-viewer-container{
      width:100% !important;
      img{
        width:100% !important;
        height: 100% !important;
      }
    }  
  }
}
`;
const filePreview = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [type, setType] = useState(null);
  const location = useLocation();
  const screen = useScreenSize();

  const setFullUrl = async (path) => {
    Service.get(
      `${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${path}`
    ).then((response) => {
      setFileUrl(response?.data?.data?.full_path);
      setType('jpeg');
    }).catch((error) => {
      console.log(error);
    });
  };

  const fetchDocument = async (isPreSignedUrlRequired) => {
    try {
      if (isPreSignedUrlRequired) {
        const data = Object.fromEntries(new URLSearchParams(location.search));
        setFullUrl(data.path);
      } else {
        const data = Object.fromEntries(new URLSearchParams(location.search));
        setFileUrl(atob(data.url));
        const filetype = atob(data.type).split('/');
        setType(filetype[filetype.length > 0 ? filetype.length - 1 : 0]);
      }
    } catch (err) {
      console.log('err', err);
    }
  };
  useEffect(() => {
    const data = Object.fromEntries(new URLSearchParams(location.search));
    if (data?.isPreSignedUrlRequired ?? false === true) {
      fetchDocument(true);
    } else {
      fetchDocument(false);
    }
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  const onError = (e) => {
    console.log(e, 'error in file-viewer');
  };
  return (
    <WrapperContainer fileUrl={fileUrl}>
      <CustomFileViewer screen={screen}>
        {
        fileUrl ? (
          <FileViewer
            fileType={type}
            filePath={fileUrl}
            onError={onError}
          />
        ) : (
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open
          >
            <CircularProgress color='inherit' />
          </Backdrop>
        )
        }
      </CustomFileViewer>
    </WrapperContainer>
  );
};

export default filePreview;
