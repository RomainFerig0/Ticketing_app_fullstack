"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚫 Accès refusé</h1>
      <p style={styles.message}>
        Vous n'avez pas l'autorisation d'accéder à cette page.
      </p>
      <button style={styles.button} onClick={handleGoBack}>
        Retour à la page de connexion
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "2rem",
    color: "#cc0000",
  },
  message: {
    fontSize: "1.2rem",
    margin: "20px 0",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};