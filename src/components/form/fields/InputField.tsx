
import { Input } from "@/components/ui/input";
import { FormFieldWrapper } from "../FormFieldWrapper";
import { UseFormReturn, FieldPath, FieldValues } from "react-hook-form";
import React from "react";

interface InputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function InputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ 
  form, 
  name, 
  label, 
  type = "text",
  placeholder,
  disabled,
  className,
  ...props 
}: InputFieldProps<TFieldValues, TName> & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "form" | "type">) {
  return (
    <FormFieldWrapper form={form} name={name} label={label}>
      <Input 
        {...form.register(name)} 
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        {...props} 
      />
    </FormFieldWrapper>
  );
}
