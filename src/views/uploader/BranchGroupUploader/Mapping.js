import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Grid, Typography } from '@mui/material';
import DraggableUpload from '../../../components/DraggableUpload/DraggableUpload';
import { LoadingButtonPrimary } from '../../../components/styledComponents';
import { Service } from '../../../service';

const CustomGrid = styled(Grid)`
width: 100%;
display: flex;
height: fit-content;
padding-top:20px;
flex-direction: column;
`;

const BranchGroupingMakerMapper = (props) => {
  const { setAlertShow } = props;
  const [selectedFile, setSelectedFile] = useState([]);
  const inputRef = useRef();
  const [isLoading, setIsloading] = useState(false);
  const allowedFileTypes = ['application/vnd.ms-excel', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/wps-office.xlsx'];

  const branchGroupingMakerHelperText = `Upload file with columns in order :-
            ["BR Code", "Branch Name", "BM1- Emp Code", "BM1 - Emp Name", "AM-Emp Code", "AM-Name",
            "RM-Emp Code", "RM-Name", "ZBH-Emp Code", "ZBH-Name", "State", "Zone"]`;

  const handleRemove = (sfile) => {
    setSelectedFile((prev) => prev.filter((file) => file.name !== sfile.name));
  };

  const filePickedorDropped = (files) => {
    try {
      if (files.length === 0) {
        setAlertShow({
          open: true,
          msg: 'No files were selected.',
          alertType: 'error'
        });
        return;
      }
      if (!allowedFileTypes.includes(files[0].type)) {
        setAlertShow({ open: true, msg: 'Invalid file. Only XLS, CSV, XLSX files are supported', alertType: 'error' });
        return;
      }
      const filesizeinMB = files[0].size / 1024 / 1024;
      if (filesizeinMB > 5) {
        setAlertShow({ open: true, msg: 'Maximum file size allowed is 10 MB.', alertType: 'error' });
        return;
      }
      setSelectedFile(files);
    } catch (error) {
      console.error('Error validating the picked or dropped file:', error);
      setAlertShow({
        open: true,
        msg: 'Error validating the picked or dropped file.',
        alertType: 'error'
      });
    }
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
      const filePath = 'branch_grouping/temp/';
      const URL = `${process.env.REACT_APP_GENERATE_S3_URL}?module=GOLD&doc=${fileName}&path=${filePath}`;
      const { data, status } = await Service.get(URL);
      if (data?.success && status === 200) {
        try {
          await Service.putWithFile(data.data.put, fileToUpload, {
            headers: {
              'Content-Type': selectedFile[0].type,
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch (uploadError) {
          setAlertShow({
            open: true,
            msg: 'Error uploading file to S3. Please try again.',
            alertType: 'error'
          });
          return;
        }

        try {
          await Service.post(process.env.REACT_APP_BRANCH_GROUPING_UPLOADER, {
            tempS3FilePath: data.data.path,
          });
          setAlertShow({ open: true, msg: 'Document uploaded successfully' });
          inputRef.current.value = '';
          setSelectedFile([]);
        } catch (er) {
          setAlertShow({
            open: true,
            msg: 'Error creating the branch grouping request.',
            alertType: 'error'
          });
        }
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
        <Typography variant='body2' color='red'>
          <h4>
            {branchGroupingMakerHelperText}
          </h4>
        </Typography>
        <LoadingButtonPrimary
          variant='contained'
          onClick={handleSubmit}
          style={{ width: '150px', margin: '20px auto' }}
        >
          Process
        </LoadingButtonPrimary>
      </CustomGrid>
    </Grid>

  );
};

export default BranchGroupingMakerMapper;
