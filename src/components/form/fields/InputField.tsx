
import { Input, InputProps } from "@/components/ui/input";
import { FormFieldWrapper } from "../FormFieldWrapper";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";

interface InputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<InputProps, "name"> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label: string;
}

export function InputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ 
  form, 
  name, 
  label, 
  ...props 
}: InputFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldWrapper form={form} name={name} label={label}>
      <Input {...form.register(name)} {...props} />
    </FormFieldWrapper>
  );
}
