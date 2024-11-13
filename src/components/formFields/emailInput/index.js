import ErrorText from '../errorHandler';
import { TextFieldStyled } from '../../styledComponents';

const EmailInput = (props) => {
  const {
    register, errors, input, variant
  } = props;
  return (
    <>
      <TextFieldStyled
        id={`${variant}-basic`}
        label={input.label}
        variant={variant}
        {...register(
          input.name,
          {
            required: input?.validation?.isRequired,
            pattern: new RegExp(input?.validation?.pattern)
          }
        )
        }
      />
      <ErrorText input={input} errors={errors} />
    </>
  );
};

export default EmailInput;
