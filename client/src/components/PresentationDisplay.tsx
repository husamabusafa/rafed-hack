import { useState } from 'react';
import type { Slide } from '../tools/presentationTools';

interface PresentationDisplayProps {
  slides: Slide[];
}

export function PresentationDisplay({ slides }: PresentationDisplayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (slides.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          background: 'linear-gradient(135deg, #1a1b1e 0%, #17181c 100%)',
          border: '2px dashed #2A2C33',
          borderRadius: '16px',
          padding: '48px 24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '550px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '24px',
              borderRadius: '20px',
              background:
                'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              marginBottom: '28px',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="72"
              height="72"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366F1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 3v18" />
              <path d="M3 7.5h4" />
              <path d="M3 12h18" />
              <path d="M3 16.5h4" />
              <path d="M17 3v18" />
              <path d="M17 7.5h4" />
              <path d="M17 16.5h4" />
            </svg>
          </div>
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: '28px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            No Presentation Yet
          </h3>
          <p
            style={{
              margin: '0 0 32px 0',
              fontSize: '15px',
              color: '#999',
              lineHeight: '1.7',
            }}
          >
            Ask the AI agent to create presentation slides with images and titles.
            The agent will generate and display them here.
          </p>
          <div
            style={{
              padding: '20px 24px',
              background: 'rgba(99, 102, 241, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#6366F1',
                marginBottom: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4" />
                <path d="m12 18 4 4m-4-4-4 4m4-4V2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              Try asking:
            </div>
            <div style={{ fontSize: '14px', color: '#AAA', lineHeight: '2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>"Create a presentation about our data"</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>"Generate presentation slides with charts"</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>"Show me the slides"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1a1b1e 0%, #17181c 100%)',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #2A2C33',
      }}
    >
      {/* Slide Display */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#0D0E11',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '24px',
          border: '1px solid #2A2C33',
        }}
      >
        <img
          src={currentSlideData.image}
          alt={currentSlideData.title}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '500px',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        
        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={goToPrevSlide}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.8)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={goToNextSlide}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.8)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Slide Title */}
      <h2
        style={{
          margin: '0 0 20px 0',
          fontSize: '24px',
          fontWeight: 600,
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        {currentSlideData.title}
      </h2>

      {/* Slide Counter and Thumbnails */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#AAA',
            marginBottom: '16px',
          }}
        >
          Slide {currentSlide + 1} of {slides.length}
        </div>

        {/* Thumbnail Navigation */}
        {slides.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '16px',
            }}
          >
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                style={{
                  background: index === currentSlide ? '#6366F1' : 'rgba(99, 102, 241, 0.2)',
                  border: index === currentSlide ? '2px solid #8B5CF6' : '2px solid transparent',
                  borderRadius: '8px',
                  padding: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '80px',
                  height: '60px',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (index !== currentSlide) {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentSlide) {
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                  }
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
