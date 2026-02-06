import { onMount, onCleanup } from 'solid-js';

export default function Plum() {
  let el: HTMLCanvasElement | undefined;
  const r180 = Math.PI;
  const r90 = Math.PI / 2;
  const r15 = Math.PI / 12;
  const color = '#88888825';
  
  const { random } = Math;
  const size = { width: window.innerWidth, height: window.innerHeight };
  
  let start = () => {};
  let stopped = false;

  const init = () => {
    const canvas = el!;
    const ctx = canvas.getContext('2d')!;
    const width = (canvas.width = size.width);
    const height = (canvas.height = size.height);
    
    ctx.scale(1, 1);
    
    const steps: (() => void)[] = [];
    const prevSteps: (() => void)[] = [];
    
    const step = (x: number, y: number, rad: number) => {
      const length = random() * 6;
      const counter = random() < 0.5; // Branch direction chance
      
      const x2 = x + length * Math.cos(rad);
      const y2 = y + length * Math.sin(rad);
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.stroke();
      
      const rad1 = rad + random() * r15;
      const rad2 = rad - random() * r15;
      
      // Boundary check
      if (x2 < -100 || x2 > width + 100 || y2 < -100 || y2 > height + 100) return;
      
      const rate = 50; // Chance to continue or branch
      
      if (random() < 0.5) { // Continue
        steps.push(() => step(x2, y2, rad));
      } else { // Branch
         if (random() < 0.1) return; // Die
         steps.push(() => step(x2, y2, rad1));
         steps.push(() => step(x2, y2, rad2));
      }
    };
    
    let lastTime = performance.now();
    const interval = 1000 / 40; // 40fps
    
    let controls: any;
    
    const frame = () => {
      if (stopped) return;
      if (performance.now() - lastTime < interval) {
        controls = requestAnimationFrame(frame);
        return;
      }
      
      prevSteps.length = 0;
      prevSteps.push(...steps);
      steps.length = 0;
      
      if (prevSteps.length === 0) {
        // stopped = true;
        // Don't stop loop completely, just wait
      }
      
      prevSteps.forEach((i) => i());
      
      // Cleanup chance
      if (steps.length > 200) steps.length = 200; // Limit complexity
      
      lastTime = performance.now();
      controls = requestAnimationFrame(frame);
    };
    
    start = () => {
      ctx.clearRect(0, 0, width, height);
      steps.length = 0;
      
      // Start points: Left, Right, Bottom
      // More probability on edges
      if (random() < 0.5) step(0, random() * height, 0); // Left
      if (random() < 0.5) step(width, random() * height, r180); // Right
      if (random() < 0.8) step(random() * width, height, -r90); // Bottom
      
      frame();
    };
    
    start();
  };

  onMount(() => {
    init();
    window.addEventListener('resize', () => {
      size.width = window.innerWidth;
      size.height = window.innerHeight;
      start();
    });
  });
  
  onCleanup(() => {
    stopped = true;
  });

  return (
    <div 
      class="fixed top-0 bottom-0 left-0 right-0 pointer-events-none z-[-1]" 
      style={{ "mask-image": "radial-gradient(circle, transparent, black);", "-webkit-mask-image": "radial-gradient(circle, transparent, black);" }}
    >
      <canvas ref={el} width="400" height="400" />
    </div>
  );
}
