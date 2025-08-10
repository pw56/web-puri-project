import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Type, Sticker, Palette, RotateCw, Trash2 } from 'lucide-react';

interface Stamp {
  id: string;
  emoji: string;
  name: string;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

interface StickerElement {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const stamps: Stamp[] = [
  { id: '1', emoji: '💖', name: 'ハート' },
  { id: '2', emoji: '⭐', name: 'スター' },
  { id: '3', emoji: '🌸', name: 'サクラ' },
  { id: '4', emoji: '🦄', name: 'ユニコーン' },
  { id: '5', emoji: '🌈', name: 'にじ' },
  { id: '6', emoji: '✨', name: 'キラキラ' },
  { id: '7', emoji: '🎀', name: 'リボン' },
  { id: '8', emoji: '👑', name: 'クラウン' },
  { id: '9', emoji: '🍓', name: 'イチゴ' },
  { id: '10', emoji: '🧸', name: 'テディ' },
  { id: '11', emoji: '🌺', name: 'ハイビスカス' },
  { id: '12', emoji: '🎈', name: 'バルーン' }
];

const colors = [
  '#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB',
  '#DDA0DD', '#9370DB', '#8A2BE2', '#4B0082',
  '#00CED1', '#40E0D0', '#48D1CC', '#AFEEEE',
  '#FFD700', '#FFA500', '#FF6347', '#FF4500'
];

interface PurikuraDecoratorProps {
  imageUrl: string;
  onSave: (decoratedImageUrl: string) => void;
}

export function PurikuraDecorator({ imageUrl, onSave }: PurikuraDecoratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [stickerElements, setStickerElements] = useState<StickerElement[]>([]);
  const [newText, setNewText] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [textSize, setTextSize] = useState([24]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const addText = () => {
    if (!newText.trim()) return;
    
    const element: TextElement = {
      id: Date.now().toString(),
      text: newText,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      color: selectedColor,
      size: textSize[0],
      rotation: 0
    };
    
    setTextElements(prev => [...prev, element]);
    setNewText('');
  };

  const addSticker = (stamp: Stamp) => {
    const element: StickerElement = {
      id: Date.now().toString(),
      emoji: stamp.emoji,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
      size: 40,
      rotation: 0
    };
    
    setStickerElements(prev => [...prev, element]);
  };

  const deleteElement = (id: string) => {
    setTextElements(prev => prev.filter(el => el.id !== id));
    setStickerElements(prev => prev.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const rotateElement = (id: string) => {
    setTextElements(prev => prev.map(el => 
      el.id === id ? { ...el, rotation: el.rotation + 15 } : el
    ));
    setStickerElements(prev => prev.map(el => 
      el.id === id ? { ...el, rotation: el.rotation + 15 } : el
    ));
  };

  const saveDecoratedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Draw stickers
      stickerElements.forEach(sticker => {
        ctx.save();
        ctx.translate(sticker.x, sticker.y);
        ctx.rotate(sticker.rotation * Math.PI / 180);
        ctx.fillStyle = sticker.emoji;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${sticker.size}px serif`;
        ctx.fillText(sticker.emoji, 0, 0);
        ctx.restore();
      });
      
      // Draw text
      textElements.forEach(text => {
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate(text.rotation * Math.PI / 180);
        ctx.fillStyle = text.color;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${text.size}px "Comic Sans MS", cursive`;
        ctx.strokeText(text.text, 0, 0);
        ctx.fillText(text.text, 0, 0);
        ctx.restore();
      });
      
      const decoratedUrl = canvas.toDataURL('image/png');
      onSave(decoratedUrl);
    };
    img.src = imageUrl;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Image Preview */}
      <div className="lg:col-span-2">
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-pink-200">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={imageUrl} 
              alt="編集中の写真" 
              className="w-full h-auto max-h-96 object-contain"
            />
            
            {/* Text overlays */}
            {textElements.map(text => (
              <div
                key={text.id}
                className={`absolute cursor-pointer select-none ${
                  selectedElement === text.id ? 'ring-2 ring-pink-500' : ''
                }`}
                style={{
                  left: text.x,
                  top: text.y,
                  color: text.color,
                  fontSize: text.size,
                  transform: `translate(-50%, -50%) rotate(${text.rotation}deg)`,
                  fontFamily: '"Comic Sans MS", cursive',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 0px white, -2px -2px 0px white, 2px -2px 0px white, -2px 2px 0px white'
                }}
                onClick={() => setSelectedElement(text.id)}
              >
                {text.text}
              </div>
            ))}
            
            {/* Sticker overlays */}
            {stickerElements.map(sticker => (
              <div
                key={sticker.id}
                className={`absolute cursor-pointer select-none ${
                  selectedElement === sticker.id ? 'ring-2 ring-pink-500' : ''
                }`}
                style={{
                  left: sticker.x,
                  top: sticker.y,
                  fontSize: sticker.size,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                }}
                onClick={() => setSelectedElement(sticker.id)}
              >
                {sticker.emoji}
              </div>
            ))}
          </div>
          
          {selectedElement && (
            <div className="flex gap-2 mt-4 justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => rotateElement(selectedElement)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteElement(selectedElement)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={saveDecoratedImage}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8"
            >
              デコレーション完了
            </Button>
          </div>
        </Card>
      </div>

      {/* Decoration Tools */}
      <div>
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-pink-200">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="text">
                <Type className="h-4 w-4 mr-1" />
                文字
              </TabsTrigger>
              <TabsTrigger value="stickers">
                <Sticker className="h-4 w-4 mr-1" />
                スタンプ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="text-input">テキスト</Label>
                <Input
                  id="text-input"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="テキストを入力"
                  onKeyPress={(e) => e.key === 'Enter' && addText()}
                />
              </div>
              
              <div>
                <Label>文字サイズ: {textSize[0]}px</Label>
                <Slider
                  value={textSize}
                  onValueChange={setTextSize}
                  max={48}
                  min={12}
                  step={2}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>文字色</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? 'border-black' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
              
              <Button onClick={addText} className="w-full">
                <Type className="h-4 w-4 mr-2" />
                テキスト追加
              </Button>
            </TabsContent>

            <TabsContent value="stickers">
              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {stamps.map((stamp) => (
                  <Button
                    key={stamp.id}
                    variant="outline"
                    className="aspect-square flex flex-col items-center justify-center p-2 hover:bg-pink-50"
                    onClick={() => addSticker(stamp)}
                  >
                    <span className="text-2xl mb-1">{stamp.emoji}</span>
                    <span className="text-xs">{stamp.name}</span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}