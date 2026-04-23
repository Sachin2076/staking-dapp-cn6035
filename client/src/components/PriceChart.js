/**
 * PriceChart.js
 * ─────────────
 * SVG-based ETH price chart using 7-day history from CoinGecko.
 * Pure display component — no side effects.
 */

import React from "react";

const CHART_W  = 600;
const CHART_H  = 180;
const PADDING  = 30;

/**
 * Build an SVG path string from an array of [timestamp, price] pairs.
 */
function buildPath(priceHistory) {
  if (priceHistory.length < 2) return "";

  const prices   = priceHistory.map((p) => p[1]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range    = maxPrice - minPrice || 1;
  const areaW    = CHART_W - PADDING * 2;
  const areaH    = CHART_H - PADDING * 2;

  return priceHistory
    .map((p, i) => {
      const x = PADDING + (i / (priceHistory.length - 1)) * areaW;
      const y = PADDING + areaH - ((p[1] - minPrice) / range) * areaH;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function PriceChart({ ethPrice, priceHistory }) {
  const pathData = buildPath(priceHistory);

  return (
    <div
      style={{
        background: "#fff",
        border: "2px solid #e2e8f0",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2d3748", marginBottom: 4 }}>
        ETH Price
      </h3>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#667eea", marginBottom: 16 }}>
        ${ethPrice > 0 ? ethPrice.toLocaleString() : "—"}
      </div>

      {priceHistory.length > 1 ? (
        <svg
          width="100%"
          height="140"
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          style={{ display: "block" }}
          aria-label="7-day ETH price chart"
        >
          <defs>
            <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#667eea" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#667eea" stopOpacity="0"   />
            </linearGradient>
          </defs>

          {/* Filled area under line */}
          <path
            d={`${pathData} L ${CHART_W - PADDING} ${CHART_H - PADDING} L ${PADDING} ${CHART_H - PADDING} Z`}
            fill="url(#priceGradient)"
          />

          {/* Price line */}
          <path
            d={pathData}
            stroke="#667eea"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <div style={{ fontSize: 13, color: "#a0aec0", textAlign: "center", padding: 20 }}>
          Loading chart…
        </div>
      )}

      <div style={{ fontSize: 12, color: "#718096", marginTop: 8, textAlign: "center" }}>
        Last 7 days · Source: CoinGecko
      </div>
    </div>
  );
}
