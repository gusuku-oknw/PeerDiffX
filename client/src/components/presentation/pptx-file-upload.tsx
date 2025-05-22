import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { CloudUpload, FilePresent } from '@mui/icons-material';
import { useState, useRef } from 'react';

interface PPTXFileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  currentFile?: File | null;
}

export function PPTXFileUpload({ 
  onFileSelect, 
  isUploading = false,
  currentFile 
}: PPTXFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      onFileSelect(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        PPTXファイルをアップロード
      </Typography>
      
      {currentFile ? (
        <Paper 
          elevation={2}
          sx={{ 
            p: 3, 
            bgcolor: 'success.main', 
            color: 'success.contrastText',
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FilePresent />
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {currentFile.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {formatFileSize(currentFile.size)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={dragOver ? 4 : 1}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{ 
            p: 4,
            border: dragOver ? 2 : 1,
            borderStyle: 'dashed',
            borderColor: dragOver ? 'primary.main' : 'divider',
            bgcolor: dragOver ? 'action.hover' : 'background.default',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            textAlign: 'center'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography>アップロード中...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h6">
                PPTXファイルをドラッグ&ドロップ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                または、クリックしてファイルを選択
              </Typography>
              <Button variant="outlined" component="span">
                ファイルを選択
              </Button>
            </Box>
          )}
        </Paper>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pptx"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {currentFile && (
        <Button 
          variant="outlined" 
          onClick={() => fileInputRef.current?.click()}
          fullWidth
          sx={{ mt: 2 }}
        >
          別のファイルを選択
        </Button>
      )}
    </Box>
  );
}