import React, { useState } from "react";
import { Controller } from "react-hook-form";
import Input from "../input";
import { X, Plus, ListPlus } from "lucide-react";

interface Property {
  label: string;
  values: string[];
}

export const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <main className="w-full">
      <Controller
        name="customProperties"
        control={control}
        render={({ field }) => {
          
        // Helper to sync local state with React Hook Form
        const syncForm = (updatedList: Property[]) => {
          setProperties(updatedList);
          field.onChange(updatedList);
        };

        const handleAddProperty = () => {
          if (!newLabel.trim()) return;
          const updated = [...properties, { label: newLabel, values: [] }];
          syncForm(updated);
          setNewLabel("");
        };

        const handleAddValue = (index: number) => {
          if (!newValue.trim()) return;
          const updated = [...properties];
          updated[index].values = [...updated[index].values, newValue.trim()];
          syncForm(updated);
          setNewValue("");
        };

        const handleRemoveValue = (propIndex: number, valIndex: number) => {
          const updated = [...properties];
          updated[propIndex].values = updated[propIndex].values.filter((_, i) => i !== valIndex);
          syncForm(updated);
        };

        const handleRemoveProperty = (index: number) => {
          const updated = properties.filter((_, i) => i !== index);
          syncForm(updated);
        };

          return (
            <div className="flex flex-col w-full">
              <label className="block font-semibold text-gray-200">
                Custom Properties 
              </label>

              {/* Render Existing Groups */}
              <section className=" w-full grid grid-cols-2 md:grid-cols-1">
                {properties.map((prop, pIdx) => (
                  <div key={pIdx} className="w-full border border-gray-700 p-4 rounded-xl bg-gray-900/80">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-blue-400 uppercase text-xs tracking-wider">
                        {prop.label}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveProperty(pIdx)}
                        className="text-gray-500 hover:text-red-500 transition-colors">
                        <X size={18} />
                      </button>
                    </div>

                    {/* Add Value Input */}
                    <div className="flex gap-2 w-full">
                        <input
                          type="text"
                          placeholder="Custon Value ..."
                          className="flex-1 p-2 bg-slate-500/30 text-sm px-3 border border-gray-100 rounded-md focus:border-blue-500 outline-none "
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddValue(pIdx))}
                        />
                        <button 
                        type="button" 
                        onClick={() => handleAddValue(pIdx)}
                        className="justify-center mb-1 p-2 bg-blue-600 hover:bg-blue-700 text-white  rounded-md gap-2 transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                     {/* Value Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {prop.values.map((value, valueId) => (
                        <span key={valueId} className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-sm border border-gray-600">
                          {value}
                          <X 
                            size={14} 
                            className="cursor-pointer hover:text-red-400" 
                            onClick={() => handleRemoveValue(pIdx, valueId)} 
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {/* Add New Property Category */}
              <section className="flex items-end gap-3 mt-2 border-gray-800 rounded-xl">
                <div className="flex-1 [&_label]:opacity-50 [&_label]:text-md">
                  <Input
                    label="New Category"
                    className="placeholder:text-sm "
                    placeholder="Enter property value (eg. Material, Color)"
                    value={newLabel}
                    onChange={(e: any) => setNewLabel(e.target.value)}
                    onKeyDown={(e : any) => e.key === 'Enter' && (e.preventDefault(),handleAddProperty())}
                  />
                </div>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md flex items-center gap-2 h-[42px] transition-all"
                  onClick={handleAddProperty}>
                  <span>Add</span>
                  <ListPlus size={18} />
                </button>
              </section>

              {errors?.customProperties && (
                <p className="text-red-400 text-xs italic">
                  {errors.customProperties.message as string}
                </p>
              )}
            </div>
          );
        }}
      />
    </main>
  );
};

export default CustomProperties;