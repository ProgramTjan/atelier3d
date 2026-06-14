import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            background: "#23262B",
            color: "#EDEAE3",
            fontFamily: "'Avenir Next','Segoe UI',system-ui,sans-serif",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 22 }}>Er ging iets mis</h1>
          <p style={{ margin: 0, maxWidth: 420, opacity: 0.75, lineHeight: 1.5 }}>
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: "#E8B45A",
              color: "#1C1E22",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Pagina herladen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
