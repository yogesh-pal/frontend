import TextInput from './textInputGrid';
import TextInput2 from './textInputGrid2';
import Select from './selectGrid';
import RadioInput from './radioInputGrid';
import CheckboxInput from './checkboxInputGrid';
import ButtonInput from './buttonInputGrid';
import MultiSelectInput from './multiSelectGrid';
import DatePickerInput from './datePickerGrid';
import TimePickerInput from './timePickerGrid';
import PasswordInput from './passwordInputGrid';
import FileInput from './fileInputGrid.js';
import Toggle from './toggleGrid';
import ChipInput from './chipInputGrid';
import InputButtonOtp from './InputButtonOTPGrid';
import InputOTP from './InputOTPGrid';
import DeleteButtonGrid from './deleteButtonGrid';
import LivePhoto from './livePhotoGrid';
import CrifButton from './CrifButtonGrid';
import Deviations from './DeviationsGrid';
import Sperator from './SperatorGrid';
import AutoComplete from './autoCompleteGrid';
import MultiplePhotoGrid from './MultipleLivePhotoGrid';
import MultipleLivePhotoPreviewGrid from './MultipleLivePhotoPreviewGrid';
import RateChartCodeTableGrid from './rateChartCodeTableGrid';
import EndUseOfGoldGrid from './endUseOfGoldGrid';
import { IDENTIFIER } from '../../../constants';
import CAMGrid from './camGrid/index';
import PdfFileViewerGrid from './pdfFilesViewerGrid';
import CustomizeRadioButton from './customizeRadioButtonGrid';
import QRCodeGrid from './QRCodeGrid';
import HeaderGrid from './headerGrid';

export const FormFields = {
  [IDENTIFIER.INPUTTEXT]: TextInput,
  [IDENTIFIER.INPUTTEXT2]: TextInput2,
  [IDENTIFIER.SELECT]: Select,
  [IDENTIFIER.RADIO]: RadioInput,
  [IDENTIFIER.CHECKBOX]: CheckboxInput,
  [IDENTIFIER.BUTTON]: ButtonInput,
  [IDENTIFIER.TIMEPICKER]: TimePickerInput,
  [IDENTIFIER.DATEPICKER]: DatePickerInput,
  [IDENTIFIER.MULTISELECT]: MultiSelectInput,
  [IDENTIFIER.PASSWORD]: PasswordInput,
  [IDENTIFIER.FILE]: FileInput,
  [IDENTIFIER.Toggle]: Toggle,
  [IDENTIFIER.ChipInput]: ChipInput,
  [IDENTIFIER.INPUTBUTTONOTP]: InputButtonOtp,
  [IDENTIFIER.INPUTOTP]: InputOTP,
  [IDENTIFIER.DELETEBUTTON]: DeleteButtonGrid,
  [IDENTIFIER.LIVEPHOTO]: LivePhoto,
  [IDENTIFIER.CRIFBUTTON]: CrifButton,
  [IDENTIFIER.DEVIATIONS]: Deviations,
  [IDENTIFIER.SPERATOR]: Sperator,
  [IDENTIFIER.AUTOCOMPLETE]: AutoComplete,
  [IDENTIFIER.MULTIPLELIVEPHOTO]: MultiplePhotoGrid,
  [IDENTIFIER.RATECHARTCODETABLE]: RateChartCodeTableGrid,
  [IDENTIFIER.EndUseOfGoldGrid]: EndUseOfGoldGrid,
  [IDENTIFIER.CAMREPORT]: CAMGrid,
  [IDENTIFIER.MULTIPLELIVEPHOTOPREVIEW]: MultipleLivePhotoPreviewGrid,
  [IDENTIFIER.PDFFILEVIEWER]: PdfFileViewerGrid,
  [IDENTIFIER.CUSTOMRADIOBUTTON]: CustomizeRadioButton,
  [IDENTIFIER.QRCODE]: QRCodeGrid,
  [IDENTIFIER.HEADER]: HeaderGrid
};
