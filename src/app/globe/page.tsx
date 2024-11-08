"use client";

import Globe from '../components/Globe';

export default function GlobePage() {
  return (
    <main
      style={{
        height: '100vh',
        backgroundColor: '#000',
        overflow: 'hidden', // Prevent scrolling in case of large canvas
        margin: 0, // Ensure no body margin if the canvas fills the screen
      }}
    >
      <Globe />
    </main>
  );
}
