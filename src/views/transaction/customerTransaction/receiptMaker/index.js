/* eslint-disable camelcase */
/* eslint-disable max-len */
import { useEffect, useState } from 'react';
import {
  FormControl,
  RadioGroup
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import {
  ToastMessage, MenuNavigation
} from '../../../../components';
import {
  CustomContainerStyled, HeadingMaster, BreadcrumbsWrapperContainerStyled,
  BreadcrumbsContainerStyled, HeaderContainer, RadiobuttonStyle
} from '../../../../components/styledComponents';
import {
  receiptMakerNavigation
} from '../../helper';
import ReceiptChecker from '../receiptChecker';
import ReceiptMaker from './receiptMakerMain';
import { Service } from '../../../../service';
import PageLoader from '../../../../components/PageLoader';

const ReceiptMakerPar = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [selectedMode, setSelectedMode] = useState('cashDeposit');

  const handleRadio = (event) => {
    setSelectedMode(event.target.value);
  };

  const handleReceipt = () => {
    setSelectedMode('depositSummary');
  };

  const fetchLOSConfig = async () => {
    try {
      const { data } = await Service.get(process.env.REACT_APP_LOS_CONFIG_SERVICE);
      console.log('data is', data);
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLOSConfig();
  }, []);

  return (
    loading ? <PageLoader /> : (
      <>
        <BreadcrumbsWrapperContainerStyled>
          <BreadcrumbsContainerStyled>
            <MenuNavigation navigationDetails={receiptMakerNavigation} />
          </BreadcrumbsContainerStyled>
        </BreadcrumbsWrapperContainerStyled>
        <CustomContainerStyled padding='0 !important'>
          <ToastMessage
            alertShow={alertShow}
            setAlertShow={setAlertShow}
          />
          <HeaderContainer>
            <FormControl>
              <RadioGroup
                defaultValue='cashDeposit'
                row
                value={selectedMode}
                onChange={handleRadio}
              >
                <FormControlLabel
                  value='cashDeposit'
                  control={<RadiobuttonStyle color='secondary' />}
                  label={(
                    <HeadingMaster>
                      Cash Deposit
                    </HeadingMaster>
)}
                  labelPlacement='end'
                />
                <FormControlLabel
                  value='depositSummary'
                  control={<RadiobuttonStyle color='secondary' />}
                  label={(
                    <HeadingMaster>
                      Deposit Summary
                    </HeadingMaster>
)}
                  labelPlacement='end'
                />
              </RadioGroup>
            </FormControl>
          </HeaderContainer>
          {selectedMode === 'cashDeposit' ? <ReceiptMaker handleReceipt={handleReceipt} config={config} /> : <ReceiptChecker /> }
        </CustomContainerStyled>
      </>
    )
  );
};
export default ReceiptMakerPar;
