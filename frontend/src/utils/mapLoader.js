const loadScript = (url, id) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = url;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));

    document.head.appendChild(script);
  });
};

export const loadAmap = async (apiKey) => {
  const key = apiKey || 'demo_key';
  const url = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
  await loadScript(url, 'amap-script');
  
  return new Promise((resolve, reject) => {
    const checkAMap = () => {
      if (window.AMap) {
        resolve(window.AMap);
      } else {
        setTimeout(checkAMap, 100);
      }
    };
    checkAMap();
  });
};

export const loadBaiduMap = async (apiKey) => {
  const key = apiKey || 'demo_key';
  const url = `https://api.map.baidu.com/api?v=3.0&ak=${key}`;
  await loadScript(url, 'baidu-map-script');
  
  return new Promise((resolve, reject) => {
    const checkBMap = () => {
      if (window.BMap) {
        resolve(window.BMap);
      } else {
        setTimeout(checkBMap, 100);
      }
    };
    checkBMap();
  });
};

export const wgs84ToGcj02 = (lat, lng) => {
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  
  const transformLat = (x, y) => {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  };
  
  const transformLng = (x, y) => {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  };
  
  const dLat = transformLat(lng - 105.0, lat - 35.0);
  const dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * Math.PI;
  const magic = Math.sin(radLat);
  const magic2 = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic2);
  const dLat2 = (dLat * 180.0) / ((a * (1 - ee)) / (magic2 * sqrtMagic) * Math.PI);
  const dLng2 = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
  
  return {
    lat: lat + dLat2,
    lng: lng + dLng2
  };
};

export const gcj02ToWgs84 = (lat, lng) => {
  const gps = wgs84ToGcj02(lat, lng);
  return {
    lat: lat * 2 - gps.lat,
    lng: lng * 2 - gps.lng
  };
};

export const gcj02ToBd09 = (lat, lng) => {
  const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  const x = lng;
  const y = lat;
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  return {
    lat: z * Math.sin(theta) + 0.006,
    lng: z * Math.cos(theta) + 0.0065
  };
};

export const bd09ToGcj02 = (lat, lng) => {
  const x_pi = 3.14159265358979324 * 3000.0 / 180.0;
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  return {
    lat: z * Math.sin(theta),
    lng: z * Math.cos(theta)
  };
};

export const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
