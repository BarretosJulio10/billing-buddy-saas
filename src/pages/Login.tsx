
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">PagouPix Admin</CardTitle>
          <CardDescription className="text-center">
            Acesso Administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
