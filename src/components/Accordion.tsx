'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { chapters } from '@/data/chapters';
import { createLenis, destroyLenis, panelWidth, ACTIVE_VW, COLLAPSED_VW, DWELL, N_CHAPTERS } from '@/lib/animation';
import Panel from '@/components/Panel';
import TopBar from '@/components/TopBar';
import type Lenis from '@studio-freight/lenis';

const SCROLL_PER_CHAPTER = 600;

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export default function Accordion() {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [topBarChapter, setTopBarChapter] = useState(chapters[0]);

  useEffect(() => {
    const totalScroll = SCROLL_PER_CHAPTER * (N_CHAPTERS - 1);

    const driver = document.getElementById('scroll-driver');
    if (driver) driver.style.height = `${totalScroll + window.innerHeight}px`;

    // Grab the `.content` div inside each panel after mount
    const contentEls = panelRefs.current.map(el => el?.querySelector<HTMLElement>('.content') ?? null);

    // Initial widths + content visibility
    panelRefs.current.forEach((el, i) => {
      if (el) gsap.set(el, { width: i === 0 ? `${ACTIVE_VW}vw` : `${COLLAPSED_VW}vw` });
    });
    contentEls.forEach((el, i) => {
      if (el) gsap.set(el, { opacity: i === 0 ? 1 : 0, pointerEvents: i === 0 ? 'auto' : 'none' });
    });

    let lastActiveIdx = 0;

    function onScroll({ scroll }: { scroll: number }) {
      const rawT = scroll / SCROLL_PER_CHAPTER;
      const chapter = Math.floor(rawT);
      const within = rawT - chapter;
      const clampedChapter = Math.max(0, Math.min(N_CHAPTERS - 1, chapter));

      let fromIdx = clampedChapter;
      let tNorm = 0;

      if (within > DWELL && chapter < N_CHAPTERS - 1) {
        const snapProgress = (within - DWELL) / (1 - DWELL);
        tNorm = easeOutQuart(snapProgress);
        fromIdx = chapter;
      }

      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const w = panelWidth(i, fromIdx, tNorm);
        gsap.set(el, { width: `${w}vw` });
      });

      const displayIdx = tNorm > 0.5 ? Math.min(fromIdx + 1, N_CHAPTERS - 1) : fromIdx;

      if (displayIdx !== lastActiveIdx) {
        const oldEl = contentEls[lastActiveIdx];
        const newEl = contentEls[displayIdx];
        if (oldEl) gsap.to(oldEl, { opacity: 0, pointerEvents: 'none', duration: 0.18 });
        if (newEl) gsap.to(newEl, { opacity: 1, pointerEvents: 'auto', duration: 0.18 });
        lastActiveIdx = displayIdx;
        setActiveIdx(displayIdx);
        setTopBarChapter(chapters[displayIdx]);
      }

      if (progressRef.current) {
        gsap.set(progressRef.current, { width: `${Math.min(100, (scroll / totalScroll) * 100)}%` });
      }
    }

    const lenis = createLenis();
    lenisRef.current = lenis;
    lenis.on('scroll', onScroll);

    return () => {
      lenis.off('scroll', onScroll);
      if (lenisRef.current) destroyLenis(lenisRef.current);
    };
  }, []);

  return (
    <>
      <div id="scroll-driver" style={{ position: 'absolute', top: 0, left: 0, width: '1px', pointerEvents: 'none' }} />

      <TopBar
        chapterNumber={topBarChapter.number}
        chapterName={topBarChapter.name}
        total={N_CHAPTERS}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        {chapters.map((chapter, i) => (
          <div
            key={chapter.id}
            ref={el => { panelRefs.current[i] = el; }}
            style={{ height: '100%', flexShrink: 0, position: 'relative', overflow: 'hidden', willChange: 'width' }}
          >
            <Panel chapter={chapter} isActive={activeIdx === i} />
          </div>
        ))}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, height: '2px', background: 'rgba(252,163,17,0.12)', width: '100%', zIndex: 200 }}>
        <div ref={progressRef} style={{ height: '100%', background: 'var(--color-amber)', width: '0%' }} />
      </div>
    </>
  );
}
