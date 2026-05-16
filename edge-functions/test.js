export default function onRequest(context) {
  return new Response('Hello from Edge Function!', {
    headers: { 'Content-Type': 'text/plain' }
  });
}
