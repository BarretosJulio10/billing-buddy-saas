
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  orgName: z.string().min(3, "O nome da organização deve ter pelo menos 3 caracteres"),
});

type RegisterFormProps = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export function RegisterForm({ isLoading, setIsLoading }: RegisterFormProps) {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      orgName: ""
    },
  });

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    try {
      setIsLoading(true);
      setRegisterError(null);
      
      console.log("Registration attempt with:", {
        email: data.email,
        orgName: data.orgName
      });
      
      await signUp(data.email, data.password, data.orgName);
      
      form.reset();
      
      toast({
        title: "Conta criada com sucesso",
        description: "Você já pode fazer login no sistema.",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = "Erro ao criar conta. Por favor, tente novamente.";
      
      if (error.message.includes("already in use")) {
        errorMessage = "Este email já está em uso. Por favor, use outro email.";
      }
      
      setRegisterError(errorMessage);
      
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setRegisterError(null);
  };

  return (
    <Form {...form}>
      {registerError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex justify-between items-center">
            {registerError}
            <button onClick={clearError} className="text-xs">
              <X size={16} />
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} onChange={(e) => {
                  field.onChange(e);
                  if (registerError) setRegisterError(null);
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} onChange={(e) => {
                  field.onChange(e);
                  if (registerError) setRegisterError(null);
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="orgName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Organização</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa ou organização" {...field} onChange={(e) => {
                  field.onChange(e);
                  if (registerError) setRegisterError(null);
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
}
