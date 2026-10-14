import React from 'react';

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  isDark = false
}) {
  return (
    <div className={`section-header ${align === 'left' ? 'text-left' : ''}`}>
      {eyebrow && (
        <span className={`section-eyebrow ${isDark ? 'text-gradient' : ''}`}>
          {eyebrow}
        </span>
      )}
      <h2 className="section-title">
        {title}
      </h2>
      {subtitle && (
        <p className="section-subtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
}
