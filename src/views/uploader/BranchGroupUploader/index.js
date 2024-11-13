/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import {
  HeaderContainer, CustomContainerStyled, BreadcrumbsContainerStyled,
  BreadcrumbsWrapperContainerStyled, HeadingMaster
} from '../../../components/styledComponents';
import { MenuNavigation, ToastMessage } from '../../../components';
import { NAVIGATION } from '../../../constants';
import BranchGroupingMakerMapper from './Mapping';

export const CustomDiv = styled.div(({
  padding
}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  paddingLeft: '10px',
  padding,
}));

const BranchGroupingMaker = () => {
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });

  const navigationDetails = useMemo(() => [
    { name: 'Dashboard', url: NAVIGATION.dashboard },
    { name: 'Uploader', url: NAVIGATION.uploader },
    { name: 'Branch Group Uploader', url: NAVIGATION.branchGroupUploader }

  ], NAVIGATION);
  return (
    <>
      <BreadcrumbsWrapperContainerStyled>
        <BreadcrumbsContainerStyled>
          <MenuNavigation navigationDetails={navigationDetails} />
        </BreadcrumbsContainerStyled>
      </BreadcrumbsWrapperContainerStyled>
      <CustomContainerStyled padding='0px 20px 0px !important'>
        <ToastMessage
          alertShow={alertShow}
          setAlertShow={setAlertShow}
        />
        <HeaderContainer item xs={12}>
          <HeadingMaster>
            Branch Group Maker
          </HeadingMaster>
        </HeaderContainer>
        <BranchGroupingMakerMapper setAlertShow={setAlertShow} />
      </CustomContainerStyled>
    </>
  );
};

export default BranchGroupingMaker;
