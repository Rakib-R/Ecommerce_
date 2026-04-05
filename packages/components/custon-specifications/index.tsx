
import React from "react";
import { Controller, useFieldArray } from "react-hook-form";
import Input from "../input";
import { PlusCircle, Trash2 } from "lucide-react";

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "custom_specifications",
  });

  return (
    <main>
        <label className="block font-semibold">
            Custom Specifications
        </label>

        <section className="flex flex-col mt-2 gap-2 ml-4">
            {fields?.map((item, index) => (
            <div key={item.id} className="flex gap-2 items-end text-gray-400">
            
            {/* 1ST CONTROLLER */}
            <Controller
                name={`custom_specifications.${index}.name`}
                control={control}
                rules={{
                    required: "Specification name is required",
                }}
                render={({ field }) => (
                <Input
                    label="Specification Name"
                    placeholder="e.g., Battery Life, Weight, Material"
                    {...field}
                />
                )}
                />

                {/* 2ND CONTROLLER */}
            <Controller
                name={`custom_specifications.${index}.value`}
                control={control}
                rules={{ required: "Value is required" }}
                render={({ field }) => ( 
                    <Input
                    label="Value"
                    placeholder="e.g., 1.5kg, Plastic"
                    {...field} 
                    />  )} />

            <button
                className="hover:text-red-700 pb-2 cursor-pointer transition-colors"
                onClick={() => remove(index)}
                type="button">
                <Trash2 />
            </button>
        </div>
        ))}
          
        <button
            type="button"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-6600"
            onClick={() => append({ name: "", value: "" })}>
            <PlusCircle size={20}/> Add Specification
        </button>

    </section>
        {errors?.custom_specifications && (
            <p className="text-xs mt-1"> {errors.custom_specifications.message as string}
            </p>
        )}
    </main>
  );
};

export default CustomSpecifications;