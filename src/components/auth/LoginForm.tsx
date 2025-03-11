
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
import { X, Info } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginFormProps = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export function LoginForm({ isLoading, setIsLoading }: LoginFormProps) {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: isAdminMode ? "julioquintanilha@hotmail.com" : "",
      password: isAdminMode ? "Gigi553518-+.#" : "",
    },
  });

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      setLoginError(null);
      await signIn(data.email, data.password);
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError("Credenciais de login inválidas. Por favor, verifique seu email e senha.");
      toast({
        title: "Erro ao fazer login",
        description: "Credenciais inválidas. Verifique seu email e senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
    if (!isAdminMode) {
      form.setValue("email", "julioquintanilha@hotmail.com");
      form.setValue("password", "Gigi553518-+.#");
    } else {
      form.setValue("email", "");
      form.setValue("password", "");
    }
  };

  const clearError = () => {
    setLoginError(null);
  };

  return (
    <Form {...form}>
      {loginError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex justify-between items-center">
            {loginError}
            <button onClick={clearError} className="text-xs">
              <X size={16} />
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} onChange={(e) => {
                  field.onChange(e);
                  if (loginError) setLoginError(null);
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
                  if (loginError) setLoginError(null);
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between items-center">
          <Button type="button" variant="ghost" size="sm" className="text-xs flex items-center gap-1" onClick={toggleAdminMode}>
            <Info size={12} />
            {isAdminMode ? "Modo Normal" : "Modo Admin"}
          </Button>
          <Button type="submit" className="w-32" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
