import React, { useEffect } from "react";

import "./App.css";
import { ZoomMtg } from "@zoomus/websdk";
const KJUR = require('jsrsasign')

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

  function getSignature(m, p, n) {
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
    const signature = KJUR.jws.JWS.sign(
      "HS256",
      sHeader,
      sPayload,
      sdks
    );

    startMeeting(signature, m, p, n)
  }

  function startMeeting(s, m, p, n) {
    document.getElementById("zmmtg-root").style.display = "block";

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      success: (success) => {
        console.log(success);

        ZoomMtg.join({
          signature: s,
          sdkKey: sdkKey,
          meetingNumber: m,
          passWord: p,
          userName: n,
          success: (success) => {
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

  useEffect(() => {
    let meetingArgs = Object.fromEntries(
      new URLSearchParams(window.location.search)
    );
    meetingArgs.p &&
    getSignature(meetingArgs.m, meetingArgs.p, meetingArgs.n);
  }, []);

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
          backgroundColor: "rgba(255, 255, 255)",
          color: "black",
          gap: "1rem",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <h1>Zoom Meeting</h1>
      </main>
    </div>
  );
}

export default App;
