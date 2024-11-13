/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import { ToastMessage } from '../../../../components';
import {
  CenterContainer, ButtonPrimary,
  LoadingButtonPrimary
} from '../../../../components/styledComponents';
import {
  CustomText, spuriousFormFields, nonSpuriousFormFields, CustomDiv, unacceptableFormFields, acceptableFormFields
} from '../../helper';

const UnacceptableModal = (props) => {
  const {
    acceptableItems,
    setAcceptableItems,
    unacceptableItems,
    setUnacceptableItems,
    data,
    unacceptableSubmitHandler
  } = props;
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const {
    register, unregister, handleSubmit, formState: { errors }, setValue, setError, getValues
  } = useForm();

  const handleUnacceptableAddMore = () => {
    if (unacceptableItems.length) {
      setUnacceptableItems([...unacceptableItems, [unacceptableItems.length - 1] + 1]);
    } else {
      setUnacceptableItems([1]);
    }
  };

  const handleAcceptableAddMore = () => {
    if (acceptableItems.length) {
      setAcceptableItems([...acceptableItems, acceptableItems[acceptableItems.length - 1] + 1]);
    } else {
      setAcceptableItems([1]);
    }
  };

  const handleUnacceptableDelete = (itemNumber) => {
    setUnacceptableItems(unacceptableItems.filter((item) => item !== itemNumber));
    unregister([
      `unacceptable_count_${itemNumber}`,
      `unacceptable_totalWeight_${itemNumber}`,
      `unacceptable_remarks_${itemNumber}`,
    ]);
  };

  const handleAcceptableDelete = (itemNumber) => {
    setAcceptableItems(acceptableItems.filter((item) => item !== itemNumber));
    unregister([
      `acceptable_count_${itemNumber}`,
      `acceptable_totalWeight_${itemNumber}`,
      `acceptable_beads_stone_weight_${itemNumber}`,
      `acceptable_purity_${itemNumber}`,
      `acceptable_remarks_${itemNumber}`
    ]);
  };

  return (
    <>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <>
        <CustomDiv>
          <CustomText>Unacceptable Items</CustomText>
          <ButtonPrimary
            onClick={handleUnacceptableAddMore}
          >
            <AddIcon />
          </ButtonPrimary>
        </CustomDiv>
        <form>
          {unacceptableItems.map((itemNumber) => unacceptableFormFields(data, register, getValues, setValue, errors, itemNumber, handleUnacceptableDelete, unacceptableItems.length))}
        </form>
        <CustomDiv>
          <CustomText>Acceptable Items</CustomText>
          <ButtonPrimary
            onClick={handleAcceptableAddMore}
          >
            <AddIcon />
          </ButtonPrimary>
        </CustomDiv>
        <form onSubmit={handleSubmit(unacceptableSubmitHandler)}>
          {acceptableItems.map((itemNumber) => acceptableFormFields(data, register, setValue, getValues, setError, errors, itemNumber, handleAcceptableDelete, acceptableItems.length))}
          <CenterContainer>
            <LoadingButtonPrimary type='submit'>
              Submit
            </LoadingButtonPrimary>
          </CenterContainer>
        </form>
      </>

    </>
  );
};
export default React.memo(UnacceptableModal);
