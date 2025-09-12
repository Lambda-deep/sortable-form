import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Sortable from "sortablejs";
import type { Data, Parent, Child } from "../types";

// Initial sample data
const initialData: Data = {
  parentArray: [
    {
      parentKey: "parent1",
      parentValue: "Parent 1",
      childArray: [
        { childKey: "child1-1", childValue: "Child 1-1" },
        { childKey: "child1-2", childValue: "Child 1-2" },
      ],
    },
    {
      parentKey: "parent2",
      parentValue: "Parent 2",
      childArray: [
        { childKey: "child2-1", childValue: "Child 2-1" },
      ],
    },
  ],
};

export default function Index() {
  const { control, register, watch, setValue, handleSubmit } = useForm<Data>({
    defaultValues: initialData,
  });

  const { fields: parentFields, append: appendParent, remove: removeParent, move: moveParent } = useFieldArray({
    control,
    name: "parentArray",
  });

  const watchedData = watch();
  const parentContainerRef = useRef<HTMLDivElement>(null);
  const childContainerRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Initialize sortable for parents
  useEffect(() => {
    if (parentContainerRef.current) {
      const sortable = Sortable.create(parentContainerRef.current, {
        handle: ".parent-drag-handle",
        animation: 150,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            moveParent(evt.oldIndex, evt.newIndex);
          }
        },
      });

      return () => {
        sortable.destroy();
      };
    }
  }, [moveParent]);

  // Initialize sortable for children
  useEffect(() => {
    const sortables: Sortable[] = [];

    parentFields.forEach((_, parentIndex) => {
      const container = childContainerRefs.current[parentIndex];
      if (container) {
        const sortable = Sortable.create(container, {
          group: "children", // Allow moving between different parents
          animation: 150,
          ghostClass: "sortable-ghost",
          chosenClass: "sortable-chosen",
          onEnd: (evt) => {
            if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
              const fromParentIndex = parseInt(evt.from.dataset.parentIndex || "0");
              const toParentIndex = parseInt(evt.to.dataset.parentIndex || "0");
              
              // Get current data
              const currentData = watchedData.parentArray;
              
              if (fromParentIndex === toParentIndex) {
                // Same parent - just reorder
                const newParentArray = [...currentData];
                const childArray = [...newParentArray[fromParentIndex].childArray];
                const [movedChild] = childArray.splice(evt.oldIndex, 1);
                childArray.splice(evt.newIndex, 0, movedChild);
                newParentArray[fromParentIndex] = {
                  ...newParentArray[fromParentIndex],
                  childArray,
                };
                setValue("parentArray", newParentArray);
              } else {
                // Different parent - move between parents
                const newParentArray = [...currentData];
                const fromChildArray = [...newParentArray[fromParentIndex].childArray];
                const toChildArray = [...newParentArray[toParentIndex].childArray];
                
                const [movedChild] = fromChildArray.splice(evt.oldIndex, 1);
                toChildArray.splice(evt.newIndex, 0, movedChild);
                
                newParentArray[fromParentIndex] = {
                  ...newParentArray[fromParentIndex],
                  childArray: fromChildArray,
                };
                newParentArray[toParentIndex] = {
                  ...newParentArray[toParentIndex],
                  childArray: toChildArray,
                };
                
                setValue("parentArray", newParentArray);
              }
            }
          },
        });
        sortables.push(sortable);
      }
    });

    return () => {
      sortables.forEach(sortable => sortable.destroy());
    };
  }, [parentFields, setValue, watchedData.parentArray]);

  const addParent = () => {
    appendParent({
      parentKey: `parent${Date.now()}`,
      parentValue: `New Parent ${parentFields.length + 1}`,
      childArray: [],
    });
  };

  const addChild = (parentIndex: number) => {
    const currentData = watchedData.parentArray;
    const newParentArray = [...currentData];
    const newChild: Child = {
      childKey: `child${Date.now()}`,
      childValue: `New Child ${newParentArray[parentIndex].childArray.length + 1}`,
    };
    newParentArray[parentIndex] = {
      ...newParentArray[parentIndex],
      childArray: [...newParentArray[parentIndex].childArray, newChild],
    };
    setValue("parentArray", newParentArray);
  };

  const removeChild = (parentIndex: number, childIndex: number) => {
    const currentData = watchedData.parentArray;
    const newParentArray = [...currentData];
    const newChildArray = [...newParentArray[parentIndex].childArray];
    newChildArray.splice(childIndex, 1);
    newParentArray[parentIndex] = {
      ...newParentArray[parentIndex],
      childArray: newChildArray,
    };
    setValue("parentArray", newParentArray);
  };

  const onSubmit = (data: Data) => {
    console.log("Form data:", JSON.stringify(data, null, 2));
    alert("Form submitted! Check console for data.");
  };

  return (
    <div className="container">
      <div className="form-section">
        <h2>Sortable Form</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div ref={parentContainerRef}>
            {parentFields.map((parentField, parentIndex) => (
              <div key={parentField.id} className="parent-item">
                <div className="parent-header">
                  <span className="drag-handle parent-drag-handle">⋮⋮</span>
                  <input
                    {...register(`parentArray.${parentIndex}.parentKey`)}
                    className="parent-input"
                    placeholder="Parent Key"
                  />
                  <input
                    {...register(`parentArray.${parentIndex}.parentValue`)}
                    className="parent-input"
                    placeholder="Parent Value"
                  />
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeParent(parentIndex)}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="children-container">
                  <h4>Children:</h4>
                  <div
                    ref={(el) => { childContainerRefs.current[parentIndex] = el; }}
                    data-parent-index={parentIndex}
                  >
                    {watchedData.parentArray[parentIndex]?.childArray.map((child: Child, childIndex: number) => (
                      <div key={`${parentIndex}-${childIndex}`} className="child-item">
                        <span className="drag-handle">⋮</span>
                        <input
                          {...register(`parentArray.${parentIndex}.childArray.${childIndex}.childKey`)}
                          className="child-input"
                          placeholder="Child Key"
                        />
                        <input
                          {...register(`parentArray.${parentIndex}.childArray.${childIndex}.childValue`)}
                          className="child-input"
                          placeholder="Child Value"
                        />
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() => removeChild(parentIndex, childIndex)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="add-button"
                    onClick={() => addChild(parentIndex)}
                  >
                    Add Child
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: "20px" }}>
            <button type="button" className="add-button" onClick={addParent}>
              Add Parent
            </button>
            <button
              type="submit"
              className="add-button"
              style={{ marginLeft: "10px", backgroundColor: "#28a745" }}
            >
              Submit Form
            </button>
          </div>
        </form>
      </div>

      <div className="sidebar">
        <h3>Index Information</h3>
        <ul className="index-list">
          {watchedData.parentArray.map((parent: Parent, parentIndex: number) => (
            <li key={parentIndex} className="index-item">
              <strong>[{parentIndex}] {parent.parentKey}</strong>
              <div className="nested-index">
                {parent.childArray.map((child: Child, childIndex: number) => (
                  <div key={childIndex}>
                    [{parentIndex}.{childIndex}] {child.childKey}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}