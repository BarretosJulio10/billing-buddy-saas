
import { Textarea } from "@/components/ui/textarea";
import { FormFieldWrapper } from "../FormFieldWrapper";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import React from "react";

interface TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
}

export function TextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ 
  form, 
  name, 
  label, 
  placeholder,
  disabled,
  className,
  rows,
  ...props 
}: TextareaFieldProps<TFieldValues, TName> & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "form" | "rows">) {
  return (
    <FormFieldWrapper form={form} name={name} label={label}>
      <Textarea 
        {...form.register(name)} 
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        rows={rows}
        {...props} 
      />
    </FormFieldWrapper>
  );
}
