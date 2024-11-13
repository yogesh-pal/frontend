import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useForm } from 'react-hook-form';
import jwtDecode from 'jwt-decode';
import {
  Grid, TableHead, TableBody, TableRow, TableCell,
  styled
} from '@mui/material';
import { BreadcrumbsContainerStyled, BreadcrumbsWrapperContainerStyled, HeaderContainer } from '../../../../components/styledComponents/container';
import { HeadingMaster } from '../../../../components/styledComponents/heading';
import { ErrorText, MenuNavigation } from '../../../../components';
import { TextFieldStyled } from '../../../../components/styledComponents';
import CustomToaster from '../../../../components/mesaageToaster';
import { ButtonPrimary, LoadingButtonPrimary } from '../../../../components/styledComponents/button';
import {
  CustomContainer, CustomForm, CustomGrid
} from '../../../Payment/paymentInitiate/common';
import { REGEX } from '../../../../constants/formGenerator/regex';
import { useScreenSize } from '../../../../customHooks';
import { CustomTable2, CustomTableCell, eCollectInvoice } from '../../helper';
import { Service } from '../../../../service';

const TableWrapper = styled('div')(() => ({
  overflow: 'auto',
  width: '100%'
}));

const GenerateECollectInvoice = () => {
  const [errorState, setErrorState] = useState({
    open: false,
    msg: '',
    alertType: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    lan: '',
    cuid: '',
    dtTokenLan: '',
    dtTokenCustomer: ''
  });
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);

  const {
    register, handleSubmit, setValue, formState: { errors }, getValues
  } = useForm();

  const lanInput = {
    name: 'lan',
    validation: {
      isRequired: true,
      requiredMsg: 'Please enter LOAN ACCOUNT NUMBER.',
      maxLength: 50,
      maxLenMsg: 'LOAN ACCOUNT NUMBER should not be more than 50 characters.',
      minLength: 10,
      minLenMsg: 'LOAN ACCOUNT NUMBER should have at least 10 characters.',
      pattern: REGEX.ALPHANUMERIC,
      patternMsg: 'Only alphanumeric characters are allowed.'
    }
  };

  const generatePDF = (decodedData) => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 10;
    const marginRight = 10;
    const contentWidth = pageWidth - marginLeft - marginRight;

    doc.setFontSize(18);

    const heading = 'E-Collect Invoice';
    const textWidth = doc.getTextWidth(heading);
    doc.setFont('helvetica', 'bold');
    doc.text(heading, (pageWidth - textWidth) / 2, 20);

    doc.setFontSize(12);

    const leftFields = [
      { key: 'Customer Name', value: `${decodedData?.customer_name}` },
      { key: 'CUID', value: `${decodedData?.customer_id}` },
      { key: 'Beneficiary Name', value: `${decodedData?.beneficiary_name_ecollect}` },
      { key: 'Beneficiary Bank', value: `${decodedData?.bank_name_ecollect}` }
    ];

    let yPos = 40;

    leftFields.forEach((field) => {
      doc.setFont('helvetica', 'bold');
      const keyText = `${field.key}:`;
      const keyWidth = doc.getTextWidth(keyText);
      doc.text(keyText, marginLeft, yPos);

      doc.setFont('helvetica', 'normal');
      doc.text(field.value, marginLeft + keyWidth + 1, yPos);
      yPos += 10;
    });

    doc.setFontSize(12);

    doc.setFont('helvetica', 'bold');
    const rightAlignedKey = 'Beneficiary IFSC Code:';
    const rightKeyTextWidth = doc.getTextWidth(rightAlignedKey);
    const rightValueTextWidth = doc.getTextWidth(`${decodedData?.ifsc_ecollect}`);
    // eslint-disable-next-line max-len
    doc.text(rightAlignedKey, pageWidth - rightKeyTextWidth - rightValueTextWidth - marginRight - 1, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`${decodedData?.ifsc_ecollect}`, pageWidth - rightValueTextWidth - marginRight, 70);
    const columns = ['Loan Account Number', 'Virtual Account Number', 'Maximum Payment Amount'];

    const rows = [
      [`${decodedData?.loan_account_no}`, `${decodedData?.virtual_account_number}`, `${Math.ceil(decodedData?.lan_pos)}`],
    ];

    doc.autoTable({
      head: [columns],
      body: rows,
      headStyles: {
        fillColor: [80, 42, 116],
      },
      startY: yPos,
      margin: { left: marginLeft, right: marginRight },
      tableWidth: contentWidth,
    });

    const longText = `Unique Virtual Account Number mentioned above is specifically generated for this transaction only and will be valid till ${decodedData?.issue_date}`;

    const textLines = doc.splitTextToSize(longText, contentWidth);

    doc.text(textLines, marginLeft, doc.lastAutoTable.finalY + 10);

    doc.text('Capri Global Capital Limited', marginLeft, doc.lastAutoTable.finalY + textLines.length * 10 + 20);

    const pdfOutputBlob = doc.output('blob');

    setPdfBlob(pdfOutputBlob);

    return pdfOutputBlob;
  };
  const screen = useScreenSize();

  const onLanSubmit = async (values) => {
    if (values.lan.trim().length) {
      const lanNum = values.lan.trim();
      if (!(lanNum.substr(0, 3) === '301')) {
        setErrorState({ open: true, msg: 'Invalid Loan Account Number.', alertType: 'error' });
        return;
      }

      try {
        setIsLoading(true);
        const { data } = await Service.get(`${process.env.REACT_APP_USER_VIEW}?lan=${lanNum}&fc=1&token=1`);
        const lanDetail = data.data.loan_detail.filter((loan) => loan?.lan.trim() === lanNum)[0];
        setCustomerDetails({
          name: `${data?.data?.first_name} ${data?.data?.last_name}`,
          cuid: data?.data?.customer_id,
          lan: lanNum,
          dtTokenLan: lanDetail?.dt,
          dtTokenCustomer: data?.data?.dt
        });
      } catch (err) {
        console.log(err);
        setErrorState({ open: true, msg: err?.response?.data?.errors?.detail ?? 'Something went wrong. Please try again later.', alertType: 'error' });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrorState({ open: true, msg: 'Invalid search.', alertType: 'error' });
    }
  };

  const generateInvoice = async () => {
    try {
      const reqBody = {
        customer_dt: customerDetails?.dtTokenCustomer,
        lan_dt: customerDetails?.dtTokenLan
      };

      const res = await Service.post(`${process.env.REACT_APP_RECEIPT_SERVICE}/e_collect_invoice_status`, reqBody);
      const decodedData = jwtDecode(res?.data?.data?.dt);
      console.log(decodedData);
      const invoicePdf = generatePDF(decodedData);
      let filePath = '';
      if (!decodedData?.s3_uploaded) {
        const URL = `${process.env.REACT_APP_GENERATE_S3_URL}?module=GOLD&doc=${decodedData?.virtual_account_number}.pdf&path=receipt/e_collect_invoice`;
        const { data } = await Service.get(URL);
        filePath = data?.data?.path;
        await Service.putWithFile(data?.data?.put, new Blob([invoicePdf]), {
          headers: {
            'Content-Type': 'application/pdf'
          }
        });
      }
      await Service.post(`${process.env.REACT_APP_RECEIPT_SERVICE}/e_collect_invoice_send_sms`, {
        dt: res?.data?.data?.dt,
        customer_mobile_number: customerDetails?.mobile_number,
        s3_path: filePath
      });
      setIsGenerated(true);
    } catch (err) {
      console.log(err);
      setErrorState({ open: true, msg: err?.response?.data?.message ?? 'Something went wrong. Please try again later.', alertType: 'error' });
    }
  };

  const downloadPDF = () => {
    if (pdfBlob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `e-collect-invoice-${Date.now()}.pdf`;
      link.click();
    }
  };

  const handleReset = () => {
    setValue('lan', '');
    setErrorState({
      open: false,
      msg: '',
      alertType: ''
    });
    setIsLoading(false);
    setCustomerDetails({
      name: '',
      lan: '',
      cuid: '',
    });
    setPdfBlob(null);
    setIsGenerated(false);
  };

  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={eCollectInvoice} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomToaster alertShow={errorState} setAlertShow={setErrorState} />
      <CustomContainer>
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Generate E-Collect - Invoice
          </HeadingMaster>
        </HeaderContainer>
        <HeaderContainer
          item
          xs={12}
          padding='0 20px 0 20px'
          flexDirection='row'
          justifyContent='center'
        >
          <CustomForm
            onSubmit={handleSubmit(onLanSubmit)}
            width={['xs', 'sm'].includes(screen) ? '100%' : ''}
          >
            <TextFieldStyled
              id='lan'
              label='*LOAN ACCOUNT NUMBER'
              variant='outlined'
              value={getValues('lan')}
              {...register('lan', {
                onChange: (e) => {
                  setValue('lan', e.target.value.toUpperCase().replace(/\s/g, ''), { shouldValidate: true });
                },
                required: true,
                maxLength: (lanInput.validation.maxLength),
                minLength: (lanInput.validation.minLength),
                pattern: REGEX.ALPHANUMERIC
              })}
            />
            <CustomGrid>
              <ErrorText input={lanInput} errors={errors} />
            </CustomGrid>
            <Grid>
              <LoadingButtonPrimary
                variant='contained'
                type='submit'
                disabled={isLoading}
              >
                Search
              </LoadingButtonPrimary>
              <LoadingButtonPrimary
                variant='contained'
                onClick={() => handleReset()}
              >
                Reset
              </LoadingButtonPrimary>
            </Grid>
          </CustomForm>
        </HeaderContainer>
        {customerDetails.lan && (
        <>
          <Grid container padding='20px 20px 10px' display='flex'>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <TableWrapper>
                <CustomTable2>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center'>Customer ID</TableCell>
                      <TableCell align='center'>LAN</TableCell>
                      <TableCell align='center'>Customer Name</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <CustomTableCell align='center'>
                        {customerDetails.cuid}
                      </CustomTableCell>

                      <CustomTableCell align='center'>
                        {customerDetails.lan}
                      </CustomTableCell>
                      <CustomTableCell align='center'>
                        {customerDetails.name}
                      </CustomTableCell>
                    </TableRow>
                  </TableBody>
                </CustomTable2>
              </TableWrapper>
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ButtonPrimary align='center' onClick={generateInvoice}>
              Generate Invoice
            </ButtonPrimary>
            <ButtonPrimary align='center' disabled={!isGenerated} onClick={downloadPDF}>
              Download Invoice
            </ButtonPrimary>
          </div>
        </>
        )}

      </CustomContainer>
    </>
  );
};
export default GenerateECollectInvoice;
