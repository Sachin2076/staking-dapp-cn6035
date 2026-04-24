/**
 * NotificationBanner.js — mobile-friendly compact version
 */
import React from "react";

export default function NotificationBanner({ message, onClose, onLearnMore }) {
  if (!message) return null;

  return (
    <>
      <style>{`
        .notif-banner {
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          z-index: 150;
          background: #fff3cd;
          border-bottom: 3px solid #ffc107;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .notif-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          flex-wrap: nowrap;
        }
        .notif-text {
          margin: 0;
          font-size: 13px;
          color: #856404;
          font-weight: 500;
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-learn {
          background: #ffc107;
          color: #856404;
          border: none;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
          font-family: inherit;
          flex-shrink: 0;
        }
        .notif-close {
          background: transparent;
          border: none;
          font-size: 22px;
          cursor: pointer;
          color: #856404;
          padding: 0 4px;
          line-height: 1;
          font-family: inherit;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .notif-text {
            font-size: 12px;
          }
          .notif-learn {
            font-size: 11px;
            padding: 5px 8px;
          }
        }
      `}</style>

      <div className="notif-banner">
        <div className="notif-inner">
          <p className="notif-text">
            ⚠️ {message}
          </p>
          <button className="notif-learn" onClick={onLearnMore}>
            Learn more →
          </button>
          <button className="notif-close" onClick={onClose}>
            ×
          </button>
        </div>
      </div>
    </>
  );
}