import { cloneDeep } from 'lodash';
import { styled } from '@mui/material/styles';
import {
  Stepper, Step, StepLabel, Stack, StepConnector, stepConnectorClasses
} from '@mui/material';
import { formBackHandler } from '../formGenerator/utils';

const WrapperStepper = styled(Stepper)(({ direction }) => ({
  minHeight: direction === 'vertical' ? '400px' : 'auto',
  maxWidth: direction === 'vertical' ? '120px' : 'auto',
}));

const WrapperStack = styled(Stack)(({ position }) => ({
  minWidth: position === 'vertical' ? '200px' : '100%',
  marginTop: position === 'vertical' ? '50px' : 'auto',
  overflowX: 'auto',
  paddingBottom: '10px'
}));

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.vertical}`]: {
    position: 'relative',
    marginTop: '0%',
    marginBottom: '-13%',
  },
  [`& .${stepConnectorClasses.lineVertical}`]: {
    position: 'absolute',
    height: '100%',
    top: '-8px',
    left: '12px',
    width: '3px'
  },
  [`& .${stepConnectorClasses.lineHorizontal}`]: {
    marginTop: '15px'
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.lineVertical}`]: {
      backgroundImage: theme?.stepConnector?.primary,
      position: 'absolute',
      top: '-8px',
      left: '11px',
      height: '100%'
    },
    [`& .${stepConnectorClasses.lineHorizontal}`]: {
      backgroundImage: theme?.stepConnector?.primary,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.lineVertical}`]: {
      backgroundImage: theme?.stepConnector?.primary,
      position: 'absolute',
      top: '-8px',
      left: '11px',
      height: '100%'
    },
    [`& .${stepConnectorClasses.lineHorizontal}`]: {
      backgroundImage: theme?.stepConnector?.primary,
    },
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme?.palette?.mode === 'dark' ? theme?.palette?.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage: theme?.stepper?.primary,
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage: theme?.stepper?.primary,
  }),
}));

const ColorlibStepIcon = (props) => {
  const {
    active, completed, className, icon
  } = props;

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icon}
    </ColorlibStepIconRoot>
  );
};

const CustomStepper = (props) => {
  const {
    stepper, activeFormIndex, setValue, getValues,
    setActiveFormIndex, formDetails, unregister
  } = props;

  const unregisterHandler = (index) => {
    try {
      const tempForm = cloneDeep(formDetails);
      const previousForm = tempForm.form[index];
      const readFormValue = previousForm.input.map((item) => item.name);
      const previousFormValue = getValues(readFormValue);
      readFormValue.forEach((item, inputIndex) => {
        if (previousFormValue[inputIndex] === undefined) {
          unregister(item);
        }
      });
    } catch (error) {
      console.log('Error', error);
    }
  };

  return (
    <WrapperStack spacing={4} position={stepper?.stepperDirection}>
      <WrapperStepper direction={stepper?.stepperDirection} activeStep={activeFormIndex} alternativeLabel={stepper?.stepperDirection === 'horizontal'} orientation={stepper?.stepperDirection} connector={<ColorlibConnector />}>
        {stepper?.steps.map((label, index) => (
          <Step
            key={label}
            onClick={() => {
              if (window.location.hostname === 'localhost') {
                if (activeFormIndex > 0) {
                  unregisterHandler(activeFormIndex);
                }
                setValue('activeFormIndex', index);
                setActiveFormIndex(index);
                if (index < activeFormIndex) {
                  let tempIndex = activeFormIndex;
                  while (index < tempIndex) {
                    if (formDetails.form[tempIndex]?.onBack) {
                      formBackHandler(formDetails.form, tempIndex, setValue);
                    }
                    tempIndex -= 1;
                  }
                }
                if (formDetails?.onLoadState) {
                  formDetails?.onLoadState(setValue);
                }
              } else if (index < activeFormIndex) {
                if (activeFormIndex > 0) {
                  unregisterHandler(activeFormIndex);
                }
                setValue('activeFormIndex', index);
                setActiveFormIndex(index);
                let tempIndex = activeFormIndex;
                while (index < tempIndex) {
                  if (formDetails.form[tempIndex]?.onBack) {
                    formBackHandler(formDetails.form, tempIndex, setValue);
                  }
                  tempIndex -= 1;
                }
                if (formDetails?.onLoadState) {
                  formDetails?.onLoadState(setValue);
                }
              }
            }}
          >
            <StepLabel
              StepIconComponent={ColorlibStepIcon}
              StepIconProps={{ icon: stepper?.icons[index] }}
              step
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </WrapperStepper>
    </WrapperStack>
  );
};

export default CustomStepper;
