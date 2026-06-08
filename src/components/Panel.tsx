import type { Chapter } from '@/data/chapters';
import Spine from '@/components/Spine';
import Hero from '@/components/compositions/Hero';
import Bilateral from '@/components/compositions/Bilateral';
import ReadingRoom from '@/components/compositions/ReadingRoom';
import OffsetTitle from '@/components/compositions/OffsetTitle';
import MetricLead from '@/components/compositions/MetricLead';
import About from '@/components/compositions/About';
import Cta from '@/components/compositions/Cta';
import { colors } from '@/lib/theme';

const BG: Record<string, string> = {
  cream: colors.cream,
  black: colors.ink,
  navy:  colors.navy,
};

function Composition({ chapter }: { chapter: Chapter }) {
  switch (chapter.composition) {
    case 'hero':        return <Hero chapter={chapter} />;
    case 'bilateral':   return <Bilateral chapter={chapter} />;
    case 'reading-room': return <ReadingRoom chapter={chapter} />;
    case 'offset-title': return <OffsetTitle chapter={chapter} />;
    case 'metric-lead': return <MetricLead chapter={chapter} />;
    case 'about':       return <About chapter={chapter} />;
    case 'cta':         return <Cta chapter={chapter} />;
  }
}

interface PanelProps {
  chapter: Chapter;
  isActive: boolean;
}

export default function Panel({ chapter, isActive }: PanelProps) {
  return (
    <div
      data-panel={chapter.id}
      className="panel"
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        flexShrink: 0,
        background: BG[chapter.bg],
        color: chapter.bg === 'cream' ? colors.ink : colors.cream,
      }}
    >
      <Spine chapter={chapter} isActive={isActive} />
      <Composition chapter={chapter} />
    </div>
  );
}
