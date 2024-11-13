import {
  UPIContainerStyled,
  UPILogoImageStyled,
  UPITypographyStyled,
  UPITextStyled,
  UPITagContainerStyled
} from './style';
import UPILOGO from '../../../../assets/upi_logo_icon.png';

const BankVerification = (value, disabled) => {
  const TextMapping = {
    Yes: 'Verify with',
    No: 'Add details manually'
  };
  return (
    <UPITypographyStyled disabled={disabled}>
      { TextMapping[value]}
    </UPITypographyStyled>
  );
};

const UPIModeComp = (value, disabled) => (
  <UPIContainerStyled>
    {BankVerification(value, disabled)}
    <UPILogoImageStyled disabled={disabled} src={UPILOGO} alt='UPI ICON' />
    <UPITagContainerStyled disabled={disabled}>Faster</UPITagContainerStyled>
  </UPIContainerStyled>
);

const ManualModeComp = (value) => (
  <UPIContainerStyled>
    {BankVerification(value)}
  </UPIContainerStyled>
);

const LeftSectionComp = (value, disabled = false) => {
  const ComponentMapping = {
    Yes: UPIModeComp(value, disabled),
    No: ManualModeComp(value, disabled)
  };
  return ComponentMapping[value];
};

const BottomSectionComp = (value, disabled = false) => {
  const ComponentMapping = {
    Yes: "we'll debit ₹1 from your account to verify the details. we'll refund this once the verification is complete",
    No: 'Add you account number, IFSC code manually',
  };
  return (
    <UPIContainerStyled>
      <UPITextStyled disabled={disabled}>{ComponentMapping[value]}</UPITextStyled>
    </UPIContainerStyled>
  );
};

export {
  LeftSectionComp,
  BottomSectionComp
};
