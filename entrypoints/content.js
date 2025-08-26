export default defineContentScript({
  matches: ['*://wplace.live/*', '*://*.wplace.live/*'],
  main() {
    if (typeof browser === 'undefined') {
      window.browser = chrome;
    }
    if (window.location.hostname.includes('wplace.live')) {
      browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'fetchUserData') {
          fetchUserData().then(result => {
            sendResponse(result);
          }).catch(error => {
            sendResponse({ error: true, message: error.message });
          });
          return true;
        }
        if (request.action === 'logout') {
          performLogout().then(result => {
            sendResponse(result);
          }).catch(error => {
            sendResponse({ error: true, message: error.message });
          });
          return true;
        }
        if (request.action === 'reloadPage') {
          window.location.reload();
          sendResponse({ success: true });
          return true;
        }
      });
      
      async function fetchUserData() {
        try {
          console.log('Content script: Fetching user data...');
          console.log('Current URL:', window.location.href);
          console.log('User agent:', navigator.userAgent);
          
          const response = await fetch('https://backend.wplace.live/me', {
            credentials: 'include'
          });
          
          console.log('Content script: Response status:', response.status);
          console.log('Content script: Response headers:', Array.from(response.headers.entries()));
          
          if (response.status === 401) {
            return { 
              error: true, 
              status: 401,
              debugInfo: {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                responseStatus: response.status,
                responseHeaders: Array.from(response.headers.entries())
              }
            };
          }
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          if (data && data.name) {
            return { error: false, data };
          }
          
          return { 
            error: true, 
            message: 'Invalid response data',
            debugInfo: {
              url: window.location.href,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
              responseStatus: response.status,
              responseData: data
            }
          };
          
        } catch (error) {
          
          const debugInfo = {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            cookies: document.cookie,
            localStorage: JSON.stringify(localStorage)
          };
          
          return { 
            error: true, 
            message: `Ошибка запроса: ${error.message}`,
            debugInfo: debugInfo
          };
        }
      }
      
      async function performLogout() {
        try {
          
          localStorage.removeItem('lp');
          
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
          
          const logoutUrls = [
            'https://backend.wplace.live/logout',
            'https://backend.wplace.live/auth/logout', 
            'https://wplace.live/logout',
            'https://wplace.live/api/logout'
          ];
          
          for (const url of logoutUrls) {
            try {
              const response = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              if (response.ok) {
                break;
              }
            } catch (e) {
            }
          }
          
          return { success: true, message: 'Logout completed' };
          
        } catch (error) {
          return { error: true, message: error.message };
        }
      }
    }
  }
});