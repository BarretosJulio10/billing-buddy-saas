
import { Textarea, TextareaProps } from "@/components/ui/textarea";
import { FormFieldWrapper } from "../FormFieldWrapper";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";

interface TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<TextareaProps, "name"> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label: string;
}

export function TextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ 
  form, 
  name, 
  label, 
  ...props 
}: TextareaFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldWrapper form={form} name={name} label={label}>
      <Textarea {...form.register(name)} {...props} />
    </FormFieldWrapper>
  );
}
