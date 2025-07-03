import { require_react } from './chunk-TDJY6Z23.js';
import { __toESM } from './chunk-PR4QN5HX.js';

// ../node_modules/.pnpm/@radix-ui+react-use-callback-ref@1.1.1_@types+react@18.3.23_react@18.3.1/node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
var React = __toESM(require_react(), 1);
function useCallbackRef(callback) {
  const callbackRef = React.useRef(callback);
  React.useEffect(() => {
    callbackRef.current = callback;
  });
  return React.useMemo(
    () =>
      (...args) =>
        callbackRef.current?.(...args),
    [],
  );
}

export { useCallbackRef };
//# sourceMappingURL=chunk-3YYFI7F7.js.map
