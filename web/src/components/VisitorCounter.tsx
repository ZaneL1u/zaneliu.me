import { createSignal, onMount, Show } from 'solid-js';

export default function VisitorCounter() {
  const [count, setCount] = createSignal<number | null>(null);

  onMount(async () => {
    try {
      const res = await fetch('/api/visit');
      const data = await res.json();
      setCount(data.count);
    } catch (e) {
      console.error('Failed to load visitor count');
    }
  });

  return (
    <div class="fixed bottom-4 right-4 text-xs font-mono opacity-60 hover:opacity-100 transition-opacity select-none">
      <Show when={count() !== null}>
        <span>VISITORS: <span class="font-bold">{count()}</span></span>
      </Show>
    </div>
  );
}
