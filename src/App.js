import React, { useState } from "react";

import "./App.css";
import { ZoomMtg } from "@zoomus/websdk";

ZoomMtg.setZoomJSLib("https://source.zoom.us/2.11.0/lib", "/av");

ZoomMtg.preLoadWasm();
ZoomMtg.prepareWebSDK();
// loads language files, also passes any error messages to the ui
ZoomMtg.i18n.load("en-US");
ZoomMtg.i18n.reload("en-US");

function App() {
  let sdkKey = "YLKpNroRGaDxP22Xk9SQg";
  let leaveUrl = "https://www.sugarfit.com/";

  const [name, setName] = useState("");
  const [meetNumber, setMeetNumber] = useState("");
  const [password, setpw] = useState("");
  const [jwt, setJWT] = useState("");
  const [err] = useState("");

  // function getSignature(e) {
  //   e.preventDefault();

  //   fetch(authEndpoint, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       meetingNumber: meetingNumber,
  //       role: role
  //     })
  //   }).then(res => res.json())
  //   .then(response => {
  //     startMeeting(response.signature)
  //   }).catch(error => {
  //     console.error(error)
  //   })
  // }

  function startMeeting() {
    document.getElementById("zmmtg-root").style.display = "block";

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      success: (success) => {
        console.log(success);

        ZoomMtg.join({
          // signature: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZGtLZXkiOiJZTEtwTnJvUkdhRHhQMjJYazlTUWciLCJtbiI6Ijk2Mjg2OTM2ODY0Iiwicm9sZSI6MCwiaWF0IjoxNjgxOTg2NjI1LCJleHAiOjE2ODE5OTM4MjUsImFwcEtleSI6IllMS3BOcm9SR2FEeFAyMlhrOVNRZyIsInRva2VuRXhwIjoxNjgxOTkzODI1fQ.yK-dfflU_iCWyUFs0wJk2H8m-oS8KraOT3Uu0PiJYVc",
          signature: jwt,
          sdkKey: sdkKey,
          meetingNumber: meetNumber,
          passWord: password,
          userName: name,
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
        <h1>Zoom Meeting SDK</h1>

        <input
          placeholder="ENTER Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="ENTER Meeting Number"
          type="text"
          value={meetNumber}
          onChange={(e) => setMeetNumber(e.target.value)}
        />
        <input
          placeholder="ENTER Meeting Passcode"
          type="text"
          value={password}
          onChange={(e) => setpw(e.target.value)}
        />

        <input
          placeholder="ENTER JWT"
          type="text"
          value={jwt}
          onChange={(e) => setJWT(e.target.value)}
        />

        <button
          style={{
            background: "white",
            color: "black",
            border: "1px solid black",
            padding: "1rem",
          }}
          onClick={startMeeting}
        >
          Join Meeting
        </button>

        {err && <p style={{ color: "tomato" }}>{err}</p>}
      </main>
    </div>
  );
}

export default App;
