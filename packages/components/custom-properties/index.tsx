
import React, { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import Input from "../input";
import { Plus, X } from "lucide-react";

export const CustomProperties = ({ control, errors }: any) => {

  const [properties, setProperties] = useState<{ label: string; values: string[] }[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <main>
      <section className="flex flex-col mt-2 gap-2 ml-4">
          <div  className="flex gap-2 items-end text-gray-400">
          
              {/* CONTROLLER CONTROLLER*/}
          <Controller
              name="customProperties"
              control={control}
              render={({ field }) => { 

                useEffect(() => { 
                field.onChange(properties) ;
                },[properties])

              const addProperty = () => {
                  if (!newLabel.trim()) return;
                  setProperties([
                    ...properties,
                    { label: newLabel, values: [] },
                  ]);
                  setNewLabel("");
                };

              const addValue = (index: number) => {
                if (!newValue.trim()) return;
                const updatedProperties = [...properties];
                updatedProperties[index].values.push(newValue);

                setProperties(updatedProperties);
                setNewValue("");
              };
              
              const removeProperty = (index: number) => {
                setProperties(properties.filter((_, i) => i !== index));
              };
              return (
                <div className="mt-2">
                  <label className="block font-semibold text-gray-300 mb-1">
                    Custom Properties
                  </label>

                  <section className="flex flex-col gap-3 mt-2">
                    {/* Existing Properties */}
                    {properties.map((property, index) => (
                      // Remove Propertiex
                      <div
                        key={index}
                        className="border p-3 rounded-lg text-white">
                        <div className="flex items-center justify-between font-medium">
                          <span>{property.label}</span>
                          <button
                            type="button"
                            onClick={() => removeProperty(index)}>
                            <X size={18} className="text-red-500"/>
                          </button>
                          </div>
                         
                          {/* Add Values to Property */}
                        <div className="flex items-center mt-2 gap-2">
                          <input
                            type="text"
                            className="outline-none bg-gray-800 p-2 rounded-md"
                            placeholder="Enter value..."
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                          />
                          <button
                            type="button"
                            className="px-3 py-1 text-white rounded-md"
                            onClick={() => addValue(index)}>
                            Add
                          </button>
                        </div>

                        {/* Show Values */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {property.values.map((value, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-700 text-white rounded-md"
                              >
                                {value}
                              </span>
                            ))}
                          </div>
                      </div>
                    ))}
                  </section>
                    {/* ADD NEW PROPERTY */}
                  <section className="flex items-center gap-4">
                    <Input
                        placeholder="Enter property label (e.g., Material, Warranty)"
                        onChange={(e: any) => setNewLabel(e.target.value)}
                        />
                       <button 
                       className="w-1/5 p-2 rounded-md bg-blue-400 text-black cursor-pointer"
                        onClick={() => addProperty}
                       >
                        Add
                       </button>
                  </section>

               {errors?.customProperties && (
                  <p className="text-xs mt-1"> {errors.customProperties.message as string}
                  </p>
                  )}
                </div>
                
                )
            
              }}/>
        </div>
    </section>
  
    </main>
  );
};

export default CustomProperties;