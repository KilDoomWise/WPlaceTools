export default defineBackground(() => {
  if (typeof browser === 'undefined') {
    globalThis.browser = chrome;
  }
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    try {
      if (message.action === 'clearAllData') {
        if (!message.url || !/^https?:/i.test(message.url)) {
          sendResponse({ error: true, message: 'Invalid URL' });
          return;
        }
        const { origin } = new URL(message.url);
        try {
          await browser.browsingData.remove({
            origins: [origin],
            since: 0
          }, {
            cookies: true,
            cache: true,
            cacheStorage: true,
            fileSystems: true,
            indexedDB: true,
            localStorage: true,
            serviceWorkers: true,
            webSQL: true
          });
        } catch (browsingDataError) {
        }
        const hostname = new URL(message.url).hostname;
        const domain = hostname.split('.').slice(-2).join('.');
        const allDomains = [domain, '.' + domain];
        
        for (const cookieDomain of allDomains) {
          try {
            const cookies = await browser.cookies.getAll({
              domain: cookieDomain
            });
            

            await Promise.all(cookies.map(cookie => {
              const cookieUrl = (cookie.secure ? 'https://' : 'http://') + 
                              (cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain) + 
                              cookie.path;

              const removeDetails = {
                url: cookieUrl,
                name: cookie.name
              };

              if (cookie.storeId && typeof chrome !== 'undefined') {
                removeDetails.storeId = cookie.storeId;
              }

              if (cookie.partitionKey) {
                removeDetails.partitionKey = cookie.partitionKey;
              }

              
              return browser.cookies.remove(removeDetails).catch((error) => {
              });
            }));
          } catch (error) {
          }
        }

        sendResponse({ success: true, message: 'All data cleared' });
        
      } else {
        sendResponse({ error: true, message: 'Unknown action' });
      }
      
    } catch (error) {
      sendResponse({ error: true, message: error.message });
    }
    
    return true;
  });
});