import { useState, useRef } from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Upload, FileSpreadsheet, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUpload({ 
  onFileUpload, 
  accept = ".xlsx,.xls", 
  maxSize = 10,
  className 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);
    
    // Simulate upload delay
    setTimeout(() => {
      onFileUpload(file);
      setIsUploading(false);
    }, 1000);
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Upload de Planilha
        </CardTitle>
        <CardDescription>
          Faça upload de um arquivo Excel (.xlsx, .xls) para carregar os dados dos serviços técnicos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!uploadedFile ? (
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
              dragActive 
                ? "border-primary bg-primary/5 scale-105" 
                : "border-border hover:border-primary/50 hover:bg-muted/50",
              "cursor-pointer group"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={openFileExplorer}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center space-y-4">
              <div className={cn(
                "p-4 rounded-full transition-all duration-300",
                dragActive ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
              )}>
                <Upload className={cn(
                  "h-8 w-8 transition-colors",
                  dragActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {dragActive ? "Solte o arquivo aqui" : "Clique para fazer upload ou arraste aqui"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Arquivos Excel até {maxSize}MB
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="transition-all duration-300 group-hover:border-primary group-hover:text-primary"
              >
                Selecionar Arquivo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-success/20 rounded-lg">
                  {isUploading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-success border-t-transparent rounded-full" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {!isUploading && (
              <Button 
                onClick={openFileExplorer}
                variant="outline"
                className="w-full"
              >
                Carregar outro arquivo
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}