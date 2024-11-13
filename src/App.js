import { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  BrowserRouter, Routes, Route,
} from 'react-router-dom';
import { mode } from './assets/css/variables';
import ScreenSizeDisplay from './components/screenDisplay';
// import BuildVerionsDisplay from './components/BuildVerionDisplay';
import PrivateRoutes from './routes/privateRoutes';
import Dashboard from './layout/dashboard';
import Login from './views/Login';
import InitatePayment from './views/Payment/paymentInitiate';
import DownloadDocument from './views/loanDisbursal/list/disbursement/downloadDocument';
import PaymentStatus from './views/Payment/PaymentStatus';
import DownloadTransactionDocument from './views/transaction/customerTransaction/downloadDocument';
import CamReport from './views/camReport';
import CPVCamHandler from './views/customer360/contactPointVerification/CAMHandler';
import MobileSam from './views/ImageCutout';

const App = () => {
  // eslint-disable-next-line no-unused-vars
  const [themeMode, setThemeMode] = useState(false);
  const themeVariables = createTheme(themeMode ? mode.light : mode.dark);

  return (
    <ThemeProvider theme={themeVariables}>
      <BrowserRouter>
        <Routes>
          <Route path='*' element={<PrivateRoutes />}>
            <Route path='*' element={<Dashboard />} />
          </Route>
          <Route path='/' element={<Login />} />
          <Route path='/receipt/document' element={<DownloadTransactionDocument />} />
          <Route path='/collateral/document' element={<DownloadTransactionDocument />} />
          <Route path='/los/document' element={<DownloadDocument />} />
          <Route path='/initiate' element={<InitatePayment />} />
          <Route path='/payment-status' element={<PaymentStatus />} />
          <Route path='/cam-report/:custAndAppNo' element={<CamReport />} />
          <Route path='/cam-report-cpv/:custCPVId' element={<CPVCamHandler />} />
          <Route path='/mobile-sam' element={<MobileSam />} />
        </Routes>
      </BrowserRouter>
      {
        window.location.hostname === 'localhost'
        && <ScreenSizeDisplay />
      }
      {/* <BuildVerionsDisplay /> */}
    </ThemeProvider>
  );
};

export default App;
