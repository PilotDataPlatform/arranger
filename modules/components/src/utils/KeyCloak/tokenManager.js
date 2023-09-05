import { Cookies } from 'react-cookie';

class TokenManager {
  cookies;
  setTimeId;
  listeners;
  constructor() {
    this.cookies = new Cookies();
  }

  setLocalCookies(newCookies) {
    Object.keys(newCookies).forEach((key) => {
      this.cookies.set(key, newCookies[key], {
        path: '/',
        domain: 'localhost',
      });
    });
  }

  clearCookies() {
    Object.keys(this.cookies.getAll()).forEach((key) => {
      this.cookies.remove(key, { path: '/' });
    });
  }
}

const tokenManager = new TokenManager();
export default tokenManager;
