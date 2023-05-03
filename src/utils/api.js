const parseJSON = (response) => response.json();

const checkStatus = (response) => {
  if (response.ok) {
    return response;
  } else {
    return Promise.reject(response);
  }
};

const createURI = (fragment) => {
  const url = new URL(fragment, process.env.REACT_APP_PUBLIC_API_URL);
  return url.href;
};

const getApikey = () => {
  return process.env.REACT_APP_PUBLIC_API_KEY;
};

const constructHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    apiKey: getApikey(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    osName: "browser",
    appVersion: 7,
    deviceId: "browser",
    // browsername: getBrowserNameHeaderValue(),
  };

  if (typeof window !== "undefined" && window["cfat"]) {
    headers["at"] = window["cfat"];
    headers["st"] = window["cfst"];
    headers["deviceId"] = "browser" + window["cfuid"];
  }

  return headers;
};

export default {
  get(uriFragment, headers = {}) {
    return fetch(createURI(uriFragment), {
      method: "GET",
      headers: { ...constructHeaders(), ...headers },
      credentials: "include",
    })
      .then(checkStatus)
      .then(parseJSON);
  },

  post(uriFragment, body = {}, headers = {}) {
    return fetch(createURI(uriFragment), {
      method: "POST",
      headers: { ...constructHeaders(), ...headers },
      body: JSON.stringify(body),
      credentials: "include",
    })
      .then(checkStatus)
      .then(parseJSON);
  },

  patch(uriFragment, body = {}) {
    return fetch(createURI(uriFragment), {
      method: "PATCH",
      headers: constructHeaders(),
      body: JSON.stringify(body),
      credentials: "include",
    })
      .then(checkStatus)
      .then(parseJSON);
  },
};
