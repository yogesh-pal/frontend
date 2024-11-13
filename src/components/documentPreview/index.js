/* eslint-disable no-unused-vars */
import { useLocation } from 'react-router-dom';
import { Document, pdfjs, Page } from 'react-pdf';
import { Backdrop, CircularProgress } from '@mui/material';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { Service } from '../../service';
import { useScreenSize } from '../../customHooks';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const WrapperContainer = styled.div(({ fileUrl }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  color: fileUrl ? '#fff' : '#333333',
  background: fileUrl ? '#333333' : '#fff',
}));

const printStyles = css`
  @media print {
    body {
      visibility: hidden;
      display: none;
    }
  }
`;

const DocumentPreview = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const location = useLocation();
  const screen = useScreenSize();
  const [pageCount, setPageCount] = useState(0);

  const fetchCircularDocument = async () => {
    try {
      const id = atob(location.search.split('?id=')[1]);
      const { data } = await Service.get(
        `${process.env.REACT_APP_GET_CIRCULAR_DOC_SERVICE}/${id}`
      );
      if (data?.success) {
        setFileUrl(`data:application/pdf;base64,${data?.data.document}`);
      }
    } catch (err) {
      console.log('err', err);
    }
  };

  const fetchAuditorDocument = async () => {
    try {
      const pathAndSoure = location.search.split('?path=')[1];
      const path = atob(pathAndSoure.split('&source=')[0]);
      const source = atob(pathAndSoure.split('&source=')[1]);
      let module = 'GOLD';
      if (source) {
        module = source.toLowerCase() === 'veefin' ? 'VEEFIN' : 'GOLD';
      }
      const { data } = await Service.get(
        `${process.env.REACT_APP_GET_S3_URL}/?module=${module}&doc=${path}`
      );
      if (data?.success) {
        window.open(data?.data?.full_path, '_self');
      }
    } catch (err) {
      console.log('err', err);
    }
  };
  const fetchCollateralDocument = async () => {
    const lan = location.search.split('?lan=')[1];
    const {
      data
    } = await Service.get(`${process.env.REACT_APP_COLLATERAL_SERVICE}/applications/${lan}/documents`);
    if (data?.success) {
      setFileUrl(data?.data);
    }
  };
  const getSignedUrl = () => {
    const imagePath = location.search.split('?imagePath=')[1];
    Service.get(
      `${process.env.REACT_APP_GET_S3_URL}?module=GOLD&doc=${imagePath}`
    ).then((response) => {
      setFileUrl(response?.data?.data?.full_path);
    }).catch((error) => {
      console.log(error);
    });
  };

  const handleKeyPress = (event) => {
    if (event.ctrlKey && event.code === 'KeyP') {
      event.preventDefault();
    }
  };

  useEffect(() => {
    if ((location.search.split('?id=')).length > 1) {
      fetchCircularDocument();
    }
    if ((location.search.split('?path=')).length > 1) {
      fetchAuditorDocument();
    }
    if ((location.search.split('?lan=')).length > 1) {
      fetchCollateralDocument();
    }
    if ((location.search.split('?imagePath=')).length > 1) {
      getSignedUrl();
    }
    window.addEventListener('keydown', handleKeyPress);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <>
      <Global styles={printStyles} />
      <WrapperContainer fileUrl={fileUrl}>
        {
        fileUrl ? (
          <Document
            file={{ url: fileUrl }}
            onLoadError={(error) => {
              console.log(error);
            }}
            onLoadProgress={() => {
              console.log('PRGREOSS');
            }}
            page={1}
            onLoadSuccess={({ numPages }) => setPageCount(numPages)}
            renderMode='svg'
          >
            <div
              style={{
                'overflow-y': 'auto',
                height: 'calc(100vh - 110px)',
                width: '100%',
              }}
            >
              {Array.from(new Array(pageCount), (el, index) => (
                <Page
                  key={index}
                  pageNumber={index + 1}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  width={['sm', 'xs'].includes(screen) ? 300 : 800}
                />
              ))}
            </div>
          </Document>
        )
          : (
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open
            >
              <CircularProgress color='inherit' />
            </Backdrop>
          )
      }
      </WrapperContainer>
    </>
  );
};

export default DocumentPreview;
