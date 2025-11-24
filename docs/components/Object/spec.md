# オブジェクト
- 種類: オブジェクト
- 機能: 図形またはSVGを表示する。
- 表示:
> 指定された大きさや色で図形を表示。
> パスを指定されたらSVG画像を表示。
> ![オブジェクト例](Object-example.png)
- 属性:
  - type
> オブジェクトの種類(`rect`, `circle`, `polygon`, `svg`, `component-background`など)を指定。
> 
> ```xml
> <Object type="svg" src="heart.svg"/>
> ```

- background-color
> `type`属性に`svg`が指定された場合を除き、オブジェクトの塗りつぶす色を指定。
> 
> ```xml
> <Object type="rect" background-color="#FF3333"/>
> ```

- border-color
> `type`属性に`svg`が指定された場合を除き、オブジェクトの縁の色を指定。
> 
> ```xml
> <Object type="rect" border-color="#3333FF"/>
> ```

- border-width
> `type`属性に`svg`が指定された場合を除き、オブジェクトの縁の太さを指定。
> 
> ```xml
> <Object type="circle" border-width="3px"/>
> ```

- height
> `type`属性に`rect`または`component-background`が指定された場合、オブジェクトの高さを指定。
> 
> ```xml
> <Object type="rect" height="20px"/>
> ```

- width
> `type`属性に`rect`または`component-background`が指定された場合、オブジェクトの横幅を指定。
> 
> ```xml
> <Object type="rect" width="50%"/>
> ```

- radius
> `type`属性に`circle`が指定された場合、オブジェクトの半径を指定。
> 
> ```xml
> <Object type="circle" radius="10em"/>
> ```

- points
> `type`属性に`polygon`が指定された場合、オブジェクトの描画する図形の点を指定。
> 
> ```xml
> <Object type="polygon" points="[20, 30], [25, 30], [40, 50]"/>
> ```

- src
> `type`属性に`svg`が指定された場合、オブジェクトのソース(パス)を指定。
> 
> ```xml
> <Object type="svg" src="star.svg"/>
> ```

## コンポーネントの背景
- 属性: `component-background`
- 表示:
> 背景がピンク、縁が白で、丸みを帯びた四角形を表示。  
> ![コンポーネントの背景](component-background.png)