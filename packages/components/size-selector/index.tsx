
import { Controller } from "react-hook-form";

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export const SizeSelector = ({ control, errors } : any) => {
  return (
    <div className="mt-4">
      <label className="font-semibold block mb-2">Sizes</label>
      <Controller
        name="sizes"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => {
              const isSelected = (field.value || []).includes(size);
              return (
                <button
                  type="button"
                  key={size}
                  onClick={() => {
                    const newValue = isSelected
                      ? field.value.filter((s :any) => s !== size)
                      : [...(field.value || []), size];
                    field.onChange(newValue);
                  }}
                  className={`px-4 py-1 rounded-lg font-Poppins transition-colors border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-transparent text-gray-700 border-[#ffffff6b]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      />
      {errors.sizes && (
        <p className="text-red-500 text-xs mt-1">
          {errors.sizes.message as string}
        </p>
      )}
    </div>
  );
};