"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Search as SearchIcon, X, SadFace } from "@/components/icons";
import { useSearchQuery } from "@/features/search/searchApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { addRecentSearch, clearRecentSearches, useRecentSearches } from "@/lib/utils/recentSearches";
import VendorCard from "@/components/VendorCard";
import { ErrorState } from "@/components/feedback/ErrorState";

function SearchContent() {
  const router = useRouter();
  const initialQ = useSearchParams().get("q") ?? "";
  const [inputValue, setInputValue] = useState(initialQ);
  const recent = useRecentSearches();
  const debounced = useDebouncedValue(inputValue, 300);
  const hasSyncedInitial = useRef(false);

  const { data: results, isFetching, error, refetch } = useSearchQuery(debounced, {
    skip: !debounced.trim(),
  });

  // Keep the URL shareable/refreshable without spamming browser history.
  useEffect(() => {
    if (!hasSyncedInitial.current) {
      hasSyncedInitial.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (debounced.trim()) params.set("q", debounced.trim());
    const query = params.toString();
    router.replace(query ? `/search?${query}` : "/search", { scroll: false });
  }, [debounced, router]);

  const commitSearch = (term: string) => {
    if (!term.trim()) return;
    addRecentSearch(term);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitSearch(inputValue);
  };

  const handleChipClick = (term: string) => {
    setInputValue(term);
    commitSearch(term);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
  };

  const query = debounced.trim();

  return (
    <main className="vp-root">
      <form onSubmit={handleSubmit} role="search">
        <div className="vp-search-wrap" style={{ maxWidth: 560, margin: "0 auto 32px" }}>
          <SearchIcon size={16} className="vp-search-icon" aria-hidden />
          <input
            type="text"
            className="vp-search-input"
            placeholder="Search restaurants or cuisines…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
            aria-label="Search"
          />
          {inputValue && (
            <button type="button" className="vp-search-clear" onClick={() => setInputValue("")} aria-label="Clear">
              <X size={13} aria-hidden />
            </button>
          )}
        </div>
      </form>

      {!query ? (
        recent.length > 0 ? (
          <section className="vp-section">
            <div className="vp-section-row">
              <h2 className="vp-section-title">Recent searches</h2>
              <button type="button" className="vp-filter-reset" onClick={handleClearRecent}>
                Clear
              </button>
            </div>
            <div className="search-recent__chips">
              {recent.map((term) => (
                <button key={term} type="button" className="search-recent__chip" onClick={() => handleChipClick(term)}>
                  <Clock size={13} aria-hidden />
                  {term}
                </button>
              ))}
            </div>
          </section>
        ) : (
          <div className="vp-empty">
            <div className="vp-empty-icon"><SearchIcon size={32} aria-hidden /></div>
            <p className="vp-empty-title">Search TummyTime</p>
            <p className="vp-empty-sub">Find restaurants and cuisines near you.</p>
          </div>
        )
      ) : isFetching ? (
        <div className="vp-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <VendorCard key={i} skeleton />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : results && results.length > 0 ? (
        <section className="vp-section">
          <div className="vp-section-row">
            <h2 className="vp-section-title">Results for &ldquo;{query}&rdquo;</h2>
            <span className="vp-count">{results.length} found</span>
          </div>
          <div className="vp-grid">
            {results.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        </section>
      ) : (
        <div className="vp-empty">
          <div className="vp-empty-icon"><SadFace size={32} aria-hidden /></div>
          <p className="vp-empty-title">No results for &ldquo;{query}&rdquo;</p>
          <p className="vp-empty-sub">Try a different search term.</p>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="vp-root" />}>
      <SearchContent />
    </Suspense>
  );
}
