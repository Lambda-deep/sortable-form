import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    LiveReload,
} from "@remix-run/react";

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
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
            * {
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              display: grid;
              grid-template-columns: 1fr 300px;
              gap: 20px;
            }
            .form-section {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .sidebar {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              height: fit-content;
            }
            .parent-item {
              border: 1px solid #ddd;
              padding: 15px;
              margin-bottom: 15px;
              border-radius: 6px;
              background: #fafafa;
            }
            .parent-header {
              display: flex;
              gap: 10px;
              align-items: center;
              margin-bottom: 10px;
            }
            .parent-input {
              flex: 1;
              padding: 8px;
              border: 1px solid #ccc;
              border-radius: 4px;
            }
            .children-container {
              margin-top: 15px;
              padding: 10px;
              background: white;
              border-radius: 4px;
              border: 1px solid #e0e0e0;
            }
            .child-item {
              display: flex;
              gap: 10px;
              align-items: center;
              padding: 8px;
              margin-bottom: 8px;
              background: #f9f9f9;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
              cursor: move;
            }
            .child-input {
              flex: 1;
              padding: 6px;
              border: 1px solid #ccc;
              border-radius: 3px;
            }
            .drag-handle {
              cursor: move;
              color: #666;
              font-size: 18px;
              line-height: 1;
            }
            .add-button {
              background: #007bff;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 4px;
              cursor: pointer;
            }
            .add-button:hover {
              background: #0056b3;
            }
            .remove-button {
              background: #dc3545;
              color: white;
              border: none;
              padding: 4px 8px;
              border-radius: 3px;
              cursor: pointer;
              font-size: 12px;
            }
            .remove-button:hover {
              background: #c82333;
            }
            .sidebar h3 {
              margin-top: 0;
              color: #333;
            }
            .index-list {
              list-style: none;
              padding: 0;
            }
            .index-item {
              padding: 8px;
              margin-bottom: 4px;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 4px;
              font-size: 14px;
            }
            .sidebar-parent-header {
              display: flex;
              align-items: center;
              gap: 8px;
              cursor: move;
            }
            .sidebar-parent-drag-handle {
              color: #666;
              font-size: 16px;
              line-height: 1;
            }
            .sidebar-child-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 4px 0;
              cursor: move;
            }
            .sidebar-child-drag-handle {
              color: #666;
              font-size: 14px;
              line-height: 1;
            }
            .nested-index {
              margin-left: 20px;
              margin-top: 4px;
              font-size: 12px;
              color: #666;
            }
            .sortable-ghost {
              opacity: 0.4;
            }
            .sortable-chosen {
              background: #e3f2fd !important;
            }
          `,
                    }}
                />
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
