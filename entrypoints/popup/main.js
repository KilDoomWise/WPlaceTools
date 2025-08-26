let userData = null;
let currentView = 'loading';
let lastErrorInfo = null;
function showView(viewId, direction = 'right') {
  const views = ['mainView', 'accountView', 'settingsView', 'loadingView', 'loginView', 'noTabView', 'errorView'];
  const currentViewElement = document.getElementById(currentView);
  const newViewElement = document.getElementById(viewId);
  
  if (currentView === viewId) return;
  
  if (currentView === 'loading') {
    views.forEach(view => {
      const el = document.getElementById(view);
      el.style.transform = view === viewId ? 'translateX(0)' : 'translateX(100%)';
    });
    currentView = viewId;
    return;
  }
  if (direction === 'right') {
    newViewElement.style.transform = 'translateX(100%)';
    setTimeout(() => {
      currentViewElement.style.transform = 'translateX(-100%)';
      newViewElement.style.transform = 'translateX(0)';
    }, 10);
  } else {
    newViewElement.style.transform = 'translateX(-100%)';
    setTimeout(() => {
      currentViewElement.style.transform = 'translateX(100%)';
      newViewElement.style.transform = 'translateX(0)';
    }, 10);
  }
  
  currentView = viewId;
}

async function fetchUserData() {
  try {
    const tabs = await browser.tabs.query({url: "*://wplace.live/*"});
    
    if (tabs.length === 0) {
      return { error: true, status: 'no_tab', message: 'Нет открытых вкладок wplace.live' };
    }
    
    const response = await browser.tabs.sendMessage(tabs[0].id, { action: 'fetchUserData' });
    
    if (response.error) {
      return response;
    }
    
    userData = response.data;
    return response;
    
  } catch (error) {
    return { error: true, message: 'Ошибка связи с сайтом' };
  }
}

function showMainView(data) {
  document.getElementById('username').textContent = data.name;
  showView('mainView');
}

function showAccountDetails(data) {
  const accountDetails = document.getElementById('accountDetails');
  
  const level = Math.floor(data.level);
  const progress = Math.round((data.level - level) * 100);
  
  const getColorFromLevel = (level) => {
    const maxLevel = 100;
    const ratio = Math.min(level / maxLevel, 1);
    const blue = { r: 59, g: 130, b: 246 };
    const red = { r: 239, g: 68, b: 68 };
    
    const r = Math.round(blue.r + (red.r - blue.r) * ratio);
    const g = Math.round(blue.g + (red.g - blue.g) * ratio);
    const b = Math.round(blue.b + (red.b - blue.b) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const levelColor = getColorFromLevel(level);
  
  accountDetails.innerHTML = `
    <div class="text-center mb-4">
      <div class="flex items-center justify-center space-x-3">
        <h2 class="text-xl font-bold text-white">${data.name}</h2>
        <div class="relative w-12 h-12">
          <svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" stroke="rgb(39 39 42)" stroke-width="4" fill="none"/>
            <circle cx="24" cy="24" r="20" stroke="${levelColor}" stroke-width="4" fill="none"
                    stroke-linecap="round" 
                    stroke-dasharray="125.66"
                    stroke-dashoffset="${125.66 - (125.66 * progress / 100)}"
                    class="transition-all duration-500"/>
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-white text-xs font-bold">${level}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2 mb-3">
      <div class="bg-zinc-900 rounded-lg p-3 text-center border border-zinc-800">
        <div class="text-xl font-bold text-violet-400">${data.droplets.toLocaleString()}</div>
        <div class="text-xs text-zinc-400 uppercase tracking-wide">Дроплеты</div>
      </div>
      <div class="bg-zinc-900 rounded-lg p-3 text-center border border-zinc-800">
        <div class="text-xl font-bold text-amber-400">${Math.floor(data.charges.count)}</div>
        <div class="text-xs text-zinc-400 uppercase tracking-wide">Заряды</div>
      </div>
    </div>
    <div class="bg-zinc-900 rounded-lg p-2.5 mb-3 border border-zinc-800">
      <div class="flex justify-between items-center">
        <span class="text-zinc-400 text-xs">Пикселей поставлено</span>
        <span class="text-emerald-400 text-sm font-medium">${data.pixelsPainted.toLocaleString()}</span>
      </div>
    </div>

    ${data.allianceId ? `
      <div class="bg-zinc-900 rounded-lg p-2.5 border border-zinc-800">
        <div class="flex justify-between items-center mb-1">
          <span class="text-zinc-400 text-xs">Альянс</span>
          <span class="text-sky-400 text-sm font-medium">#${data.allianceId}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-zinc-400 text-xs">Роль</span>
          <span class="text-orange-400 text-sm font-medium capitalize">${data.allianceRole}</span>
        </div>
      </div>
    ` : ''}
  `;
}

function setupEventListeners() {
  document.getElementById('accountBtn').addEventListener('click', () => {
    if (userData) {
      showAccountDetails(userData);
      showView('accountView', 'right');
    }
  });
  
  document.getElementById('settingsBtn').addEventListener('click', () => {
    showView('settingsView', 'right');
  });
  
  document.getElementById('backBtn').addEventListener('click', () => {
    showView('mainView', 'left');
  });
  
  document.getElementById('backBtn2').addEventListener('click', () => {
    showView('mainView', 'left');
  });
  
  document.getElementById('switchAccountBtn').addEventListener('click', async () => {
    try {
      
      const tabs = await browser.tabs.query({url: "*://wplace.live/*"});
      
      if (tabs.length > 0) {
        
        try {
          const response = await browser.runtime.sendMessage({
            action: 'clearAllData',
            url: 'https://wplace.live'
          });
          
          if (response && response.success) {
            console.log('All data cleared successfully');
          } else {
          }
        } catch (e) {
        }
        
        
        setTimeout(async () => {
          try {
            await browser.tabs.sendMessage(tabs[0].id, { action: 'reloadPage' });
          } catch (e) {
            browser.tabs.reload(tabs[0].id);
          }
        }, 500);
        
      } else {
        
        try {
          const response = await browser.runtime.sendMessage({
            action: 'clearAllData',
            url: 'https://wplace.live'
          });
          
          if (response && response.success) {
            console.log('All data cleared successfully');
          }
        } catch (e) {
          console.error('Error clearing data:', e);
        }
        
        browser.tabs.create({ url: 'https://wplace.live' });
      }
      
      
    } catch (error) {
      browser.tabs.create({ url: 'https://wplace.live' });
    }
  });
  
  document.getElementById('loginBtn').addEventListener('click', () => {
    browser.tabs.create({ url: 'https://wplace.live' });
  });
  
  document.getElementById('openBtn').addEventListener('click', () => {
    browser.tabs.create({ url: 'https://wplace.live' });
  });
  
  document.getElementById('retryBtn').addEventListener('click', () => {
    loadData();
  });
  
  document.getElementById('detailsBtn').addEventListener('click', () => {
    if (lastErrorInfo) {
      const details = JSON.stringify(lastErrorInfo, null, 2);
      navigator.clipboard.writeText(details).then(() => {
        alert('Информация скопирована в буфер обмена');
      }).catch(() => {
        alert(`Системная информация:\n\n${details}`);
      });
    }
  });
  
  document.getElementById('telegramBtn').addEventListener('click', () => {
    browser.tabs.create({ url: 'https://t.me/ru_wplace' });
  });
}

async function loadData() {
  showView('loadingView');
  
  const result = await fetchUserData();
  
  if (result.error) {
    lastErrorInfo = result.debugInfo || null;
    
    if (result.status === 401) {
      showView('loginView');
    } else if (result.status === 'no_tab') {
      showView('noTabView');
    } else {
      document.getElementById('errorMessage').textContent = result.message || 'Неизвестная ошибка';
      
      const detailsBtn = document.getElementById('detailsBtn');
      if (lastErrorInfo) {
        detailsBtn.style.display = 'block';
      } else {
        detailsBtn.style.display = 'none';
      }
      
      showView('errorView');
    }
  } else {
    showMainView(result.data);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  
  const manifest = browser.runtime.getManifest();
  document.getElementById('extensionVersion').textContent = manifest.version;
  document.getElementById('buildDate').textContent = new Date().toISOString().slice(0, 10);
  
  setupEventListeners();
  loadData();
});

if (typeof browser === 'undefined') {
  window.browser = chrome;
}