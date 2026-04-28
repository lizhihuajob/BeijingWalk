import apiClient from './api';

let visitorId = null;
let sessionId = null;

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getOrCreateVisitorId() {
  if (!visitorId) {
    try {
      visitorId = localStorage.getItem('bj_visitor_id');
      if (!visitorId) {
        visitorId = generateId();
        localStorage.setItem('bj_visitor_id', visitorId);
      }
    } catch {
      visitorId = generateId();
    }
  }
  return visitorId;
}

function getOrCreateSessionId() {
  if (!sessionId) {
    try {
      const sessionData = sessionStorage.getItem('bj_session');
      const now = Date.now();
      
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (now - parsed.timestamp < 30 * 60 * 1000) {
          sessionId = parsed.id;
          parsed.timestamp = now;
          sessionStorage.setItem('bj_session', JSON.stringify(parsed));
        }
      }
      
      if (!sessionId) {
        sessionId = generateId();
        sessionStorage.setItem('bj_session', JSON.stringify({
          id: sessionId,
          timestamp: now
        }));
      }
    } catch {
      sessionId = generateId();
    }
  }
  return sessionId;
}

const PAGE_TYPE_MAP = {
  '/': 'home',
  '/culture': 'culture_list',
  '/specialties': 'specialty_list',
  '/scenic': 'scenic_list',
  '/heritage': 'heritage_list',
  '/guestbook': 'guestbook',
};

function getPageType(pathname) {
  for (const [path, type] of Object.entries(PAGE_TYPE_MAP)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      if (type.includes('list') && pathname !== path && pathname.includes('/')) {
        return type.replace('list', 'detail');
      }
      return type;
    }
  }
  return 'other';
}

export async function trackPageView({ pathname, title, referrer }) {
  try {
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const pageType = getPageType(pathname);
    
    const data = {
      page_url: pathname,
      page_type: pageType,
      page_title: title || document.title,
      visitor_id: visitorId,
      session_id: sessionId,
      referrer: referrer || document.referrer,
    };
    
    await apiClient.post('/analytics/page-view', data);
  } catch (error) {
    console.debug('Page view tracking failed:', error);
  }
}

export async function trackContentView({ contentType, contentId, pageUrl }) {
  try {
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    
    const data = {
      content_type: contentType,
      content_id: contentId,
      visitor_id: visitorId,
      session_id: sessionId,
      page_url: pageUrl || window.location.pathname,
    };
    
    await apiClient.post('/analytics/content-view', data);
  } catch (error) {
    console.debug('Content view tracking failed:', error);
  }
}

export function getVisitorId() {
  return getOrCreateVisitorId();
}

export function getSessionId() {
  return getOrCreateSessionId();
}
