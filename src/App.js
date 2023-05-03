import React, { useEffect, useState } from "react";

import "./App.css";
import { ZoomMtg } from "@zoomus/websdk";
import api from "./utils/api";
const KJUR = require("jsrsasign");

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.11.0/lib", "/av");

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load("en-US");
ZoomMtg.i18n.reload("en-US");

function App() {
  const sdkKey = process.env.REACT_APP_ZOOM_MEETING_SDK_KEY;
  const sdks = process.env.REACT_APP_ZOOM_MEETING_SDK_SECRET;
  const leaveUrl = "https://www.sugarfit.com/";

  const [triedOpeningZoom, setTriedOpeningZoom] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [error, setError] = useState(null);

  function getSignature(m, p, n, phone) {
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

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      success: (success) => {
        ZoomMtg.join({
          signature: s,
          sdkKey: sdkKey,
          meetingNumber: m,
          passWord: p,
          userName: n,
          success: (success) => {
            try {
              api.post("v2/chroniccare/sns-event", {
                eventType: "ZOOM_WEBINAR_ATTENDANCE",
                attributes: {
                  phoneNumber: phone,
                  time: Date.now(),
                  meetingNumber: m,
                  userName: n,
                },
              });
            } catch {}

            console.log(success);
          },
          error: (error) => {
            console.log(error);
          },
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

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
      // window.location.href = `intent://zoom.us/join?action=join&confno=${meetingNumber}&pwd=${meetingPassword}#Intent;scheme=zoommtg;package=us.zoom.videomeetings;end`;

      setTimeout(function () {
        setTriedOpeningZoom(true);
      }, 2000);
    } else if (userAgent.indexOf("iphone") > -1) {
      window.location.href = `zoomus://zoom.us/join?action=join&confno=${meetingNumber}&pwd=${meetingPassword}&zc=0${
        name ? `&uname=${name}` : ""
      }`;
      setTimeout(function () {
        setTriedOpeningZoom(true);
      }, 2000);
    } else {
      // Fallback to the Zoom Web SDK to join the meeting in the browser
      // window.location.href = `https://zoom.us/wc/${meetingNumber}/join?prefer=1&pwd=${meetingPassword}`;
      // Join meeting only if name is provided
      setTriedOpeningZoom(true);
      name && getSignature(meetingNumber, meetingPassword, name, phone);
    }
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
      return;
    }

    getSignature(meetingInfo.m, meetingInfo.p, meetingInfo.n);
  };

  const nameChange = (event) => {
    setError("");
    setMeetingInfo((prev) => ({ ...prev, n: event.target.value }));
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
        {triedOpeningZoom && (
          <button onClick={handleJoinMeeting} className="btn-zoom-demo">
            Join Webinar
          </button>
        )}
      </main>
    </div>
  );
}

export default App;
