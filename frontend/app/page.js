"use client";
require('dotenv').config();
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const API_URL = "http://localhost:4000";
const NEXT_PUBLIC_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
console.log(NEXT_PUBLIC_GOOGLE_CLIENT_ID);

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

      const response = await axios.post(`${API_URL}/google-login`, payload);
      const jwt = response.data.token;

      setToken(jwt);
      localStorage.setItem("jwt", jwt);
      setError(null);

      if (jwt) {
        const decoded = jwtDecode(jwt);
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
    <GoogleOAuthProvider clientId={NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>🔐 Connexion sécurisée</h1>
          <p style={styles.subtitle}>Accédez à votre espace en toute sécurité via Google</p>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.formSection}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isAdminChecked}
                onChange={(e) => setIsAdminChecked(e.target.checked)}
                style={styles.checkbox}
              />
              Je suis administrateur
            </label>

            {isAdminChecked && (
              <input
                type="password"
                placeholder="Mot de passe administrateur"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                style={styles.input}
                required
              />
            )}

            <div style={styles.divider}></div>

            <div style={styles.googleLogin}>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => setError("Erreur lors de la connexion avec Google")}
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "18px",
    boxShadow: "0 12px 35px rgba(0, 0, 0, 0.15)",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "25px",
  },
  formSection: {
    textAlign: "left",
  },
  checkboxLabel: {
    fontSize: "15px",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#333",
  },
  checkbox: {
    width: "18px",
    height: "18px",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "20px",
    outline: "none",
  },
  divider: {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "30px 0",
  },
  googleLogin: {
    display: "flex",
    justifyContent: "center",
  },
  error: {
    backgroundColor: "#ffe5e5",
    color: "#c0392b",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
};