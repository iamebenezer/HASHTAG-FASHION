import React from "react";

const Loader = ({ height = 180 }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height,
      minHeight: height,
      width: "100%",
    }}
    className="fade-in"
  >
    <div className="loader-spinner" style={{ marginBottom: 12 }} />
    <span style={{ color: "#444", fontWeight: 500, fontSize: 16 }}>Loading...</span>
    <style>{`
      .loader-spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #222;
        border-radius: 50%;
        width: 38px;
        height: 38px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .fade-in {
        animation: fadeIn 0.3s;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}</style>
  </div>
);

export default Loader;
