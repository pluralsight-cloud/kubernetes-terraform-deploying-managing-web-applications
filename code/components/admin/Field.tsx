type Props = {
  label: string;
  name: string;
  value: string | number | boolean;
  onChange: (value: string) => void;
  type?: "text" | "number" | "textarea" | "select" | "checkbox";
  options?: { value: string; label: string }[];
  required?: boolean;
};

export default function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  options,
  required,
}: Props) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          required={required}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      ) : type === "select" ? (
        <select
          id={name}
          name={name}
          required={required}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "checkbox" ? (
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked ? "true" : "false")}
          className="h-4 w-4"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      )}
    </div>
  );
}
