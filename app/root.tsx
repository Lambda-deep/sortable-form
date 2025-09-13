import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    LiveReload,
} from "@remix-run/react";
import "./styles/global.css";

export default function App() {
    return (
        <html lang="en">
            <head>
                <Meta />
                <Links />
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>Sortable Form</title>
            </head>
            <body>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                {/* LiveReload disabled in development to avoid WebSocket conflicts with Vite HMR */}
                {process.env.NODE_ENV === "development" ? null : <LiveReload />}
            </body>
        </html>
    );
}
