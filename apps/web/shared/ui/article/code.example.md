```tsx
<ArticleImage src="./1.0.0.diagram.png" alt="렌더링 흐름" pcWidth="1/2" moWidth="full" />
```

```ts
// 이전 버전의 이미지는 바뀌지 않았다면 그대로 참조합니다.
const version = '1.0.0';

function getImage(name: string) {
  return `./${version}.${name}.png`;
}
```
