
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

const adminLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type AdminLoginFormProps = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export function AdminLoginForm({ isLoading, setIsLoading }: AdminLoginFormProps) {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "julioquintanilha@hotmail.com",
      password: "Gigi553518-+.#",
    },
  });

  const handleLogin = async (data: z.infer<typeof adminLoginSchema>) => {
    try {
      setIsLoading(true);
      setLoginError(null);
      
      // Check if credentials are admin credentials
      if (data.email !== "julioquintanilha@hotmail.com") {
        throw new Error("Acesso restrito apenas para administradores");
      }
      
      await signIn(data.email, data.password);
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.message || "Credenciais de login inválidas. Este painel é apenas para administradores.");
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas ou acesso não autorizado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              <FormLabel>Email Administrativo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="admin@email.com" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    if (loginError) setLoginError(null);
                  }}
                />
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
                <Input 
                  type="password" 
                  placeholder="••••••" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    if (loginError) setLoginError(null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Acessar Painel Admin"}
        </Button>
      </form>
    </Form>
  );
}
