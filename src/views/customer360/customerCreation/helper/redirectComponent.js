import DialogBox from '../../../../components/dialogBox';
import { ButtonPrimary } from '../../../../components/styledComponents';
import { CenterContainer, UPIModelTextStyled } from './style';

const showComponent = (props) => {
  const {
    setValue,
    setDetails,
    updateJsonHandler,
    input,
    refComponent
  } = props;
  const okClickHandler = () => {
    try {
      setValue('enter_bank_details', 'Yes');
      setDetails((pre) => ({
        ...pre,
        isShowComponent: false
      }));
      refComponent.current = null;
      updateJsonHandler(input, {
        success: true,
        dynamicKey: 'redirect'
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  return (
    <DialogBox
      isOpen
      title='Redirect to the manual process'
      padding='0px'
      width='500px'
    >
      <CenterContainer>
        <UPIModelTextStyled>
          { refComponent?.current?.modelDetails?.message ?? 'Request timed out. Please add details manually'}
        </UPIModelTextStyled>
        <ButtonPrimary onClick={okClickHandler}>Ok</ButtonPrimary>
      </CenterContainer>
    </DialogBox>
  );
};

export {
  showComponent
};
