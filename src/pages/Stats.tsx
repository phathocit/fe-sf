import { useEffect, useState } from "react";
import axios from "axios";

export default function Stats() {
  const [qr, setQr] = useState<any>(null);
  const [audio, setAudio] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const qrRes = await axios.get(
          "http://localhost:8080/api/stats/qr-login",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const audioRes = await axios.get(
          "http://localhost:8080/api/stats/audio",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("QR:", qrRes.data);
        console.log("Audio:", audioRes.data);

        setQr(qrRes.data);
        setAudio(audioRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>QR Stats</h2>
      <p>Total: {qr?.total ?? "Loading..."}</p>
      <p>Realtime: {qr?.realtime ?? "Loading..."}</p>

      <h2>Audio Stats</h2>
      <p>Total: {audio?.total ?? "Loading..."}</p>

      {audio?.perPoi &&
        audio.perPoi.map((item: any, index: number) => (
          <p key={index}>
            POI {item[0]}: {item[1]}
          </p>
        ))}
    </div>
  );
}