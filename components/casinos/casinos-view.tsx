'use client'

import { useMemo, useState } from 'react'
import { CasinosCompareTable } from '@/components/casinos/casinos-compare-table'
import { CasinosGrid } from '@/components/casinos/casinos-grid'
import {
  CasinosToolbar,
  type CasinoViewMode
} from '@/components/casinos/casinos-toolbar'
import {
  SeoPostsDetails,
  SeoProseDetails,
  type SeoPostItem
} from '@/components/seo/seo-details'
import type { GridSortKey, TableCategoryId } from '@/lib/casinos/categories'
import type { CasinosBundle, RatingsDetailMap } from '@/lib/casinos/data'
import { useCasinoOverviewData } from '@/lib/casinos/use-casino-overview-data'

export type CasinosViewProps = {
  initialBundle?: CasinosBundle | null
  initialRatingsMap?: RatingsDetailMap
  seoHeading?: string
  seoHtml?: string
  seoPosts?: SeoPostItem[]
  seoPostsHeading?: string
}

/** Port of reference `CasinosView` (+ page-level SeoProseDetails below list). */
export function CasinosView ({
  initialBundle = null,
  initialRatingsMap = {},
  seoHeading,
  seoHtml,
  seoPosts,
  seoPostsHeading = 'Related posts'
}: CasinosViewProps) {
  const [viewMode, setViewMode] = useState<CasinoViewMode>('grid')
  const [gridSortKey, setGridSortKey] = useState<GridSortKey>('fgRating')
  const [tableTab, setTableTab] = useState<TableCategoryId>('basicInfo')
  const [selectedCasinos, setSelectedCasinos] = useState<Set<string> | null>(
    null
  )

  const data = useCasinoOverviewData({
    defaultSortKey: 'fgRating',
    defaultSortDirection: 'desc',
    initialBundle,
    initialRatingsMap
  })

  const visibleCasinos = useMemo(() => {
    if (!selectedCasinos) return data.casinos
    return data.casinos.filter(c => selectedCasinos.has(c.name))
  }, [data.casinos, selectedCasinos])

  const casinoOptions = useMemo(
    () =>
      [...data.casinos]
        .sort((a, b) => b.fgRating - a.fgRating)
        .map(c => ({ value: c.name, label: c.name })),
    [data.casinos]
  )

  return (
    <main className='flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6'>
      <CasinosToolbar
        searchValue={data.searchValue}
        onSearchChange={data.setSearchValue}
        gridSortKey={gridSortKey}
        onGridSortChange={key => {
          setGridSortKey(key)
          data.setSortKey(key)
          data.setSortDirection('desc')
        }}
        viewMode={viewMode}
        onViewModeChange={mode => {
          setViewMode(mode)
          data.setSortKey(mode === 'grid' ? gridSortKey : 'fgRating')
          data.setSortDirection('desc')
        }}
        casinoOptions={casinoOptions}
        selectedCasinos={selectedCasinos}
        onSelectedCasinosChange={setSelectedCasinos}
        tableTab={tableTab}
        onTableTabChange={setTableTab}
      />

      {viewMode === 'grid' ? (
        <CasinosGrid casinos={visibleCasinos} loading={data.loading} />
      ) : (
        <CasinosCompareTable
          casinos={visibleCasinos}
          loading={data.loading}
          sortKey={data.sortKey}
          sortDirection={data.sortDirection}
          onSort={data.handleSort}
          tableTab={tableTab}
          onTableTabChange={setTableTab}
        />
      )}

      <section className='max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 mt-2 mb-6 lg:mb-10'>
        {seoHeading && seoHtml ? (
          <SeoProseDetails heading={seoHeading} html={seoHtml} />
        ) : null}

        {seoPosts && seoPosts.length > 0 ? (
          <SeoPostsDetails heading={seoPostsHeading} items={seoPosts} />
        ) : null}
      </section>
    </main>
  )
}
