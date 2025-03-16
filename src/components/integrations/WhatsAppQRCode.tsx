
import { Button } from "@/components/ui/button";
import { Loader2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface WhatsAppQRCodeProps {
  qrCode?: string;
  loading: boolean;
  onConnect: () => void;
}

export function WhatsAppQRCode({ qrCode, loading, onConnect }: WhatsAppQRCodeProps) {
  if (qrCode) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
            Escaneie o código QR com seu WhatsApp para conectar
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {qrCode.startsWith("data:image") ? (
              <img 
                src={qrCode} 
                alt="WhatsApp QR Code" 
                className="w-64 h-64"
              />
            ) : (
              <QRCodeSVG 
                value={qrCode} 
                size={256}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"L"}
                includeMargin={true}
              />
            )}
          </div>
        </div>
        
        <p className="text-sm text-center text-muted-foreground">
          Abra o WhatsApp no seu telefone e escaneie o código QR acima
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <Button onClick={onConnect} disabled={loading} className="w-full max-w-xs h-12 text-base">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Gerando QR Code...
          </>
        ) : (
          <>
            <QrCode className="mr-2 h-5 w-5" />
            Gerar QR Code para Conexão
          </>
        )}
      </Button>
    </div>
  );
}
