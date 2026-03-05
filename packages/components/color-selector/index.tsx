import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";

const defaultColors = [
  
  "White",
  "Red",
  "Green",
  "Blue",
  "Yellow",
  "Black",  
  "Magenta",
  "Cyan",
];


export const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(true);
  const [newColor, setNewColor] = useState("#ffffff");

  return (
    <div>
      <label className="font-semibold text-gray-300">Colors</label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
        <section className="flex gap-3 flex-wrap ml-4">
              {[...defaultColors, ...customColors].map((color) => {
                const isSelected = field.value?.includes(color) || field.value?.includes(color.toLowerCase());
                const isLightColor = ["#ffffff", "#ffffff00"].includes(color);
                return (
                <button
                    key={color}
                    type="button"
                    onClick={() => {
                    const current = field.value || [];

                    if (current.includes(color)) {
                        field.onChange(current.filter((c: string) => c !== color));
                    } else {
                        field.onChange([...current, color]);
                    }}}
                  className={`flex items-center justify-center w-7 h-7 p-2 my-1 rounded-lg border-2 border-white transition ${ isSelected ?
                    "scale-110 border-white" : "border-transparent" } ${isLightColor ? "border-gray-600" : ""}`}
                  style={{backgroundColor: color}}>
                </button>
                );
            })}

            <button className="h-8 w-8 flex items-center justify-center rounded-full border"
                onClick={() => setShowColorPicker(!showColorPicker)}>
                <Plus size={16} color="white"/>
            </button>

           {showColorPicker && (
            <div className="relative flex items-center gap-2">
                <input
                    type="color"
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-10 h-10 border-none cursor-pointer"
                />
                <button type="button"
                    onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                    }}
                    className="px-3 py-1 bg-gray-700 text-white rounded-sm text-sm">
                        Add
                    </button>
            </div>
           )}
        </section>
     )} />
       
        </div>
  );
};