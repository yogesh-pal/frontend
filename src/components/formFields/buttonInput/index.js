import { useState, useRef } from 'react';
import { ButtonPrimary } from '../../styledComponents';

const ButtonInput = (props) => {
  const {
    input,
    activeFormIndex,
    setActiveFormIndex,
    setValue,
    updateJsonHandler,
    getValues
  } = props;

  const [details, setDetails] = useState({});
  const btnRef = useRef(null);

  const onClickHandler = async () => {
    try {
      if (input?.clickHanlder) {
        const val = await input.clickHanlder({
          activeFormIndex,
          setActiveFormIndex,
          setValue,
          updateJsonHandler,
          input,
          getValues,
          details,
          setDetails,
          refComponent: btnRef
        });

        if (val?.success) {
          updateJsonHandler(input, val);
        }
      }
    } catch (e) {
      console.log('Error', e);
    }
  };

  const componentRenderHandler = () => {
    try {
      console.log('Component details handler');
      return input.component({
        setValue,
        details,
        setDetails,
        getValues,
        updateJsonHandler,
        input,
        refComponent: btnRef
      });
    } catch (e) {
      console.log('Error', e);
    }
  };

  return (
    <>
      <ButtonPrimary
        onClick={onClickHandler}
        style={input?.style}
        type={input?.action}
        variant='contained'
        disabled={input?.disabled}
      >
        {input?.label ?? input?.name}
      </ButtonPrimary>
      {details?.isShowComponent && componentRenderHandler()}

    </>
  );
};

export default ButtonInput;
