import React, { useEffect, useState } from "react";
import Button from "./atoms/Button/Button";

import "./App.css";
// import { ZoomMtg } from "@zoomus/websdk";
import { getApikey } from "./utils/api";
const KJUR = require("jsrsasign");

window.ZoomMtg.setZoomJSLib("https://source.zoom.us/2.11.0/lib", "/av");

window.ZoomMtg.preLoadWasm();
window.ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
window.ZoomMtg.i18n.load("en-US");
window.ZoomMtg.i18n.reload("en-US");

const GA = (...args) => {
  if (typeof window !== "undefined") {
    console.log("gtag");
    return window.gtag(...args);
  } else {
    return (...args) => {};
  }
};

function App() {
  const sdkKey = process.env.REACT_APP_ZOOM_MEETING_SDK_KEY;
  const sdks = process.env.REACT_APP_ZOOM_MEETING_SDK_SECRET;
  const leaveUrl = "https://www.sugarfit.com/";

  const [triedOpeningZoom, setTriedOpeningZoom] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [error, setError] = useState(null);

  function getSignature(m, p, n, phone) {
    GA("event", "JOIN_WEBINAR", {
      app_name: "zoom_webinar",
      user_name: `${n}`,
      user_phone: `${phone}`,
      meeting_id: `${m}`,
      user_action: "Getting Signature",
    });
    // ReactGA.event({
    //   category: "JOIN_WEBINAR",
    //   action: "Getting Signature",
    // });

    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;

    const oHeader = { alg: "HS256", typ: "JWT" };

    const oPayload = {
      sdkKey,
      mn: m,
      role: 0,
      iat: iat,
      exp: exp,
      appKey: sdks,
      tokenExp: iat + 60 * 60 * 2,
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdks);

    startMeeting(signature, m, p, n, phone);
  }

  function startMeeting(s, m, p, n, phone) {
    document.getElementById("zmmtg-root").style.display = "block";

    GA("event", "JOIN_WEBINAR", {
      app_name: "zoom_webinar",
      user_name: `${n}`,
      user_phone: `${phone}`,
      meeting_id: `${m}`,
      user_action: "Starting the Zoom meet",
    });

    // ReactGA.event({
    //   category: "JOIN_WEBINAR",
    //   action: "Starting the Zoom meet",
    // });

    window.ZoomMtg.init({
      leaveUrl: leaveUrl,
      success: (success) => {
        window.ZoomMtg.join({
          signature: s,
          sdkKey: sdkKey,
          meetingNumber: m,
          passWord: p,
          userName: n,
          success: (success) => {
            try {
              GA("event", "ZOOM_WEBINAR_ATTENDANCE", {
                app_name: "zoom_webinar",
                user_name: `${n}`,
                user_phone: `${phone}`,
                meeting_id: `${m}`,
                user_action: "Joined the Zoom meet",
              });
              fetch(
                `${process.env.REACT_APP_PUBLIC_API_URL}v2/chroniccare/sns-event`,
                {
                  method: "POST",
                  mode: "cors",
                  credentials: "include",
                  body: JSON.stringify({
                    eventType: "WEBINAR_ATTENDANCE",
                    attributes: {
                      phoneNumber: phone,
                      time: Date.now(),
                      meetingNumber: m,
                      userName: n,
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
                }
              );
            } catch {}

            console.log(success);
          },
          error: (error) => {
            console.log(error);
            GA("event", "exception", {
              description: `Failed to Join Meet: ${JSON.stringify(error)} `,
              fatal: true,
            });
            // ReactGA.exception({
            //   description: `Failed to Join Meet: ${JSON.stringify(error)} `,
            //   fatal: true,
            // });
          },
        });
      },
      error: (error) => {
        console.log(error);
        GA("event", "exception", {
          description: `Failed to Init Meet: ${JSON.stringify(error)} `,
          fatal: true,
        });
        // ReactGA.exception({
        //   description: `Failed to Init Meet: ${JSON.stringify(error)} `,
        //   fatal: true,
        // });
      },
    });
  }

  const handleJoinWithZoomApp = (
    meetingNumber,
    meetingPassword,
    name,
    phone
  ) => {
    name && getSignature(meetingNumber, meetingPassword, name, phone);
  };

  useEffect(() => {
    let meetingArgs = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );
    setMeetingInfo(meetingArgs);
    meetingArgs.p &&
      handleJoinWithZoomApp(
        meetingArgs.m,
        meetingArgs.p,
        meetingArgs.n,
        meetingArgs.phone
      );
  }, []);

  const handleJoinMeeting = () => {
    if (!meetingInfo) return;

    if (!meetingInfo.n) {
      setError("Please Enter your name");

      GA("event", "MISSED_NAME_INPUT", {
        app_name: "zoom_webinar",
        meeting_id: `${meetingInfo.m}`,
        user_action: "Missed Name Input",
      });
      // ReactGA.event({
      //   category: "MISSED_NAME_INPUT",
      //   action: "Missed Name Input",
      // });
      return;
    }

    GA("event", "JOIN_WEBINAR_CTA", {
      app_name: "zoom_webinar",
      user_name: `${meetingInfo.n}`,
      user_phone: `${meetingInfo.phone}`,
      meeting_id: `${meetingInfo.m}`,
      user_action: "Joining Webinar on browser",
    });

    // ReactGA.event({
    //   category: "JOIN_WEBINAR_CTA",
    //   action: "Joining Webinar on browser",
    // });

    getSignature(
      meetingInfo.m,
      meetingInfo.p,
      meetingInfo.n,
      meetingInfo.phone
    );
  };

  const nameChange = (event) => {
    setError("");
    setMeetingInfo((prev) => ({ ...prev, n: event.target.value }));
  };

  return (
    <>
      <div className="name-input">
        {/* <label htmlFor="name">Your Name</label> */}
        <input
          id="name"
          placeholder="Your Name"
          value={meetingInfo?.n}
          onChange={nameChange}
        />
        {error && <span className="error-msg">{error}</span>}
      </div>
      <Button onClick={handleJoinMeeting}>Join Webinar</Button>
    </>
  );
}

export default App;
