import React, { Suspense, lazy, useEffect } from "react";
import Button from "./atoms/Button/Button";
import { getApikey } from "./utils/api";

const App = lazy(() => import("./App"));

const GA = (...args) => {
  if (typeof window !== "undefined") {
    console.log("gtag");
    return window.gtag(...args);
  } else {
    return (...args) => {};
  }
};

const Home = () => {
  useEffect(() => {
    let meetingArgs = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );
    meetingArgs.p &&
      handleJoinWithZoomApp(
        meetingArgs.m,
        meetingArgs.p,
        meetingArgs.n,
        meetingArgs.phone
      );
  }, []);

  const handleJoinWithZoomApp = (
    meetingNumber,
    meetingPassword,
    name,
    phone
  ) => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("android") > -1) {
      window.location.href = `zoomus://zoom.us/join?action=join&confno=${meetingNumber}&pwd=${meetingPassword}&zc=0${
        name ? `&uname=${name}` : ""
      }`;
      GA("event", "JOIN_WEBINAR_ANDROID", {
        app_name: "zoom_webinar",
        user_name: `${name}`,
        user_phone: `${phone}`,
        meeting_id: `${meetingNumber}`,
        user_action: "Tried joining in Android",
      });

      fetch(`${process.env.REACT_APP_PUBLIC_API_URL}v2/chroniccare/sns-event`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          eventType: "WEBINAR_ATTENDANCE",
          attributes: {
            phoneNumber: phone,
            time: Date.now(),
            meetingNumber,
            userName: name,
            event: "JOIN_WEBINAR_ANDROID",
            userAction: "Tried joining in Android",
          },
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apiKey: getApikey(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          osName: "browser",
          appVersion: 7,
          deviceId: "browser",
          browsername: "web",
        },
      });
    } else if (userAgent.indexOf("iphone") > -1) {
      window.location.href = `zoomus://zoom.us/join?action=join&confno=${meetingNumber}&pwd=${meetingPassword}&zc=0${
        name ? `&uname=${name}` : ""
      }`;

      GA("event", "JOIN_WEBINAR_IOS", {
        app_name: "zoom_webinar",
        user_name: `${name}`,
        user_phone: `${phone}`,
        meeting_id: `${meetingNumber}`,
        user_action: "Tried joining in IOS",
      });

      fetch(`${process.env.REACT_APP_PUBLIC_API_URL}v2/chroniccare/sns-event`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          eventType: "WEBINAR_ATTENDANCE",
          attributes: {
            phoneNumber: phone,
            time: Date.now(),
            meetingNumber,
            userName: name,
            event: "JOIN_WEBINAR_IOS",
            userAction: "Tried joining in IOS",
          },
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apiKey: getApikey(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          osName: "browser",
          appVersion: 7,
          deviceId: "browser",
          browsername: "web",
        },
      });
    } else {
      window.location.href = `zoomus://zoom.us/join?action=join&confno=${meetingNumber}&pwd=${meetingPassword}&zc=0${
        name ? `&uname=${name}` : ""
      }`;
      GA("event", "JOIN_WEBINAR_WEB", {
        app_name: "zoom_webinar",
        user_name: `${name}`,
        user_phone: `${phone}`,
        meeting_id: `${meetingNumber}`,
        user_action: "Joining Webinar on browser",
      });
    }
  };

  return (
    <div className="App">
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
          color: "white",
          gap: "1rem",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <img src="/logos/white-logo.svg" />
        <img src="/logos/text-logo-light.svg" />
        <h2>Diabetes Reversal Session</h2>

        <Suspense
          fallback={<Button style={{ padding: "10px 20px" }} loading></Button>}
        >
          <App />
        </Suspense>
      </main>
    </div>
  );
};

export default Home;
