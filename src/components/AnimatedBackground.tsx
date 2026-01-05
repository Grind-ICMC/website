import { useCallback, useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

const algorithms = [
  "binary_search(arr, target)",
  "dijkstra(graph, src)",
  "kmp_pattern(text, pattern)",
  "union_find(parent, x)",
  "topological_sort(graph)",
  "kadane(nums)",
  "two_pointers(arr)",
  "sliding_window(s, k)",
  "segment_tree.query(l, r)",
  "bfs(graph, start)",
  "dfs(node, visited)",
  "dp[i] = max(dp[i-1], dp[i-2] + v)",
];

// Generate a larger set of snippets for better coverage
const generateSnippets = (count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const text = algorithms[i % algorithms.length];
    // Randomize start position across the screen width (5% to 95%)
    const startX = Math.random() * 90 + 5;
    // Randomize duration between 15s and 25s for variety
    const duration = Math.random() * 10 + 15;
    // Negative delay ensures elements are already visible and scattered at start
    // We use a range up to the duration to cover the full vertical space
    const delay = -(Math.random() * duration);
    
    return { text, startX, duration, delay };
  });
};

const CodeSnippet = ({ text, startX, duration, delay }: { text: string; startX: number; duration: number; delay: number }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;
    setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="absolute code-font text-primary/15 text-sm whitespace-nowrap pointer-events-none select-none code-snippet-float"
      style={{ 
        left: `${startX}%`, 
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s` 
      }}
    >
      {text}
    </div>
  );
};

const AnimatedBackground = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [init, setInit] = useState(false);

  // Memoize snippets to prevent regeneration on re-renders
  const snippets = useMemo(() => generateSnippets(20), []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesConfig: ISourceOptions = {
    fullScreen: false,
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    particles: {
      color: { value: "#00d4ff" },
      links: { color: "#00d4ff", distance: 150, enable: true, opacity: 0.15, width: 1 },
      move: { enable: !prefersReducedMotion, outModes: { default: "bounce" }, speed: 0.5 },
      number: { density: { enable: true, width: 1920, height: 1080 }, value: 60 },
      opacity: { value: 0.3 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-glow-secondary/5 rounded-full blur-[120px]" />

      {init && <Particles id="tsparticles" options={particlesConfig} className="absolute inset-0" />}

      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden">
          {snippets.map((snippet, i) => <CodeSnippet key={i} {...snippet} />)}
        </div>
      )}

      <div className="absolute inset-0 bg-background/30" />
    </div>
  );
};

export default AnimatedBackground;
