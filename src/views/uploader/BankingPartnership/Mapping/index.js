import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Grid } from '@mui/material';
import DraggableUpload from '../../../../components/DraggableUpload/DraggableUpload';
import { LoadingButtonPrimary } from '../../../../components/styledComponents';
import { Service } from '../../../../service';

const CustomGrid = styled(Grid)`
width: 100%;
display: flex;
justify-content: right;
height: fit-content;
padding-right: 15px;
`;

const Mapping = (props) => {
  const { setAlertShow } = props;
  const [selectedFile, setSelectedFile] = useState([]);
  const inputRef = useRef();
  const [isLoading, setIsloading] = useState(false);
  const allowedFileTypes = ['application/vnd.ms-excel', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/wps-office.xlsx'];

  const handleRemove = (sfile) => {
    setSelectedFile((prev) => prev.filter((file) => file.name !== sfile.name));
  };

  const filePickedorDropped = (files) => {
    if (!allowedFileTypes.includes(files[0].type)) {
      setAlertShow({ open: true, msg: 'Invalid file. Only XLS, CSV, XLSX files are supported', alertType: 'error' });
      return;
    }
    const filesizeinMB = files[0].size / 1024 / 1024;
    if (filesizeinMB > 10) {
      setAlertShow({ open: true, msg: 'Maximum file size allowed is 10 MB.', alertType: 'error' });
      return;
    }
    setSelectedFile(files);
  };

  const handleSubmit = async () => {
    try {
      if (selectedFile.length === 0) {
        setAlertShow({
          open: true,
          msg: 'No File found to process.',
          alertType: 'error'
        });
        return;
      }
      setIsloading(true);
      const fileToUpload = selectedFile[0];
      const fileName = selectedFile[0].name;
      const filePath = 'banking_partner_upload/mapping';
      const URL = `${process.env.REACT_APP_GENERATE_S3_URL}?module=GOLD&doc=${fileName}&path=${filePath}`;
      const { data, status } = await Service.get(URL);
      if (data?.success && status === 200) {
        await Service.post(process.env.REACT_APP_BANKINGPARTNERSHIP_UPLOADER, {
          file_name: fileName,
          s3_file_path: data.data.path,
          file_type: 'mapping'
        });
        await Service.putWithFile(data.data.put, fileToUpload, {
          headers: {
            'Content-Type': selectedFile[0].type,
            'Access-Control-Allow-Origin': '*'
          }
        });
        setAlertShow({ open: true, msg: 'Document uploaded successfully' });
        inputRef.current.value = '';
        setSelectedFile([]);
      } else {
        setAlertShow({ open: true, msg: 'Document could not be uploaded, Please try again', alertType: 'error' });
      }
    } catch (err) {
      console.log(err);
      let errorMessage = 'Document could not be uploaded, Please try again';
      if (err?.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      }
      setAlertShow({ open: true, msg: errorMessage, alertType: 'error' });
    } finally {
      setIsloading(false);
    }
  };
  return (
    <Grid container width='100%' paddingBottom='10px'>
      <Grid item width='100%'>
        <DraggableUpload
          selectedFile={selectedFile}
          inputRef={inputRef}
          supportedFiles={['XLS', 'CSV', 'XLSX']}
          filePickedorDropped={filePickedorDropped}
          loading={isLoading}
          handleRemove={handleRemove}
        />
      </Grid>
      <CustomGrid
        item
      >
        <LoadingButtonPrimary
          variant='contained'
          onClick={handleSubmit}
        >
          Process
        </LoadingButtonPrimary>
      </CustomGrid>
    </Grid>

  );
};

export default Mapping;
