/* eslint-disable max-len */
import { useEffect, useState, Suspense } from 'react';
import {
  Routes, Route, useNavigate
} from 'react-router-dom';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { IdleTimerProvider } from 'react-idle-timer';
import { dashboardRoutes } from '../routes';
import Header from '../components/header';
import Footer from '../components/footer';
import { checkUserPermission } from '../utils';
import { ToastMessage } from '../components';
import NoInternetPage from '../components/noInternetPage';
import PageLoader from '../components/PageLoader';
import { login, loginUserDetails, logout } from '../redux/reducer/login';

const LayoutContainer = styled(Box)(() => ({
  height: 'calc(100vh - 170px)',
  overflow: 'auto',
  paddingBottom: '20px',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
}));

const LayoutContainerStyled = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}));

const getDynamicComponent = (element) => (
  <Suspense fallback={<PageLoader opacity='1' />}>
    {element}
  </Suspense>
);

const dashboardLayout = () => {
  const [isUserOffline, setIsUserOffline] = useState(false);
  const [alertShow, setAlertShow] = useState({ open: false, msg: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const checkChildrenRoutes = (item) => {
    let routesArray = [];
    item.children.map((element) => {
      if (element?.children && element.children.length) {
        const childRoutesArray = checkChildrenRoutes(element);
        if (childRoutesArray.length) {
          routesArray = [...childRoutesArray, ...routesArray, element];
        }
        return;
      }
      if (element?.permission && (Array.isArray(element?.permission[0]) ? element?.permission.some((ele) => checkUserPermission(ele)) : checkUserPermission(element.permission))) {
        routesArray = [...routesArray, element];
      }
      return routesArray;
    });
    if (routesArray.length) {
      routesArray.push(item);
    }
    return routesArray;
  };

  const routesHandler = () => {
    try {
      const finalRoutes = dashboardRoutes.map((ele) => {
        if (ele?.children && ele.children.length) {
          const routesArray = checkChildrenRoutes(ele);
          return routesArray.map((route) => <Route key={route.path} path={route.path} element={getDynamicComponent(route.component)} />);
        }
        if (ele.hasOwnProperty('permission')) {
          if (checkUserPermission(ele.permission) || (ele.permission.length && Array.isArray(ele.permission[0]) && ele.permission.some((element) => checkUserPermission(element)))) {
            return <Route key={ele.path} path={ele.path} element={getDynamicComponent(ele.component)} />;
          }
          return null;
        }
        return <Route key={ele.path} path={ele.path} element={getDynamicComponent(ele.component)} />;
      });
      return finalRoutes;
    } catch (e) {
      console.log('Error', e);
    }
  };

  useEffect(() => {
    window.addEventListener('online', () => {
      setAlertShow({ open: true, msg: 'You are back online!', alertType: 'success' });
      setIsUserOffline(false);
    });
    window.addEventListener('offline', () => setIsUserOffline(true));
  }, []);

  const onIdle = () => {
    try {
      dispatch(login(false));
      dispatch(loginUserDetails({ }));
      dispatch(logout());
      navigate('/', { replace: true });
    } catch (e) {
      console.log('Error', e);
    }
  };
  return (
    <IdleTimerProvider timeout={1000 * 60 * process.env.REACT_APP_AUTOLOGOUT_TIME_IN_MINUTES} onIdle={onIdle}>
      <ToastMessage
        alertShow={alertShow}
        setAlertShow={setAlertShow}
      />
      <LayoutContainerStyled>

        <Header />
        {isUserOffline ? <NoInternetPage /> : null}
        <LayoutContainer>

          <Routes>
            {routesHandler()}
          </Routes>
        </LayoutContainer>
        <Footer />
      </LayoutContainerStyled>
    </IdleTimerProvider>
  );
};

export default dashboardLayout;
