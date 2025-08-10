import React, { useState } from 'react';
import { PurikuraCamera } from './components/PurikuraCamera';
import { PurikuraDecorator } from './components/PurikuraDecorator';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { ArrowLeft, Camera, Palette, Download, Share2 } from 'lucide-react';

type AppMode = 'camera' | 'decorator' | 'gallery';

interface SavedPhoto {
  id: string;
  originalUrl: string;
  decoratedUrl?: string;
  timestamp: number;
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('camera');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);

  const handlePhotoCapture = (photoUrl: string) => {
    const newPhoto: SavedPhoto = {
      id: Date.now().toString(),
      originalUrl: photoUrl,
      timestamp: Date.now()
    };
    setSavedPhotos(prev => [newPhoto, ...prev]);
    setSelectedPhoto(photoUrl);
    setMode('decorator');
  };

  const handleDecorationSave = (decoratedUrl: string) => {
    if (selectedPhoto) {
      setSavedPhotos(prev => prev.map(photo => 
        photo.originalUrl === selectedPhoto 
          ? { ...photo, decoratedUrl }
          : photo
      ));
    }
    setMode('gallery');
  };

  const downloadPhoto = (photoUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = photoUrl;
    link.click();
  };

  const sharePhoto = async (photoUrl: string) => {
    if (navigator.share) {
      try {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'purikura.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'プリクラ写真',
          text: '可愛い写真が撮れました！',
          files: [file],
        });
      } catch (err) {
        console.log('Share failed:', err);
        // フォールバック：クリップボードにコピー
        try {
          await navigator.clipboard.writeText('プリクラ写真をシェアしました！');
        } catch (clipErr) {
          console.log('Clipboard failed:', clipErr);
        }
      }
    } else {
      // Web Share APIがサポートされていない場合の処理
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('リンクがクリップボードにコピーされました！');
      } catch (err) {
        console.log('Fallback share failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {mode !== 'camera' && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (mode === 'decorator') {
                      setMode('camera');
                      setSelectedPhoto(null);
                    } else {
                      setMode('camera');
                    }
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  戻る
                </Button>
              )}
              <h1 className="text-2xl bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                ✨ プリクラ ✨
              </h1>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={mode === 'camera' ? 'default' : 'ghost'}
                onClick={() => setMode('camera')}
                size="sm"
              >
                <Camera className="h-4 w-4 mr-1" />
                撮影
              </Button>
              <Button
                variant={mode === 'gallery' ? 'default' : 'ghost'}
                onClick={() => setMode('gallery')}
                size="sm"
              >
                <Palette className="h-4 w-4 mr-1" />
                ギャラリー ({savedPhotos.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {mode === 'camera' && (
          <PurikuraCamera onPhotoCapture={handlePhotoCapture} />
        )}

        {mode === 'decorator' && selectedPhoto && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl mb-2">デコレーション</h2>
              <p className="text-muted-foreground">可愛くデコレーションしよう！</p>
            </div>
            <PurikuraDecorator
              imageUrl={selectedPhoto}
              onSave={handleDecorationSave}
            />
          </div>
        )}

        {mode === 'gallery' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl mb-2">ギャラリー</h2>
              <p className="text-muted-foreground">撮影した写真一覧 ({savedPhotos.length}枚)</p>
            </div>

            {savedPhotos.length === 0 ? (
              <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-pink-200">
                <Camera className="h-16 w-16 mx-auto mb-4 text-pink-300" />
                <h3 className="text-xl mb-2">まだ写真がありません</h3>
                <p className="text-muted-foreground mb-4">
                  撮影ボタンから可愛い写真を撮ってみよう！
                </p>
                <Button 
                  onClick={() => setMode('camera')}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  撮影を始める
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPhotos.map((photo) => (
                  <Card key={photo.id} className="p-4 bg-white/80 backdrop-blur-sm border-pink-200 hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      <div className="relative group">
                        {photo.decoratedUrl ? (
                          <img
                            src={photo.decoratedUrl}
                            alt="デコレーション済み写真"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ) : (
                          <img
                            src={photo.originalUrl}
                            alt="撮影した写真"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                        {photo.decoratedUrl && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs">
                              ✨ デコ済み
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground text-center">
                        {new Date(photo.timestamp).toLocaleString('ja-JP')}
                      </div>
                      
                      <div className="flex gap-2">
                        {!photo.decoratedUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPhoto(photo.originalUrl);
                              setMode('decorator');
                            }}
                            className="flex-1 hover:bg-pink-50"
                          >
                            <Palette className="h-4 w-4 mr-1" />
                            デコる
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPhoto(
                            photo.decoratedUrl || photo.originalUrl,
                            `purikura-${photo.timestamp}.png`
                          )}
                          className="flex-1 hover:bg-blue-50"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          保存
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sharePhoto(photo.decoratedUrl || photo.originalUrl)}
                          className="flex-1 hover:bg-green-50"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          共有
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}