//frontend/app/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import axios from "axios";

const API_URL = "http://localhost:4000";
const GOOGLE_CLIENT_ID = "406119405191-a00hok11nvrr0to93ai6p149pitue6vk.apps.googleusercontent.com";

export default function HomePage() {
  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const payload = {
        token: credentialResponse.credential,
      };

      if (isAdminChecked && adminSecret) {
        payload.admin_secret = adminSecret;
      }
      console.log("🧪 Payload envoyé :", payload);

      const response = await axios.post(`${API_URL}/google-login`, payload);

      const jwt = response.data.token;
      console.log("✅ JWT reçu :", jwt);
      setToken(jwt);
      localStorage.setItem("jwt", jwt);
      setError(null);

      if (jwt) {
        const decoded = jwtDecode(jwt);
        console.log("🎯 Décodé :", decoded);
        if (decoded.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/user");
        }
      } else {
        setError("Token JWT manquant.");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Erreur lors de la connexion Google");
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
        <h2>Connexion</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <label style={{ marginBottom: 10, display: "block" }}>
          <input
            type="checkbox"
            checked={isAdminChecked}
            onChange={(e) => setIsAdminChecked(e.target.checked)}
            style={{ marginRight: 5 }}
          />
          Je suis admin
        </label>

        {isAdminChecked && (
          <input
            type="password"
            placeholder="Mot de passe admin secret"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            style={{ display: "block", marginBottom: 10, width: "100%" }}
            required
          />
        )}

        <hr style={{ margin: "20px 0" }} />
        <h3>Se connecter avec Google :</h3>

        <GoogleLogin
          onSuccess={handleGoogleLoginSuccess}
          onError={() => setError("Erreur lors de la connexion avec Google")}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
