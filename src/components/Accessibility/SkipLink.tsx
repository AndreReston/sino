import { useEffect, useState } from 'react';

export default function SkipLink() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setVisible(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <a
      href="#main-content"
      className={`fixed top-4 left-4 z-[99999] px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg shadow-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-white ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setVisible(false)}
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}
