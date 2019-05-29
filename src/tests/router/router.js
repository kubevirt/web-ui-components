import { BrowserRouter } from 'react-router-dom';
import { shape } from 'prop-types';

export const router = {
  history: new BrowserRouter().history,
  route: {
    location: {},
    match: {},
  },
};

export const createContext = () => ({
  context: { router },
  childContextTypes: { router: shape({}) },
});
