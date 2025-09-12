import { jsx, jsxs } from "react/jsx-runtime";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, LiveReload } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Sortable from "sortablejs";
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  const markup = renderToString(
    /* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url })
  );
  responseHeaders.set("Content-Type", "text/html");
  return new Response("<!DOCTYPE html>" + markup, {
    status: responseStatusCode,
    headers: responseHeaders
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function App() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {}),
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx("title", { children: "Sortable Form" }),
      /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: {
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
          `
      } })
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {}),
      /* @__PURE__ */ jsx(LiveReload, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App
}, Symbol.toStringTag, { value: "Module" }));
const initialData = {
  parentArray: [
    {
      parentKey: "parent1",
      parentValue: "Parent 1",
      childArray: [
        { childKey: "child1-1", childValue: "Child 1-1" },
        { childKey: "child1-2", childValue: "Child 1-2" }
      ]
    },
    {
      parentKey: "parent2",
      parentValue: "Parent 2",
      childArray: [
        { childKey: "child2-1", childValue: "Child 2-1" }
      ]
    }
  ]
};
function Index() {
  const { control, register, watch, setValue, handleSubmit } = useForm({
    defaultValues: initialData
  });
  const { fields: parentFields, append: appendParent, remove: removeParent, move: moveParent } = useFieldArray({
    control,
    name: "parentArray"
  });
  const watchedData = watch();
  const parentContainerRef = useRef(null);
  const childContainerRefs = useRef({});
  useEffect(() => {
    if (parentContainerRef.current) {
      const sortable = Sortable.create(parentContainerRef.current, {
        handle: ".parent-drag-handle",
        animation: 150,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        onEnd: (evt) => {
          if (evt.oldIndex !== void 0 && evt.newIndex !== void 0) {
            moveParent(evt.oldIndex, evt.newIndex);
          }
        }
      });
      return () => {
        sortable.destroy();
      };
    }
  }, [moveParent]);
  useEffect(() => {
    const sortables = [];
    parentFields.forEach((_, parentIndex) => {
      const container = childContainerRefs.current[parentIndex];
      if (container) {
        const sortable = Sortable.create(container, {
          group: "children",
          // Allow moving between different parents
          animation: 150,
          ghostClass: "sortable-ghost",
          chosenClass: "sortable-chosen",
          onEnd: (evt) => {
            if (evt.oldIndex !== void 0 && evt.newIndex !== void 0) {
              const fromParentIndex = parseInt(evt.from.dataset.parentIndex || "0");
              const toParentIndex = parseInt(evt.to.dataset.parentIndex || "0");
              const currentData = watchedData.parentArray;
              if (fromParentIndex === toParentIndex) {
                const newParentArray = [...currentData];
                const childArray = [...newParentArray[fromParentIndex].childArray];
                const [movedChild] = childArray.splice(evt.oldIndex, 1);
                childArray.splice(evt.newIndex, 0, movedChild);
                newParentArray[fromParentIndex] = {
                  ...newParentArray[fromParentIndex],
                  childArray
                };
                setValue("parentArray", newParentArray);
              } else {
                const newParentArray = [...currentData];
                const fromChildArray = [...newParentArray[fromParentIndex].childArray];
                const toChildArray = [...newParentArray[toParentIndex].childArray];
                const [movedChild] = fromChildArray.splice(evt.oldIndex, 1);
                toChildArray.splice(evt.newIndex, 0, movedChild);
                newParentArray[fromParentIndex] = {
                  ...newParentArray[fromParentIndex],
                  childArray: fromChildArray
                };
                newParentArray[toParentIndex] = {
                  ...newParentArray[toParentIndex],
                  childArray: toChildArray
                };
                setValue("parentArray", newParentArray);
              }
            }
          }
        });
        sortables.push(sortable);
      }
    });
    return () => {
      sortables.forEach((sortable) => sortable.destroy());
    };
  }, [parentFields, setValue, watchedData.parentArray]);
  const addParent = () => {
    appendParent({
      parentKey: `parent${Date.now()}`,
      parentValue: `New Parent ${parentFields.length + 1}`,
      childArray: []
    });
  };
  const addChild = (parentIndex) => {
    const currentData = watchedData.parentArray;
    const newParentArray = [...currentData];
    const newChild = {
      childKey: `child${Date.now()}`,
      childValue: `New Child ${newParentArray[parentIndex].childArray.length + 1}`
    };
    newParentArray[parentIndex] = {
      ...newParentArray[parentIndex],
      childArray: [...newParentArray[parentIndex].childArray, newChild]
    };
    setValue("parentArray", newParentArray);
  };
  const removeChild = (parentIndex, childIndex) => {
    const currentData = watchedData.parentArray;
    const newParentArray = [...currentData];
    const newChildArray = [...newParentArray[parentIndex].childArray];
    newChildArray.splice(childIndex, 1);
    newParentArray[parentIndex] = {
      ...newParentArray[parentIndex],
      childArray: newChildArray
    };
    setValue("parentArray", newParentArray);
  };
  const onSubmit = (data) => {
    console.log("Form data:", JSON.stringify(data, null, 2));
    alert("Form submitted! Check console for data.");
  };
  return /* @__PURE__ */ jsxs("div", { className: "container", children: [
    /* @__PURE__ */ jsxs("div", { className: "form-section", children: [
      /* @__PURE__ */ jsx("h2", { children: "Sortable Form" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [
        /* @__PURE__ */ jsx("div", { ref: parentContainerRef, children: parentFields.map((parentField, parentIndex) => /* @__PURE__ */ jsxs("div", { className: "parent-item", children: [
          /* @__PURE__ */ jsxs("div", { className: "parent-header", children: [
            /* @__PURE__ */ jsx("span", { className: "drag-handle parent-drag-handle", children: "⋮⋮" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ...register(`parentArray.${parentIndex}.parentKey`),
                className: "parent-input",
                placeholder: "Parent Key"
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                ...register(`parentArray.${parentIndex}.parentValue`),
                className: "parent-input",
                placeholder: "Parent Value"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "remove-button",
                onClick: () => removeParent(parentIndex),
                children: "Remove"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "children-container", children: [
            /* @__PURE__ */ jsx("h4", { children: "Children:" }),
            /* @__PURE__ */ jsx(
              "div",
              {
                ref: (el) => {
                  childContainerRefs.current[parentIndex] = el;
                },
                "data-parent-index": parentIndex,
                children: watchedData.parentArray[parentIndex]?.childArray.map((child, childIndex) => /* @__PURE__ */ jsxs("div", { className: "child-item", children: [
                  /* @__PURE__ */ jsx("span", { className: "drag-handle", children: "⋮" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      ...register(`parentArray.${parentIndex}.childArray.${childIndex}.childKey`),
                      className: "child-input",
                      placeholder: "Child Key"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      ...register(`parentArray.${parentIndex}.childArray.${childIndex}.childValue`),
                      className: "child-input",
                      placeholder: "Child Value"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      className: "remove-button",
                      onClick: () => removeChild(parentIndex, childIndex),
                      children: "×"
                    }
                  )
                ] }, `${parentIndex}-${childIndex}`))
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "add-button",
                onClick: () => addChild(parentIndex),
                children: "Add Child"
              }
            )
          ] })
        ] }, parentField.id)) }),
        /* @__PURE__ */ jsxs("div", { style: { marginTop: "20px" }, children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "add-button", onClick: addParent, children: "Add Parent" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "add-button",
              style: { marginLeft: "10px", backgroundColor: "#28a745" },
              children: "Submit Form"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sidebar", children: [
      /* @__PURE__ */ jsx("h3", { children: "Index Information" }),
      /* @__PURE__ */ jsx("ul", { className: "index-list", children: watchedData.parentArray.map((parent, parentIndex) => /* @__PURE__ */ jsxs("li", { className: "index-item", children: [
        /* @__PURE__ */ jsxs("strong", { children: [
          "[",
          parentIndex,
          "] ",
          parent.parentKey
        ] }),
        /* @__PURE__ */ jsx("div", { className: "nested-index", children: parent.childArray.map((child, childIndex) => /* @__PURE__ */ jsxs("div", { children: [
          "[",
          parentIndex,
          ".",
          childIndex,
          "] ",
          child.childKey
        ] }, childIndex)) })
      ] }, parentIndex)) })
    ] })
  ] });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-D2CzwIaS.js", "imports": ["/assets/index-O48r6BTw.js", "/assets/components-D2_vjPdQ.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-DsTYUolK.js", "imports": ["/assets/index-O48r6BTw.js", "/assets/components-D2_vjPdQ.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-8GlvlZzU.js", "imports": ["/assets/index-O48r6BTw.js"], "css": [] } }, "url": "/assets/manifest-e71bdd01.js", "version": "e71bdd01" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "v3_routeConfig": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
