import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Environment } from "./environments/environment.js";

const queryClient = new QueryClient();
const clientId = Environment.GG_CLIENT_ID;

const root = ReactDOM.createRoot(document.getElementById("root"));
console.log("All env:", import.meta.env);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={clientId}>
        <App />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
