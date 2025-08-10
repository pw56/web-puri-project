import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Camera, Heart, Star, Sparkles, Download, RefreshCw, AlertCircle, Play } from 'lucide-react';

interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

interface Filter {
  id: string;
  name: string;
  style: string;
}

interface Frame {
  id: string;
  name: string;
  style: string;
  borderStyle: string;
}

interface PurikuraCameraProps {
  onPhotoCapture?: (photoUrl: string) => void;
}

const filters: Filter[] = [
  { id: 'none', name: 'なし', style: '' },
  { id: 'pink', name: 'ピンク', style: 'sepia(20%) saturate(150%) hue-rotate(300deg)' },
  { id: 'vintage', name: 'ビンテージ', style: 'sepia(50%) contrast(120%)' },
  { id: 'bright', name: '明るめ', style: 'brightness(130%) contrast(110%)' },
  { id: 'soft', name: 'ソフト', style: 'blur(0.5px) brightness(115%)' }
];

const frames: Frame[] = [
  { id: 'none', name: 'なし', style: '', borderStyle: '' },
  { id: 'heart', name: 'ハート', style: 'border-pink-300', borderStyle: 'border-8 rounded-3xl' },
  { id: 'star', name: 'スター', style: 'border-yellow-300', borderStyle: 'border-8 rounded-2xl' },
  { id: 'cute', name: 'キュート', style: 'border-purple-300', borderStyle: 'border-8 rounded-full' }
];

export function PurikuraCamera({ onPhotoCapture }: PurikuraCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [selectedFrame, setSelectedFrame] = useState(frames[0]);
  const [isCapturing, setIsCapturing] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 既存のストリームを停止
      stopCamera();

      // カメラの制約を設定
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // ビデオが再生可能になったら状態を更新
        videoRef.current.addEventListener('loadedmetadata', () => {
          setIsStreaming(true);
          setIsLoading(false);
        }, { once: true });

        // エラーハンドリング
        videoRef.current.addEventListener('error', (e) => {
          console.error('Video error:', e);
          setError('ビデオの再生でエラーが発生しました');
          setIsLoading(false);
        }, { once: true });
        
      } else {
        setError('ビデオ要素が見つかりません');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error('カメラの起動に失敗:', err);
      let errorMessage = 'カメラの起動に失敗しました。';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'カメラの使用が許可されていません。ブラウザの設定からカメラのアクセスを許可してください。';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'カメラが見つかりません。デバイスにカメラが接続されているか確認してください。';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'このブラウザではカメラがサポートされていません。ChromeやFirefoxなどのモダンブラウザをお試しください。';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'カメラが他のアプリケーションで使用されています。他のアプリを閉じてから再度お試しください。';
      } else if (location.protocol === 'http:' && location.hostname !== 'localhost') {
        errorMessage = 'セキュリティ上の理由により、HTTPSでないとカメラを使用できません。HTTPSサイトでお試しください。';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;
    
    setIsCapturing(true);
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      setIsCapturing(false);
      return;
    }
    
    // キャンバスのサイズを動画のサイズに合わせる
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // フィルターを適用
    context.filter = selectedFilter.style;
    context.drawImage(video, 0, 0);
    
    const dataUrl = canvas.toDataURL('image/png');
    const newPhoto: CapturedPhoto = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: Date.now()
    };
    
    setCapturedPhotos(prev => [newPhoto, ...prev]);
    
    // App.tsxにフォトキャプチャを通知
    if (onPhotoCapture) {
      onPhotoCapture(dataUrl);
    }
    
    setTimeout(() => setIsCapturing(false), 300);
  }, [selectedFilter, isStreaming, onPhotoCapture]);

  const downloadPhoto = (photo: CapturedPhoto) => {
    const link = document.createElement('a');
    link.download = `purikura-${photo.timestamp}.png`;
    link.href = photo.dataUrl;
    link.click();
  };

  React.useEffect(() => {
    return () => {
      // コンポーネントのアンマウント時にカメラを停止
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent" style={{ fontSize: '2.25rem' }}>
          ✨ プリクラ ✨
        </h1>
        <p className="text-muted-foreground">可愛い写真を撮ろう！</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
            <div className="mt-2">
              <Button 
                onClick={startCamera} 
                size="sm" 
                variant="outline"
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                再試行
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Section */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-pink-200">
            <div className="relative">
              <div className={`relative overflow-hidden rounded-2xl ${selectedFrame.borderStyle} ${selectedFrame.style} bg-gray-900 aspect-[4/3]`}>
                {!isStreaming && !isLoading && !error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Camera className="h-16 w-16 mb-4 text-white/60" />
                    <p className="text-white/80 mb-4">カメラを起動してください</p>
                    <Button 
                      onClick={startCamera}
                      className="bg-pink-500 hover:bg-pink-600"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      カメラ起動
                    </Button>
                  </div>
                )}
                
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mb-4"></div>
                    <p className="text-white/80">カメラを起動中...</p>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ 
                    filter: selectedFilter.style,
                    display: isStreaming ? 'block' : 'none'
                  }}
                />
                
                {isCapturing && isStreaming && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="animate-pulse" style={{ fontSize: '1.5rem' }}>📸 ✨</div>
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-6">
                {!isStreaming ? (
                  <Button
                    onClick={startCamera}
                    disabled={isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-8 py-4 shadow-lg"
                    style={{ fontSize: '1.125rem' }}
                  >
                    <Camera className="mr-2 h-6 w-6" />
                    {isLoading ? 'カメラ起動中...' : 'カメラ起動'}
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      onClick={capturePhoto}
                      disabled={!isStreaming || isCapturing}
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full px-8 py-4 shadow-lg"
                      style={{ fontSize: '1.125rem' }}
                    >
                      <Camera className="mr-2 h-6 w-6" />
                      撮影する
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      size="lg"
                      className="rounded-full px-6 py-4"
                    >
                      停止
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Controls */}
          {isStreaming && (
            <Card className="mt-4 p-4 bg-white/80 backdrop-blur-sm border-pink-200">
              <Tabs defaultValue="filters" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="filters">フィルター</TabsTrigger>
                  <TabsTrigger value="frames">フレーム</TabsTrigger>
                </TabsList>

                <TabsContent value="filters">
                  <div className="grid grid-cols-5 gap-2">
                    {filters.map((filter) => (
                      <Button
                        key={filter.id}
                        variant={selectedFilter.id === filter.id ? "default" : "outline"}
                        onClick={() => setSelectedFilter(filter)}
                        className="aspect-square flex flex-col items-center justify-center p-2"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <Sparkles className="h-4 w-4 mb-1" />
                        {filter.name}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="frames">
                  <div className="grid grid-cols-4 gap-2">
                    {frames.map((frame) => (
                      <Button
                        key={frame.id}
                        variant={selectedFrame.id === frame.id ? "default" : "outline"}
                        onClick={() => setSelectedFrame(frame)}
                        className="aspect-square flex flex-col items-center justify-center p-2"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {frame.id === 'heart' && <Heart className="h-4 w-4 mb-1" />}
                        {frame.id === 'star' && <Star className="h-4 w-4 mb-1" />}
                        {frame.id === 'cute' && <Sparkles className="h-4 w-4 mb-1" />}
                        {frame.id === 'none' && <RefreshCw className="h-4 w-4 mb-1" />}
                        {frame.name}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>

        {/* Photo Gallery */}
        <div className="space-y-4">
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-pink-200">
            <h3 className="mb-4 text-center">撮影した写真</h3>
            {capturedPhotos.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Camera className="h-12 w-12 mx-auto mb-2 text-pink-300" />
                まだ写真がありません
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {capturedPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.dataUrl}
                      alt="撮影した写真"
                      className="w-full rounded-lg shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        onClick={() => downloadPhoto(photo)}
                        size="sm"
                        className="bg-white/90 text-black hover:bg-white"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        保存
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-pink-500">
                      {new Date(photo.timestamp).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}