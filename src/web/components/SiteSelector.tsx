/**
 * AMMP Site Selector Component
 * Dropdown for selecting individual site or portfolio view
 */

import React from 'react';

interface Site {
  id: string;
  name: string;
  capacity_kw?: number;
  status?: string;
}

interface SiteSelectorProps {
  sites: Site[];
  selectedSiteId: string | null;
  onSiteChange: (siteId: string | null) => void;
}

export function SiteSelector({ sites, selectedSiteId, onSiteChange }: SiteSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSiteChange(value === 'portfolio' ? null : value);
  };

  const selectedSite = selectedSiteId
    ? sites.find(s => s.id === selectedSiteId)
    : null;

  const totalCapacity = sites.reduce((sum, site) => sum + (site.capacity_kw || 0), 0);

  return (
    <div className="site-selector">
      <select
        value={selectedSiteId || 'portfolio'}
        onChange={handleChange}
        className="site-select"
      >
        <option value="portfolio">
          📊 All Sites (Portfolio) - {totalCapacity.toFixed(0)} kW
        </option>
        <optgroup label="Individual Sites">
          {sites.map(site => (
            <option key={site.id} value={site.id}>
              {site.name}
              {site.capacity_kw && ` - ${site.capacity_kw} kW`}
              {site.status && site.status !== 'active' && ` (${site.status})`}
            </option>
          ))}
        </optgroup>
      </select>

      {selectedSite && (
        <div className="site-info">
          <span className="site-name">{selectedSite.name}</span>
          {selectedSite.capacity_kw && (
            <span className="site-capacity">{selectedSite.capacity_kw} kW</span>
          )}
          {selectedSite.status && (
            <span className={`site-status status-${selectedSite.status}`}>
              {selectedSite.status === 'active' ? '✅' : '⚠️'}
              {selectedSite.status}
            </span>
          )}
        </div>
      )}

      {!selectedSiteId && sites.length > 1 && (
        <div className="portfolio-info">
          <span className="portfolio-label">
            📊 Viewing {sites.length} sites
          </span>
          <span className="portfolio-capacity">
            Total: {totalCapacity.toFixed(0)} kW
          </span>
        </div>
      )}
    </div>
  );
}
