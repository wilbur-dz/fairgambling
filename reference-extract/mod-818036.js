818036,
  e => {
    'use strict'
    var t = e.i(848277),
      a = e.i(330668),
      s = e.i(382501),
      r = e.i(816506),
      l = e.i(696086),
      n = e.i(232890),
      i = e.i(531261),
      o = e.i(843305),
      c = e.i(728901),
      d = e.i(337163),
      m = e.i(547023),
      x = e.i(81996),
      h = e.i(700327),
      u = e.i(248363),
      p = e.i(44410),
      g = e.i(584840),
      f = e.i(619032),
      b = e.i(450216),
      w = e.i(605252),
      k = e.i(976928),
      v = e.i(921265),
      j = e.i(356515),
      N = e.i(921110),
      y = e.i(601704),
      C = e.i(616809)
    let S = e =>
      new Promise(t => {
        let a = new window.Image(),
          s = setTimeout(() => {
            ;(a.src = ''), t(null)
          }, 4e3)
        ;(a.onload = () => {
          clearTimeout(s), t({ width: a.naturalWidth, height: a.naturalHeight })
        }),
          (a.onerror = () => {
            clearTimeout(s), t(null)
          }),
          (a.src = e)
      })
    async function M (e, t = 4, a = S) {
      let s = e.slice(0, 12),
        r = await Promise.all(
          s.map(async e => (e.coverImageUrl ? a(e.coverImageUrl) : null))
        ),
        l = s.filter((e, t) => {
          var a, s
          let l = r[t]
          return (
            null !== l &&
            ((a = l.width), (s = l.height), a >= 1280 && s > 0 && a / s >= 1.6)
          )
        })
      return (l.length > 0 ? l : e).slice(0, t)
    }
    var $ = e.i(718192),
      L = e.i(125673),
      z = e.i(56199),
      A = e.i(442414),
      I = e.i(681265),
      V = e.i(791170),
      _ = e.i(957136)
    let F = {
        'market-value': {
          label: 'Market Value',
          unit: 'usd',
          sub: 'Estimated market value'
        },
        payment: {
          label: 'Est. Monthly Payment',
          unit: 'usd-month',
          sub: 'Estimated casino payment per month'
        },
        followers: { label: 'Followers', unit: 'count', sub: 'Kick followers' },
        'avg-viewers': {
          label: 'Average Viewers',
          unit: 'count',
          sub: 'Average concurrent viewers · last 30 days'
        },
        'view-hours': {
          label: 'View Hours',
          unit: 'hours',
          sub: 'Total hours watched · last 30 days'
        },
        'stream-hours': {
          label: 'Stream Hours',
          unit: 'hours',
          sub: 'Hours live on air · last 30 days'
        },
        leaderboard: {
          label: 'Leaderboard Prize',
          unit: 'usd-month',
          sub: 'Monthly leaderboard prize pool'
        }
      },
      E = [
        'market-value',
        'payment',
        'followers',
        'avg-viewers',
        'view-hours',
        'stream-hours',
        'leaderboard'
      ].map(e => ({ value: e, label: F[e].label }))
    function P ({ streamers: e, casinoOptions: s, onClose: r }) {
      let [l, n] = (0, a.useState)('market-value'),
        [i, o] = (0, a.useState)(null),
        [c, d] = (0, a.useState)(null),
        { canCopyImage: m } = (0, _.useShareCapabilities)(),
        x = (0, a.useRef)(null),
        h = (0, a.useMemo)(
          () => (i ? [...i].map(e => e.toLowerCase()).sort() : []),
          [i]
        ),
        p = null !== i,
        b = (0, a.useMemo)(() => {
          let t = new Set(h)
          return e
            .filter(
              e => !p || t.has((e.currentCasino ?? '').trim().toLowerCase())
            )
            .map(e => ({
              s: e,
              v: (function (e, t) {
                switch (t) {
                  case 'market-value':
                    return (0, k.mvOf)(e)
                  case 'payment':
                    return (0, k.parseMoney)(e.estMonthlyPayment)
                  case 'followers':
                    return e.followers || null
                  case 'avg-viewers':
                    return e.avgViewers30d || null
                  case 'view-hours':
                    return e.hoursWatched30d || null
                  case 'stream-hours':
                    return e.streamHours30d || null
                  case 'leaderboard':
                    return e.monthlyLeaderboardUsd || null
                }
              })(e, l)
            }))
            .filter(e => null != e.v && e.v > 0)
            .sort((e, t) => t.v - e.v)
            .map(({ s: e }) => ({
              value: e.username.trim().toLowerCase(),
              label: e.username,
              avatar: e.avatarUrl ?? null
            }))
        }, [e, h, p, l]),
        v = (0, a.useMemo)(() => new Map(b.map(e => [e.value, e.avatar])), [b]),
        j = (0, a.useMemo)(() => b.slice(0, 10).map(e => e.value), [b]),
        N = `${l}|${h.join(',')}`,
        y = (0, a.useMemo)(
          () => (c && c.scope === N ? c.set : new Set(j)),
          [c, N, j]
        ),
        C = (0, a.useCallback)(e => d({ scope: N, set: e }), [N]),
        S = [...j].sort().join(','),
        { list: M, auto: $ } = (0, a.useMemo)(() => {
          let e = new Set(b.map(e => e.value)),
            t = [...y].filter(t => e.has(t)).sort()
          return 0 === t.length || t.length > 10
            ? { list: [...j].sort(), auto: !0 }
            : { list: t, auto: t.join(',') === S }
        }, [y, b, j, S]),
        F = (0, a.useMemo)(() => ($ ? [] : M), [$, M]),
        T = p && 1 === h.length ? h[0] : null,
        U = y.size >= 10,
        B = b.map(e => ({
          value: e.value,
          label: e.label,
          ...(U && !y.has(e.value) ? { disabled: !0 } : {})
        })),
        D = [l, T ?? '', (p || !$ ? M : []).join(','), $ ? '1' : '0'].join('|'),
        R = (0, a.useCallback)(e => {
          let [t, a, s, r] = e.split('|')
          return (function (e, t, a, s) {
            let r = `/api/og/streamers?metric=${e}`
            for (let e of (t && (r += `&casino=${encodeURIComponent(t)}`), a))
              r += `&streamer=${encodeURIComponent(e)}`
            return s && a.length && (r += '&auto=1'), r
          })(t, a || null, s ? s.split(',') : [], '1' === r)
        }, []),
        H = (0, a.useCallback)(
          e => ({
            content: 'streamers-top',
            metric: e.split('|')[0],
            picked: e.split('|')[2] ? e.split('|')[2].split(',').length : 0
          }),
          []
        ),
        {
          images: O,
          imageFailed: W,
          fetchImage: K
        } = (0, _.useSnapshotImages)(R, H)
      ;(0, a.useEffect)(() => {
        ;(0, V.track)('quick_share_preview_opened', { mode: 'streamers-top' })
      }, []),
        (0, a.useEffect)(() => {
          K(D)
        }, [D, K]),
        (0, _.useDialogFocusTrap)(x)
      let G = `${window.location.origin}/streamers`,
        q = (0, a.useCallback)(
          () => ({ content: 'streamers-top', metric: l, picked: F.length }),
          [l, F]
        ),
        X = (0, a.useCallback)(
          () =>
            `fairgambling-${
              F.length ? `${F.length}-streamers` : 'top10-streamers'
            }-${l}${h.length ? `-${h.join('-')}` : ''}.png`,
          [l, h, F]
        ),
        J = s.map(e => ({ value: e, label: e })),
        Q = O[D],
        Y = (0, _.useShareActions)({
          image: Q,
          text: '',
          shareLink: G,
          fileName: X,
          nativeFileName: X,
          eventProps: q
        })
      return (0, t.jsx)(I.Modal, {
        open: !0,
        onClose: r,
        title: 'Share',
        padded: !1,
        theme: 'auto',
        className: 'max-w-[560px] p-4 md:p-5',
        children: (0, t.jsxs)('div', {
          ref: x,
          className: 'flex flex-col gap-3 md:gap-4',
          children: [
            (0, t.jsxs)('div', {
              className: 'flex flex-col gap-2',
              children: [
                (0, t.jsxs)('div', {
                  className:
                    'grid grid-cols-1 gap-2 sm:grid-cols-2 [&_[aria-haspopup=listbox]]:h-9',
                  children: [
                    (0, t.jsx)(f.Dropdown, {
                      block: !0,
                      theme: 'auto',
                      options: E,
                      value: l,
                      onChange: e => {
                        Y.clearActionFeedback(), n(e)
                      }
                    }),
                    (0, t.jsx)(f.Dropdown, {
                      multiple: !0,
                      block: !0,
                      searchable: !0,
                      allPreviewIcons: !0,
                      theme: 'auto',
                      options: J,
                      value: i,
                      onChange: e => {
                        Y.clearActionFeedback(), o(e)
                      },
                      allLabel: 'All Casinos',
                      noun: 'Casino',
                      renderIcon: (e, a) =>
                        (0, t.jsx)(w.AnalyticsCasinoIcon, {
                          casinoName: e,
                          size: a,
                          theme: 'auto'
                        })
                    })
                  ]
                }),
                (0, t.jsx)('div', {
                  className: '[&_[aria-haspopup=listbox]]:h-9',
                  children: (0, t.jsx)(f.Dropdown, {
                    multiple: !0,
                    block: !0,
                    searchable: !0,
                    theme: 'auto',
                    options: B,
                    value: y,
                    onChange: e => {
                      Y.clearActionFeedback(), C(e ?? new Set(j))
                    },
                    placeholder: 'Streamers',
                    noun: 'Streamer',
                    renderIcon: (e, a) => {
                      let s = v.get(e)
                      return s
                        ? (0, t.jsx)('img', {
                            src: s,
                            alt: '',
                            width: a,
                            height: a,
                            className: 'rounded-full object-cover',
                            style: { width: a, height: a }
                          })
                        : null
                    }
                  })
                })
              ]
            }),
            (0, t.jsx)('div', {
              className: 'flex flex-col gap-2',
              children: Q
                ? (0, t.jsx)('img', {
                    src: Q.url,
                    alt: 'FairGambling streamers snapshot preview',
                    className:
                      'mx-auto max-h-[min(420px,calc(85vh_-_280px))] w-auto max-w-full md:max-h-[min(460px,calc(85vh_-_280px))]'
                  })
                : W[D]
                ? (0, t.jsxs)('div', {
                    className:
                      'flex flex-col items-center gap-3 rounded-2xl border-[0.5px] border-[#2a274e]/10 bg-[#2a274e]/[0.03] px-4 py-8 text-center md:py-10 dark:border-white/10 dark:bg-white/[0.02]',
                    children: [
                      (0, t.jsx)('span', {
                        className:
                          'text-[13px] text-[#2a274e]/60 dark:text-white/60',
                        children: 'Generating this image failed.'
                      }),
                      (0, t.jsx)(g.Button, {
                        size: 'sm',
                        theme: 'auto',
                        leftIcon: (0, t.jsx)(A.RefreshCw, {}),
                        onClick: () => K(D),
                        children: 'Retry'
                      })
                    ]
                  })
                : (0, t.jsx)('div', {
                    className:
                      'h-[min(420px,calc(85vh_-_280px))] w-full animate-pulse rounded-2xl border-[0.5px] border-[#2a274e]/10 bg-[#2a274e]/[0.06] md:h-[min(460px,calc(85vh_-_280px))] dark:border-white/10 dark:bg-white/[0.04]',
                    'aria-label': 'Generating image'
                  })
            }),
            (0, t.jsxs)('div', {
              className: `grid grid-cols-1 gap-2 ${
                m ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
              } [&>button]:w-full [&>button]:justify-center`,
              children: [
                (0, t.jsx)(g.Button, {
                  size: 'sm',
                  variant: 'primary',
                  leftIcon: (0, t.jsx)(u.Share2, {}),
                  onClick: Y.handleCopyLink,
                  'aria-label': 'Share (copies the page link)',
                  children: Y.copiedLink ? 'Link copied!' : 'Share'
                }),
                (0, t.jsx)(g.Button, {
                  size: 'sm',
                  variant: 'primary',
                  leftIcon: (0, t.jsx)(z.Download, {}),
                  onClick: Y.handleDownload,
                  disabled: !Q,
                  children: Y.saved ? 'Saved!' : 'Download image'
                }),
                m &&
                  (0, t.jsx)(g.Button, {
                    size: 'sm',
                    theme: 'auto',
                    leftIcon: (0, t.jsx)(L.Copy, {}),
                    onClick: Y.handleCopyImage,
                    disabled: !Q,
                    children: Y.copiedImage ? 'Copied!' : 'Copy image'
                  })
              ]
            }),
            Y.actionError &&
              (0, t.jsx)('span', {
                className: 'text-[12px] text-[#dc2626] dark:text-[#f05959]',
                children: Y.actionError
              })
          ]
        })
      })
    }
    function T (e) {
      return e >= 1e6
        ? `${(e / 1e6).toFixed(1)}M`
        : e >= 1e3
        ? `${(e / 1e3).toFixed(1)}K`
        : e.toLocaleString('en-US')
    }
    function U ({ lang: e, title: a }) {
      let s = (0, y.resolveLanguage)(e)
      return s
        ? (0, t.jsx)('span', {
            title: a ?? s.name,
            className:
              'inline-flex size-5 items-center justify-center rounded-full overflow-hidden shrink-0',
            children: (0, t.jsx)('img', {
              src: (0, y.flagUrl)(s.cc),
              alt: s.name,
              className: 'h-full w-full object-cover',
              loading: 'lazy'
            })
          })
        : (0, t.jsx)('span', {
            className: 'text-[rgba(42,39,78,0.25)] dark:text-white/25',
            children: '—'
          })
    }
    function B (e) {
      let t = Math.floor((Date.now() - new Date(e).getTime()) / 864e5)
      if (t <= 0) return 'today'
      if (1 === t) return 'yesterday'
      if (t < 30) return `${t}d ago`
      let a = Math.floor(t / 30)
      return 1 === a ? '1mo ago' : `${a}mo ago`
    }
    let D = e =>
      `https://cdn.fairgambling.com/pfps/${e.trim().toLowerCase()}.webp`
    function R ({ name: e, src: s, size: r = 32, rounded: l = 'rounded-full' }) {
      let [n, i] = (0, a.useState)(!1),
        o = s ?? D(e)
      return o && !n
        ? (0, t.jsx)('img', {
            src: o,
            alt: e,
            width: r,
            height: r,
            onError: () => i(!0),
            className: `shrink-0 ${l} object-cover`,
            style: { width: r, height: r }
          })
        : (0, t.jsx)('span', {
            className: `flex shrink-0 items-center justify-center ${l} bg-gradient-to-b from-[#9a80f9] to-[#322098] font-semibold text-white`,
            style: { width: r, height: r, fontSize: Math.round(0.4 * r) },
            children: (e.trim()[0] ?? '?').toUpperCase()
          })
    }
    function H ({ name: e, src: a, size: s = 32 }) {
      return (0, t.jsx)(R, { name: e, src: a, size: s })
    }
    function O ({ level: e, inline: a = !1 }) {
      let s = 'High' === e ? 3 : 'Medium' === e ? 2 : 1,
        r = 'High' === e ? '#a78bfa' : 'Medium' === e ? '#fbbf24' : '#34d399',
        l = (0, t.jsx)('span', {
          className: 'flex items-center gap-1',
          children: [0, 1, 2].map(e =>
            (0, t.jsx)(
              'span',
              {
                className: 'h-1 w-3 rounded-sm transition-colors',
                style: {
                  backgroundColor:
                    e < s ? r : 'var(--degen-off, rgba(255,255,255,0.08))'
                }
              },
              e
            )
          )
        })
      return a
        ? (0, t.jsxs)('span', {
            className: 'inline-flex items-center gap-1.5',
            children: [
              l,
              (0, t.jsx)('span', {
                className: 'text-[13px] font-semibold',
                style: { color: r },
                children: e
              }),
              (0, t.jsx)('span', {
                className:
                  'text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40',
                children: 'degen'
              })
            ]
          })
        : (0, t.jsxs)('span', {
            className: 'inline-flex flex-col items-center gap-1',
            children: [
              (0, t.jsx)('span', {
                className: 'text-[13px] font-bold',
                style: { color: r },
                children: e
              }),
              l
            ]
          })
    }
    let W =
        'px-3 pb-3 text-[11px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35 sm:whitespace-nowrap',
      K =
        'whitespace-nowrap border-t border-[rgba(42,39,78,0.06)] dark:border-white/[0.05] px-3 py-3.5 text-[13px]',
      G = [
        { label: '#', key: 'rank', w: 40 },
        { label: 'Streamer', key: 'name', w: 150 },
        { label: 'IRL', key: null, center: !0, w: 64 },
        { label: 'Market Value', key: 'marketvalue', right: !0, w: 100 },
        { label: 'Lang', key: null, w: 50 },
        { label: 'Casino', key: null, w: 100 },
        { label: 'Est. Payment', key: 'payment', right: !0, w: 110 },
        { label: 'Degen', key: 'degen', w: 75 },
        { label: 'Money', key: null, w: 70 },
        { label: 'Followers', key: 'followers', right: !0, w: 90 },
        { label: 'Avg Viewers', key: 'avg', right: !0, w: 90 },
        { label: 'View Hrs', key: 'hours', right: !0, w: 85 },
        { label: 'Stream Hrs', key: 'streamhours', right: !0, w: 85 },
        { label: 'Last Live', key: 'lastlive', w: 80 },
        { label: 'Leaderboard', key: 'leaderboard', right: !0, w: 120 }
      ],
      q = new Set(['avg', 'hours']),
      X = {
        Live: { key: 'liveviewers', dir: 'desc' },
        'Most Valuable': { key: 'marketvalue', dir: 'desc' },
        Newcomers: { key: 'newcomer', dir: 'desc' }
      }
    function J (e, t) {
      switch (t) {
        case 'followers':
          return e.followers
        case 'avg':
          return e.avgViewers30d
        case 'hours':
          return e.hoursWatched30d
        case 'payment':
          return (function (e) {
            if (!e) return 0
            let t = e.match(/([\d.]+)\s*([MK])?/i)
            if (!t) return 0
            let a = parseFloat(t[1]),
              s = (t[2] || '').toUpperCase()
            return 'M' === s ? 1e6 * a : 'K' === s ? 1e3 * a : a
          })(e.estMonthlyPayment)
        case 'marketvalue':
          return (0, k.mvOf)(e) ?? 0
        case 'liveviewers':
          return e.liveViewers ?? 0
        case 'lastlive':
          return e.lastStreamed ? Date.parse(e.lastStreamed) : 0
        case 'newcomer':
          return e.firstStreamed ? Date.parse(e.firstStreamed) : 0
        case 'rank':
          return 0
        case 'name':
          return e.username.charCodeAt(0)
        case 'degen':
          return 'High' === e.degen ? 3 : 'Medium' === e.degen ? 2 : 1
        case 'streamhours':
          return e.streamHours30d ?? 0
        case 'leaderboard':
          return e.monthlyLeaderboardUsd ?? 0
      }
    }
    function Q (e) {
      return (
        !!e.firstStreamed && Date.now() - Date.parse(e.firstStreamed) <= 31536e6
      )
    }
    function Y ({ streamers: e }) {
      let [s, l] = (0, a.useState)('Most Valuable'),
        [n, c] = (0, a.useState)(''),
        [d, m] = (0, a.useState)(null),
        [x, h] = (0, a.useState)(10),
        [g, w] = (0, a.useState)(X['Most Valuable']),
        [v, N] = (0, a.useState)(!1),
        [y, C] = (0, a.useState)(!1),
        S = (0, a.useMemo)(() => {
          let t = new Map()
          for (let a of e) {
            let e = a.currentCasino
            e && '—' !== e && t.set(e, (t.get(e) ?? 0) + ((0, k.mvOf)(a) ?? 0))
          }
          return [...t.entries()].sort((e, t) => t[1] - e[1]).map(([e]) => e)
        }, [e]),
        M = (0, a.useMemo)(() => {
          let t = n.trim().toLowerCase(),
            a = t
              ? e
              : e.filter(
                  e =>
                    e.hasStats ||
                    e.followers > 0 ||
                    e.avgViewers30d > 0 ||
                    e.hoursWatched30d > 0
                )
          d && (a = a.filter(e => d.has(e.currentCasino))),
            'Live' === s && (a = a.filter(e => e.live)),
            'Newcomers' === s && (a = a.filter(Q))
          let r = q.has(g.key),
            l = [...a].sort((e, t) => {
              if (r) {
                let a = Number(t.hasStats ?? !1) - Number(e.hasStats ?? !1)
                if (a) return a
              }
              let a = J(e, g.key) - J(t, g.key)
              return 'desc' === g.dir ? -a : a
            }),
            i = new Map(l.map((e, t) => [e.username, t + 1]))
          return {
            rows: t ? l.filter(e => e.username.toLowerCase().includes(t)) : l,
            rank: i
          }
        }, [e, s, n, g, d]),
        $ = M.rows,
        L = M.rank,
        z = $.slice(0, x)
      return (0, t.jsxs)(p.ThemedCard, {
        variant: 'panel',
        blur: !0,
        padded: !1,
        className: 'p-4 lg:p-5',
        children: [
          (0, t.jsxs)('div', {
            className: 'flex flex-wrap items-center gap-3',
            children: [
              (0, t.jsx)(b.Tabs, {
                theme: 'auto',
                tabs: k.LIST_TABS.map(e => ({
                  id: e,
                  label: e,
                  leftIcon:
                    'Live' === e
                      ? (0, t.jsx)('span', {
                          className: 'size-1.5 rounded-full bg-[#f7575f]'
                        })
                      : void 0
                })),
                activeId: s,
                onChange: e => {
                  l(e), w(X[e] ?? { key: 'payment', dir: 'desc' }), h(10)
                },
                size: 'sm',
                fill: !0,
                className: 'flex w-full sm:inline-flex sm:w-auto'
              }),
              (0, t.jsx)('div', {
                className:
                  'order-last flex w-full justify-center sm:order-none sm:w-auto sm:flex-1',
                children: (0, t.jsx)(ej, {
                  streamers: e,
                  onQuery: e => {
                    c(e), h(10)
                  }
                })
              }),
              (0, t.jsxs)('div', {
                className: 'flex w-full items-center gap-3 sm:w-auto',
                children: [
                  (0, t.jsx)('span', {
                    className: 'hidden lg:block',
                    children: (0, t.jsx)(ep, {})
                  }),
                  (0, t.jsxs)('button', {
                    type: 'button',
                    onClick: () => N(!0),
                    className:
                      'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-[0.5px] border-[rgba(42,39,78,0.15)] dark:border-white/15 bg-white/[0.5] dark:bg-white/[0.03] px-3 py-2 text-[12px] font-medium text-[rgba(42,39,78,0.6)] dark:text-white/60 transition-colors hover:text-[#2a274e] dark:hover:text-[#2a274e] dark:text-white',
                    children: [
                      (0, t.jsx)(o.Info, { size: 13 }),
                      ' How Market Value Works'
                    ]
                  }),
                  (0, t.jsxs)('button', {
                    type: 'button',
                    onClick: () => C(!0),
                    onMouseEnter: () => {
                      fetch('/api/og/streamers?metric=market-value').catch(
                        () => {}
                      )
                    },
                    'aria-label': 'Share a top streamers snapshot',
                    className:
                      'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-[0.5px] border-[rgba(42,39,78,0.15)] dark:border-white/15 bg-white/[0.5] dark:bg-white/[0.03] px-3 py-2 text-[12px] font-medium text-[rgba(42,39,78,0.6)] dark:text-white/60 transition-colors hover:text-[#2a274e] dark:hover:text-[#2a274e] dark:text-white',
                    children: [(0, t.jsx)(u.Share2, { size: 13 }), ' Share']
                  }),
                  (0, t.jsx)(f.Dropdown, {
                    theme: 'auto',
                    multiple: !0,
                    searchable: !0,
                    size: 'sm',
                    align: 'right',
                    className:
                      'min-w-0 flex-1 [&>button]:w-full [&>button]:justify-between sm:flex-none sm:[&>button]:w-auto sm:[&>button]:justify-start',
                    options: S.map(e => ({ value: e, label: e })),
                    renderIcon: (e, a) =>
                      (0, t.jsx)(eh, { casinoName: e, size: a }),
                    value: d,
                    onChange: e => {
                      m(e), h(10)
                    },
                    allLabel: 'All Casinos',
                    noun: 'Casino'
                  })
                ]
              })
            ]
          }),
          (0, t.jsx)(eC, { open: v, onClose: () => N(!1) }),
          y &&
            (0, t.jsx)(P, {
              streamers: e,
              casinoOptions: S,
              onClose: () => C(!1)
            }),
          0 === z.length
            ? (0, t.jsx)(ey, { query: n.trim() }, n.trim())
            : (0, t.jsxs)(j.Watermark, {
                opacity: 0.05,
                logoWidth: 280,
                repeat: z.length >= 8 ? 2 : 1,
                className: 'mt-4',
                children: [
                  (0, t.jsx)('div', {
                    className: 'scrollbar-hide overflow-x-auto sm:hidden',
                    children: (0, t.jsxs)('table', {
                      className:
                        'w-full min-w-[720px] border-separate border-spacing-0 text-left',
                      children: [
                        (0, t.jsx)('thead', {
                          children: (0, t.jsx)('tr', {
                            children: [
                              '#',
                              'Streamer',
                              'Market Value',
                              'Est. Payment',
                              'Casino',
                              'Followers',
                              'Avg Viewers',
                              'Last Live'
                            ].map((e, a) =>
                              (0, t.jsx)(
                                'th',
                                {
                                  className: `whitespace-nowrap px-2.5 pb-2.5 text-[10.5px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35 ${
                                    2 === a || 3 === a || 5 === a || 6 === a
                                      ? 'text-right'
                                      : ''
                                  } ${
                                    0 === a
                                      ? es + ' ' + et
                                      : 1 === a
                                      ? er + ' ' + et
                                      : ''
                                  }`,
                                  children: e
                                },
                                e
                              )
                            )
                          })
                        }),
                        (0, t.jsx)('tbody', {
                          children: z.map((e, a) =>
                            (0, t.jsx)(
                              el,
                              { s: e, rank: L.get(e.username) ?? a + 1 },
                              e.username
                            )
                          )
                        })
                      ]
                    })
                  }),
                  (0, t.jsx)('div', {
                    className: 'scrollbar-hide hidden overflow-x-auto sm:block',
                    children: (0, t.jsxs)('table', {
                      className:
                        'w-full table-fixed border-separate border-spacing-0 text-left',
                      children: [
                        (0, t.jsx)('colgroup', {
                          children: G.map(e =>
                            (0, t.jsx)(
                              'col',
                              { style: { width: e.w } },
                              e.label
                            )
                          )
                        }),
                        (0, t.jsx)('thead', {
                          children: (0, t.jsx)('tr', {
                            children: G.map(e =>
                              (0, t.jsx)(
                                'th',
                                {
                                  onClick: e.key
                                    ? () => {
                                        let t
                                        return (
                                          (t = e.key),
                                          w(e =>
                                            e.key === t
                                              ? {
                                                  key: t,
                                                  dir:
                                                    'asc' === e.dir
                                                      ? 'desc'
                                                      : 'asc'
                                                }
                                              : { key: t, dir: 'desc' }
                                          )
                                        )
                                      }
                                    : void 0,
                                  className: `${W} ${
                                    e.right ? 'text-right' : ''
                                  } ${e.center ? 'text-center' : ''} ${
                                    e.key
                                      ? 'group cursor-pointer select-none'
                                      : ''
                                  }`,
                                  children: (0, t.jsxs)('span', {
                                    className: `inline-flex items-center gap-1 rounded-md transition-all ${
                                      e.key
                                        ? '-mx-2 -my-1 px-2 py-1 group-hover:bg-[rgba(42,39,78,0.06)] dark:group-hover:bg-white/[0.06] group-hover:text-[rgba(42,39,78,0.9)] dark:group-hover:text-white/90'
                                        : ''
                                    }`,
                                    children: [
                                      e.label,
                                      e.key &&
                                        (0, t.jsxs)('svg', {
                                          width: '12',
                                          height: '12',
                                          viewBox: '0 0 12 12',
                                          fill: 'none',
                                          className: 'shrink-0',
                                          children: [
                                            (0, t.jsx)('path', {
                                              d: 'M0.833 3.75L3.083 1.5M3.083 1.5L5.333 3.75M3.083 1.5V8.25',
                                              stroke:
                                                g.key === e.key &&
                                                'asc' === g.dir
                                                  ? '#8874ff'
                                                  : '#414E62',
                                              strokeLinecap: 'round',
                                              strokeLinejoin: 'round'
                                            }),
                                            (0, t.jsx)('path', {
                                              d: 'M11.167 8.25L8.917 10.5M8.917 10.5L6.667 8.25M8.917 10.5V3.75',
                                              stroke:
                                                g.key === e.key &&
                                                'desc' === g.dir
                                                  ? '#8874ff'
                                                  : '#414E62',
                                              strokeLinecap: 'round',
                                              strokeLinejoin: 'round'
                                            })
                                          ]
                                        })
                                    ]
                                  })
                                },
                                e.label
                              )
                            )
                          })
                        }),
                        (0, t.jsx)('tbody', {
                          children: z.map((e, a) =>
                            (0, t.jsx)(
                              en,
                              { s: e, rank: L.get(e.username) ?? a + 1 },
                              e.username
                            )
                          )
                        })
                      ]
                    })
                  })
                ]
              }),
          $.length > 10 &&
            (0, t.jsxs)('div', {
              className:
                'mt-4 flex flex-wrap items-center justify-center gap-2',
              children: [
                (0, t.jsxs)(r.default, {
                  href: '/streamers/all',
                  onClick: e => {
                    e.preventDefault(),
                      h(e => (e >= $.length ? 10 : Math.min(e + 10, $.length)))
                  },
                  className:
                    'nd-gradient-border inline-flex items-center gap-1.5 rounded-full bg-[rgba(42,39,78,0.04)] dark:bg-white/[0.04] px-5 py-2.5 text-[12.5px] font-medium text-[rgba(42,39,78,0.7)] dark:text-white/70 backdrop-blur-[35.5px] transition-colors hover:bg-[rgba(42,39,78,0.07)] dark:hover:bg-white/[0.07] hover:text-[#2a274e] dark:hover:text-[#2a274e] dark:text-white',
                  children: [
                    x >= $.length
                      ? 'Show less'
                      : `Show more (${$.length - x} left)`,
                    (0, t.jsx)(i.ChevronDown, {
                      size: 14,
                      className: `text-[rgba(42,39,78,0.4)] dark:text-white/40 transition-transform ${
                        x >= $.length ? 'rotate-180' : ''
                      }`
                    })
                  ]
                }),
                x < $.length &&
                  (0, t.jsx)(r.default, {
                    href: '/streamers/all',
                    onClick: e => {
                      e.preventDefault(), h($.length)
                    },
                    className:
                      'nd-gradient-border inline-flex items-center gap-1.5 rounded-full bg-[rgba(42,39,78,0.04)] dark:bg-white/[0.04] px-5 py-2.5 text-[12.5px] font-medium text-[rgba(42,39,78,0.7)] dark:text-white/70 backdrop-blur-[35.5px] transition-colors hover:bg-[rgba(42,39,78,0.07)] dark:hover:bg-white/[0.07] hover:text-[#2a274e] dark:hover:text-[#2a274e] dark:text-white',
                    children: `Show all (${$.length})`
                  })
              ]
            })
        ]
      })
    }
    function Z (e) {
      let t = Math.min(Math.pow(Math.max(Math.log10(e / 1e6), 0) / 2, 1.2), 1)
      return `hsl(270, ${90 * t}%, ${45 + (1 - t) * 25}%)`
    }
    let ee =
        'whitespace-nowrap border-t border-[rgba(42,39,78,0.06)] dark:border-white/[0.05] px-2.5 py-3 text-[12px]',
      et = 'bg-[#f4f4f4] dark:bg-[#111525]',
      ea = 'bg-[#f4f4f4] dark:bg-[#181c2c]',
      es = 'sticky left-0 z-[2] w-8',
      er = 'sticky left-8 z-[2]'
    function el ({ s: e, rank: a }) {
      let s = (0, l.useRouter)(),
        n = (0, k.mvOf)(e)
      return (0, t.jsxs)('tr', {
        onClick: () => s.push((0, k.streamerHref)(e.username)),
        className:
          'cursor-pointer transition-colors active:bg-white/[0.5] dark:bg-white/[0.03]',
        children: [
          (0, t.jsx)('td', {
            className: `${ee} ${es} ${ea} text-[rgba(42,39,78,0.4)] dark:text-white/35`,
            children: a
          }),
          (0, t.jsx)('td', {
            className: `${ee} ${er} ${ea}`,
            children: (0, t.jsxs)(r.default, {
              href: (0, k.streamerHref)(e.username),
              className: 'flex items-center gap-2',
              onClick: e => e.stopPropagation(),
              children: [
                (0, t.jsx)(H, {
                  name: e.username,
                  src: e.avatarUrl ?? void 0,
                  size: 32
                }),
                (0, t.jsxs)('span', {
                  className: 'flex min-w-0 flex-col gap-0.5',
                  children: [
                    (0, t.jsx)('span', {
                      className:
                        'truncate text-[12.5px] font-medium text-[#2a274e] dark:text-white',
                      children: e.username
                    }),
                    (0, t.jsx)('span', {
                      className: 'flex items-center gap-1 text-[10px]',
                      children: e.live
                        ? (0, t.jsx)(ex, { viewers: e.liveViewers })
                        : (0, t.jsx)('span', {
                            className:
                              'font-medium text-[rgba(42,39,78,0.3)] dark:text-white/30',
                            children: 'OFFLINE'
                          })
                    })
                  ]
                })
              ]
            })
          }),
          (0, t.jsx)('td', {
            className: `${ee} text-right`,
            children: n
              ? (0, t.jsx)('span', {
                  className: 'text-[13.5px] font-bold',
                  style: { color: Z(n) },
                  children: (0, k.formatMarketValue)(n)
                })
              : (0, t.jsx)('span', {
                  className: 'text-[rgba(42,39,78,0.3)] dark:text-white/30',
                  children: '—'
                })
          }),
          (0, t.jsx)('td', {
            className: `${ee} text-right`,
            children: e.estMonthlyPayment
              ? (0, t.jsx)('span', {
                  className: 'font-semibold text-[#4ad17d]',
                  children: e.estMonthlyPayment
                })
              : (0, t.jsx)('span', {
                  className: 'text-[rgba(42,39,78,0.3)] dark:text-white/30',
                  children: '—'
                })
          }),
          (0, t.jsx)('td', {
            className: `${ee} overflow-hidden`,
            children: (0, t.jsx)(eu, {
              name: e.currentCasino,
              size: 20,
              className:
                'text-[11.5px] text-[rgba(42,39,78,0.8)] dark:text-white/80'
            })
          }),
          (0, t.jsx)('td', {
            className: `${ee} text-right ${
              e.followers > 0
                ? 'font-semibold text-[#2a274e] dark:text-white'
                : 'text-[rgba(42,39,78,0.3)] dark:text-white/30'
            }`,
            children:
              e.followers > 0
                ? (0, t.jsxs)('span', {
                    className: 'inline-flex items-center gap-1',
                    children: [
                      (0, t.jsx)(x.Users, {
                        size: 11,
                        className:
                          'text-[rgba(42,39,78,0.4)] dark:text-white/35'
                      }),
                      T(e.followers)
                    ]
                  })
                : '—'
          }),
          (0, t.jsx)('td', {
            className: `${ee} text-right text-[rgba(42,39,78,0.8)] dark:text-white/80`,
            children: e.avgViewers30d > 0 ? T(e.avgViewers30d) : '—'
          }),
          (0, t.jsx)('td', {
            className: `${ee} ${
              e.live
                ? 'font-medium text-[#3ddc97]'
                : 'text-[rgba(42,39,78,0.6)] dark:text-white/60'
            }`,
            suppressHydrationWarning: !0,
            children: e.live ? 'now' : e.lastStreamed ? B(e.lastStreamed) : '—'
          })
        ]
      })
    }
    function en ({ s: e, rank: a }) {
      let s = (0, l.useRouter)()
      return (0, t.jsxs)('tr', {
        onClick: () => s.push((0, k.streamerHref)(e.username)),
        className:
          'cursor-pointer transition-colors hover:bg-[rgba(42,39,78,0.03)] dark:hover:bg-white/[0.03]',
        children: [
          (0, t.jsx)('td', {
            className: `${K} text-[rgba(42,39,78,0.4)] dark:text-white/35`,
            children: a
          }),
          (0, t.jsx)('td', {
            className: `${K} overflow-hidden`,
            children: (0, t.jsxs)(r.default, {
              href: (0, k.streamerHref)(e.username),
              className: 'flex items-center gap-2',
              onClick: e => e.stopPropagation(),
              children: [
                (0, t.jsx)(H, {
                  name: e.username,
                  src: e.avatarUrl ?? void 0,
                  size: 32
                }),
                (0, t.jsxs)('span', {
                  className: 'flex min-w-0 flex-col gap-0.5',
                  children: [
                    (0, t.jsx)('span', {
                      className:
                        'font-medium text-[#2a274e] dark:text-white text-[12px]',
                      children: e.username
                    }),
                    (0, t.jsx)('span', {
                      className: 'flex items-center gap-1 text-[10px]',
                      children: e.live
                        ? (0, t.jsx)(ex, { viewers: e.liveViewers })
                        : (0, t.jsx)('span', {
                            className:
                              'font-medium text-[rgba(42,39,78,0.3)] dark:text-white/30',
                            children: 'OFFLINE'
                          })
                    })
                  ]
                })
              ]
            })
          }),
          (0, t.jsx)('td', {
            className: K,
            children: (0, t.jsx)('span', {
              className: 'flex justify-center',
              children: e.imageUrl
                ? (0, t.jsx)('img', {
                    src: e.imageUrl,
                    alt: '',
                    width: 40,
                    height: 40,
                    loading: 'lazy',
                    className:
                      'size-10 shrink-0 rounded-lg object-cover ring-1 ring-[rgba(42,39,78,0.1)] dark:ring-white/10'
                  })
                : (0, t.jsx)('span', {
                    className: 'text-[rgba(42,39,78,0.2)] dark:text-white/20',
                    children: '—'
                  })
            })
          }),
          (0, t.jsx)('td', {
            className: `${K} text-right`,
            children: (0, k.mvOf)(e)
              ? (0, t.jsx)('span', {
                  className: 'font-bold text-[14px]',
                  style: { color: Z((0, k.mvOf)(e)) },
                  children: (0, k.formatMarketValue)((0, k.mvOf)(e))
                })
              : (0, t.jsx)('span', {
                  className: 'text-[rgba(42,39,78,0.3)] dark:text-white/30',
                  children: '—'
                })
          }),
          (0, t.jsx)('td', {
            className: K,
            children: (0, t.jsx)(U, {
              lang: e.language,
              title: e.language ?? void 0
            })
          }),
          (0, t.jsx)('td', {
            className: `${K} overflow-hidden`,
            children: (0, t.jsx)(eu, {
              name: e.currentCasino,
              size: 24,
              className:
                'text-[12px] text-[rgba(42,39,78,0.8)] dark:text-white/80'
            })
          }),
          (0, t.jsx)('td', {
            className: `${K} text-right`,
            children: e.estMonthlyPayment
              ? (() => {
                  let a = (0, k.parseMoney)(e.estMonthlyPayment)
                  if (!a || a <= 0)
                    return (0, t.jsx)('span', {
                      className: 'text-[rgba(42,39,78,0.3)] dark:text-white/30',
                      children: '—'
                    })
                  let s = Math.min(
                      Math.pow(Math.max(Math.log10(a / 1e6), 0) / 3, 1.1),
                      1
                    ),
                    r = 40 + 50 * s,
                    l = 55 - 15 * s,
                    n = `hsl(134, ${r}%, ${l}%)`
                  return (0, t.jsx)('span', {
                    className:
                      'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-semibold',
                    style: {
                      color: n,
                      borderColor: n,
                      backgroundColor: `hsla(134, ${r}%, ${l}%, 0.08)`
                    },
                    children: e.estMonthlyPayment
                  })
                })()
              : (0, t.jsx)('span', {
                  className: 'text-[rgba(42,39,78,0.3)] dark:text-white/30',
                  children: '—'
                })
          }),
          (0, t.jsx)('td', {
            className: K,
            children: (0, t.jsx)(O, { level: e.degen })
          }),
          (0, t.jsx)('td', {
            className: K,
            children: (0, t.jsx)(em, { value: e.rawFake, size: 12 })
          }),
          (0, t.jsx)('td', {
            className: `${K} text-right ${
              e.followers > 0
                ? 'font-semibold text-[#2a274e] dark:text-white'
                : 'text-[rgba(42,39,78,0.3)] dark:text-white/30'
            } text-[12px]`,
            children: e.followers > 0 ? T(e.followers) : '—'
          }),
          (0, t.jsx)('td', {
            className: `${K} text-right text-[rgba(42,39,78,0.8)] dark:text-white/80 text-[12px]`,
            children: e.avgViewers30d > 0 ? T(e.avgViewers30d) : '—'
          }),
          (0, t.jsx)('td', {
            className: `${K} text-right text-[rgba(42,39,78,0.8)] dark:text-white/80 text-[12px]`,
            children:
              e.hoursWatched30d > 0 ? `${T(e.hoursWatched30d)} hrs` : '—'
          }),
          (0, t.jsx)('td', {
            className: `${K} text-right text-[rgba(42,39,78,0.8)] dark:text-white/80 text-[12px]`,
            children:
              e.streamHours30d && e.streamHours30d > 0
                ? `${T(e.streamHours30d)} hrs`
                : '—'
          }),
          (0, t.jsx)('td', {
            className: `${K} text-[12px] ${
              e.live
                ? 'font-medium text-[#3ddc97]'
                : 'text-[rgba(42,39,78,0.6)] dark:text-white/60'
            }`,
            suppressHydrationWarning: !0,
            children: e.live ? 'now' : e.lastStreamed ? B(e.lastStreamed) : '—'
          }),
          (0, t.jsx)('td', {
            className: `${K} text-right text-[12px]`,
            children:
              e.monthlyLeaderboardUsd && e.monthlyLeaderboardUsd > 0
                ? (0, t.jsxs)('span', {
                    className: 'font-semibold text-[#e8b33c]',
                    children: [
                      (0, k.formatMarketValue)(e.monthlyLeaderboardUsd),
                      ' / mo'
                    ]
                  })
                : (0, t.jsx)('span', {
                    className: 'text-[rgba(42,39,78,0.3)] dark:text-white/30',
                    children: '—'
                  })
          })
        ]
      })
    }
    function ei ({ streamers: e }) {
      let [s, r] = (0, a.useState)({ key: 'value', dir: -1 }),
        l = (0, a.useMemo)(() => {
          let t = new Map()
          for (let a of e) {
            let e = a.currentCasino
            if (!e || '—' === e || 'Multi' === e) continue
            let s = (0, k.mvOf)(a),
              r = t.get(e) ?? { count: 0, value: 0 }
            ;(r.count += 1), s && (r.value += s), t.set(e, r)
          }
          let a = [...t.entries()].map(([e, t]) => ({
              casino: e,
              streamers: t.count,
              value: t.value
            })),
            s = a.reduce((e, t) => e + t.value, 0) || 1
          return a.map(e => ({
            ...e,
            share: (e.value / s) * 100,
            valueLabel: (0, k.formatMarketValue)(e.value) ?? '—'
          }))
        }, [e]),
        n = (0, a.useMemo)(
          () =>
            [...l].sort(
              (e, t) =>
                ('casino' === s.key
                  ? e.casino.localeCompare(t.casino)
                  : 'streamers' === s.key
                  ? e.streamers - t.streamers
                  : e.value - t.value) * s.dir
            ),
          [l, s]
        )
      return (0, t.jsxs)(p.ThemedCard, {
        variant: 'panel',
        blur: !0,
        padded: !1,
        className: 'p-4 lg:p-5',
        children: [
          (0, t.jsx)('div', {
            className: 'flex items-center justify-between gap-3',
            children: (0, t.jsx)('h2', {
              className:
                'text-[16px] font-semibold text-[#2a274e] dark:text-white',
              children: 'Casinos by Streamer Market Value'
            })
          }),
          (0, t.jsx)('div', {
            className: 'relative mt-4',
            children: (0, t.jsx)('div', {
              className:
                'scrollbar-hide max-h-[560px] overflow-x-clip overflow-y-auto',
              children: (0, t.jsx)(j.Watermark, {
                opacity: 0.06,
                logoWidth: 220,
                children: (0, t.jsxs)('table', {
                  className:
                    'w-full table-fixed border-separate border-spacing-0 text-left',
                  children: [
                    (0, t.jsx)('thead', {
                      children: (0, t.jsx)('tr', {
                        children: [
                          ['#', null, !1, !1, 'w-8 sm:w-9'],
                          ['Casino', 'casino', !1, !1, ''],
                          ['Streamers', 'streamers', !0, !0, 'w-[92px]'],
                          ['Share', null, !1, !0, 'w-[126px]'],
                          [
                            'Market Value',
                            'value',
                            !0,
                            !1,
                            'w-[86px] sm:w-[104px]'
                          ]
                        ].map(([e, a, l, n, i], o) =>
                          (0, t.jsx)(
                            'th',
                            {
                              onClick: a
                                ? () =>
                                    r(e =>
                                      e.key === a
                                        ? { key: a, dir: -e.dir }
                                        : { key: a, dir: -1 }
                                    )
                                : void 0,
                              className: `${W} sticky top-0 z-10 !px-2.5 backdrop-blur-md ${i} ${
                                0 === o ? '!pl-3' : ''
                              } ${l ? 'text-right' : ''} ${
                                a ? 'group cursor-pointer select-none' : ''
                              } ${n ? 'hidden sm:table-cell' : ''}`,
                              children: (0, t.jsxs)('span', {
                                className: `inline-flex items-center gap-1 rounded-md transition-all ${
                                  a
                                    ? '-mx-2 -my-1 px-2 py-1 group-hover:bg-[rgba(42,39,78,0.06)] dark:group-hover:bg-white/[0.06] group-hover:text-[rgba(42,39,78,0.9)] dark:group-hover:text-white/90'
                                    : ''
                                }`,
                                children: [
                                  e,
                                  a &&
                                    (0, t.jsxs)('svg', {
                                      width: '12',
                                      height: '12',
                                      viewBox: '0 0 12 12',
                                      fill: 'none',
                                      className: 'shrink-0',
                                      children: [
                                        (0, t.jsx)('path', {
                                          d: 'M0.833 3.75L3.083 1.5M3.083 1.5L5.333 3.75M3.083 1.5V8.25',
                                          stroke:
                                            s.key === a && 1 === s.dir
                                              ? '#8874ff'
                                              : '#414E62',
                                          strokeLinecap: 'round',
                                          strokeLinejoin: 'round'
                                        }),
                                        (0, t.jsx)('path', {
                                          d: 'M11.167 8.25L8.917 10.5M8.917 10.5L6.667 8.25M8.917 10.5V3.75',
                                          stroke:
                                            s.key === a && -1 === s.dir
                                              ? '#8874ff'
                                              : '#414E62',
                                          strokeLinecap: 'round',
                                          strokeLinejoin: 'round'
                                        })
                                      ]
                                    })
                                ]
                              })
                            },
                            e
                          )
                        )
                      })
                    }),
                    (0, t.jsx)('tbody', {
                      children: n.map((e, a) =>
                        (0, t.jsxs)(
                          'tr',
                          {
                            className:
                              'transition-colors hover:bg-[rgba(42,39,78,0.02)] dark:hover:bg-white/[0.02]',
                            children: [
                              (0, t.jsx)('td', {
                                className: `${K} !px-2.5 !pl-3 text-[rgba(42,39,78,0.4)] dark:text-white/35`,
                                children: a + 1
                              }),
                              (0, t.jsx)('td', {
                                className: `${K} !px-2.5`,
                                children: (0, t.jsxs)('span', {
                                  className: 'flex min-w-0 items-center gap-2',
                                  children: [
                                    (0, t.jsx)(eh, {
                                      casinoName: e.casino,
                                      size: 20
                                    }),
                                    (0, t.jsxs)('span', {
                                      className: 'flex min-w-0 flex-col',
                                      children: [
                                        (0, t.jsx)('span', {
                                          className:
                                            'truncate font-medium text-[#2a274e] dark:text-white',
                                          children:
                                            'free agent' ===
                                            e.casino.trim().toLowerCase()
                                              ? (0, t.jsxs)(t.Fragment, {
                                                  children: [
                                                    'Free Agent ',
                                                    (0, t.jsx)('span', {
                                                      className:
                                                        'font-normal text-[rgba(42,39,78,0.4)] dark:text-white/40 sm:hidden xl:inline',
                                                      children:
                                                        '(no deal currently)'
                                                    })
                                                  ]
                                                })
                                              : e.casino
                                        }),
                                        (0, t.jsxs)('span', {
                                          className:
                                            'text-[10.5px] leading-tight text-[rgba(42,39,78,0.4)] dark:text-white/40 sm:hidden',
                                          children: [
                                            e.streamers,
                                            ' streamer',
                                            1 === e.streamers ? '' : 's'
                                          ]
                                        })
                                      ]
                                    })
                                  ]
                                })
                              }),
                              (0, t.jsx)('td', {
                                className: `${K} hidden !px-2.5 text-right text-[rgba(42,39,78,0.8)] dark:text-white/80 sm:table-cell`,
                                children: e.streamers
                              }),
                              (0, t.jsx)('td', {
                                className: `${K} hidden !px-2.5 sm:table-cell`,
                                children: (0, t.jsxs)('span', {
                                  className: 'flex items-center gap-3',
                                  children: [
                                    (0, t.jsxs)('span', {
                                      className:
                                        'min-w-[36px] text-[12.5px] font-medium text-[rgba(42,39,78,0.8)] dark:text-white/80',
                                      children: [e.share.toFixed(1), '%']
                                    }),
                                    (0, t.jsx)('span', {
                                      className:
                                        'relative h-1.5 w-12 shrink-0 rounded-full bg-[rgba(42,39,78,0.12)] dark:bg-[#414e62]',
                                      children: (0, t.jsx)('span', {
                                        className:
                                          'absolute left-0 top-0 block h-full rounded-full bg-[#9a80f9]',
                                        style: {
                                          width: `${Math.min(e.share, 100)}%`
                                        }
                                      })
                                    })
                                  ]
                                })
                              }),
                              (0, t.jsx)('td', {
                                className: `${K} !px-2.5 text-right font-medium text-[#2a274e] dark:text-white`,
                                children: e.valueLabel
                              })
                            ]
                          },
                          e.casino
                        )
                      )
                    })
                  ]
                })
              })
            })
          })
        ]
      })
    }
    let eo = [
        '#8874ff',
        '#4ad17d',
        '#f5b83d',
        '#f7575f',
        '#5b9dff',
        '#b06bf5',
        '#4fd1c5',
        '#ec81a7',
        '#f59e6b',
        '#6ee7b7'
      ],
      ec = [10, 25, 50, 100, 'all']
    function ed ({ streamers: e }) {
      let [s, r] = (0, a.useState)('streamer'),
        [l, n] = (0, a.useState)(25),
        i = (0, a.useMemo)(() => {
          let t = new Map()
          for (let a of e) {
            let e = a.currentCasino
            if (!e || '—' === e || 'Multi' === e) continue
            let s = (0, k.mvOf)(a)
            s && t.set(e, (t.get(e) ?? 0) + s)
          }
          let a = [...t.entries()].sort((e, t) => t[1] - e[1]),
            s = a.reduce((e, [, t]) => e + t, 0) || 1
          return a.map(([e, t], a) => ({
            id: e,
            label: e,
            value: t,
            share: (t / s) * 100,
            color: eo[a % eo.length]
          }))
        }, [e]),
        o = (0, a.useMemo)(() => {
          let t = e
              .map(e => ({ s: e, mv: (0, k.mvOf)(e) ?? 0 }))
              .filter(e => e.mv > 0)
              .sort((e, t) => t.mv - e.mv),
            a = 'all' === l ? t : t.slice(0, l),
            s = a.reduce((e, t) => e + t.mv, 0) || 1
          return a.map((e, t) => ({
            id: e.s.username,
            label: e.s.username,
            value: e.mv,
            share: (e.mv / s) * 100,
            color: eo[t % eo.length]
          }))
        }, [e, l])
      return (0, t.jsxs)(p.ThemedCard, {
        variant: 'panel',
        blur: !0,
        padded: !1,
        className: 'p-4 lg:p-5',
        contentClassName: 'flex h-full flex-col',
        children: [
          (0, t.jsxs)('div', {
            className: 'flex flex-wrap items-center justify-between gap-3',
            children: [
              (0, t.jsx)('h2', {
                className:
                  'text-[16px] font-semibold text-[#2a274e] dark:text-white',
                children:
                  'casino' === s
                    ? 'Casinos by Streamer Market Value'
                    : 'Streamers by Market Value'
              }),
              (0, t.jsxs)('div', {
                className: 'flex w-full items-center gap-2 sm:w-auto',
                children: [
                  'streamer' === s &&
                    (0, t.jsx)('div', {
                      className:
                        'nd-gradient-border-auto relative flex flex-1 items-center gap-0.5 rounded-full dark:bg-white/[0.01] p-1 backdrop-blur-[35.5px] sm:inline-flex sm:flex-none',
                      children: ec.map(e =>
                        (0, t.jsx)(
                          'button',
                          {
                            type: 'button',
                            onClick: () => n(e),
                            className: `flex-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-all sm:flex-none ${
                              l === e
                                ? 'nd-gradient-border bg-[linear-gradient(270deg,#573bd7_0%,#8065ec_24.522%,#9a80f9_50%,#775ce7_75.485%,#573bd7_100%)] dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e] text-white'
                                : 'text-[rgba(42,39,78,0.5)] dark:text-white/50 hover:bg-[rgba(42,39,78,0.04)] dark:hover:bg-white/[0.04] hover:text-[#2a274e] dark:hover:text-white'
                            }`,
                            children: 'all' === e ? 'All' : e
                          },
                          String(e)
                        )
                      )
                    }),
                  (0, t.jsx)('div', {
                    className:
                      'nd-gradient-border-auto relative flex items-center gap-1 rounded-full dark:bg-white/[0.01] p-1 backdrop-blur-[35.5px] max-sm:flex-1 sm:inline-flex',
                    children: ['casino', 'streamer'].map(e =>
                      (0, t.jsxs)(
                        'button',
                        {
                          type: 'button',
                          onClick: () => r(e),
                          title: 'casino' === e ? 'By casino' : 'By streamer',
                          'aria-label':
                            'casino' === e ? 'By casino' : 'By streamer',
                          className: `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium transition-all max-sm:flex-1 sm:px-3 ${
                            s === e
                              ? 'nd-gradient-border bg-[linear-gradient(270deg,#573bd7_0%,#8065ec_24.522%,#9a80f9_50%,#775ce7_75.485%,#573bd7_100%)] dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e] text-white'
                              : 'text-[rgba(42,39,78,0.5)] dark:text-white/50 hover:bg-[rgba(42,39,78,0.04)] dark:hover:bg-white/[0.04] hover:text-[#2a274e] dark:hover:text-white'
                          }`,
                          children: [
                            'casino' === e
                              ? (0, t.jsx)(h.Building2, { size: 13 })
                              : (0, t.jsx)(x.Users, { size: 13 }),
                            (0, t.jsx)('span', {
                              className: 'hidden sm:inline',
                              children:
                                'casino' === e ? 'By casino' : 'By streamer'
                            })
                          ]
                        },
                        e
                      )
                    )
                  })
                ]
              })
            ]
          }),
          (0, t.jsx)('div', {
            className: 'relative mt-2 flex min-h-[420px] flex-1 flex-col',
            children: (0, t.jsx)(j.Watermark, {
              opacity: 0.06,
              logoWidth: 240,
              className: 'flex flex-1 flex-col',
              children: (0, t.jsx)(v.BubbleView, {
                data: 'casino' === s ? i : o,
                isLoading: !1,
                groupBy: 'casino',
                heightClassName: 'min-h-[400px] flex-1',
                ariaContext:
                  'casino' === s
                    ? 'estimated streamer market value by casino'
                    : 'estimated streamer market value',
                valueFormat: e => (0, k.formatMarketValue)(e) ?? '$0',
                renderIcon:
                  'streamer' === s
                    ? (e, a, s) => (0, t.jsx)(ef, { name: a, size: s })
                    : (e, a, s) => (0, t.jsx)(eh, { casinoName: a, size: s })
              })
            })
          })
        ]
      })
    }
    function em ({ value: e, size: a = 13 }) {
      let s = 'Raw' === e,
        r = s ? 'text-[#10b981]' : 'text-[#f59e0b]',
        l = s
          ? (0, t.jsx)(c.DollarSign, { size: a, className: r })
          : (0, t.jsx)(d.Dice5, { size: a, className: r })
      return (0, t.jsxs)('span', {
        className:
          'inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#2a274e] dark:text-white',
        children: [l, e]
      })
    }
    function ex ({ viewers: e }) {
      return (0, t.jsxs)('span', {
        className: 'inline-flex items-center gap-1.5',
        children: [
          (0, t.jsxs)('span', {
            className: 'relative flex size-1.5 shrink-0',
            children: [
              (0, t.jsx)('span', {
                className:
                  'absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f7575f] opacity-40'
              }),
              (0, t.jsx)('span', {
                className:
                  'relative inline-flex size-1.5 rounded-full bg-[#f7575f]',
                style: { boxShadow: '0 0 6px rgba(247,87,95,0.8)' }
              })
            ]
          }),
          (0, t.jsx)('span', {
            className:
              'text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-[#f7575f]',
            children: 'Live'
          }),
          'number' == typeof e &&
            e > 0 &&
            (0, t.jsxs)(t.Fragment, {
              children: [
                (0, t.jsx)('span', {
                  className:
                    'text-[10px] leading-none text-[rgba(42,39,78,0.25)] dark:text-white/25',
                  children: '·'
                }),
                (0, t.jsx)('span', {
                  className:
                    'text-[10px] font-semibold leading-none tabular-nums text-[rgba(42,39,78,0.7)] dark:text-white/70',
                  children: T(e)
                })
              ]
            })
        ]
      })
    }
    function eh ({ casinoName: e, size: a }) {
      return 'free agent' === e.trim().toLowerCase()
        ? (0, t.jsx)('img', {
            src: '/icons/fg-icon.svg',
            alt: '',
            style: { height: 0.85 * a },
            className: 'w-auto shrink-0 opacity-70'
          })
        : (0, t.jsx)(w.AnalyticsCasinoIcon, {
            casinoName: e,
            size: a,
            theme: 'auto'
          })
    }
    function eu ({ name: e, size: a = 16, className: s = '' }) {
      return e &&
        '' !== e.trim() &&
        '—' !== e.trim() &&
        'free agent' !== e.trim().toLowerCase()
        ? (0, t.jsxs)('span', {
            className: `inline-flex min-w-0 items-center gap-1.5 ${s}`,
            children: [
              (0, t.jsx)(w.AnalyticsCasinoIcon, {
                casinoName: e,
                size: a,
                theme: 'auto'
              }),
              (0, t.jsx)('span', { className: 'truncate', children: e })
            ]
          })
        : (0, t.jsxs)('span', {
            className: `inline-flex min-w-0 items-center gap-1.5 ${s}`,
            children: [
              (0, t.jsx)('img', {
                src: '/icons/fg-icon.svg',
                alt: '',
                style: { height: 0.85 * a },
                className: 'w-auto shrink-0 opacity-70'
              }),
              (0, t.jsxs)('span', {
                className:
                  'truncate text-[rgba(42,39,78,0.5)] dark:text-white/50',
                children: [
                  'Free Agent ',
                  (0, t.jsx)('span', {
                    className: 'text-[rgba(42,39,78,0.3)] dark:text-white/30',
                    children: '(no deal currently)'
                  })
                ]
              })
            ]
          })
    }
    function ep () {
      return (0, t.jsxs)('div', {
        className:
          'flex items-center gap-3 text-[11px] text-[rgba(42,39,78,0.4)] dark:text-white/40',
        children: [
          (0, t.jsxs)('span', {
            className: 'inline-flex items-center gap-1',
            children: [
              (0, t.jsx)(c.DollarSign, {
                size: 13,
                className: 'text-[#1fcea6]'
              }),
              ' Raw'
            ]
          }),
          (0, t.jsxs)('span', {
            className: 'inline-flex items-center gap-1',
            children: [
              (0, t.jsx)(d.Dice5, { size: 13, className: 'text-[#f5b83d]' }),
              ' Fake'
            ]
          })
        ]
      })
    }
    function eg ({ streamers: e }) {
      let [s, r] = (0, a.useState)(!1),
        [l, i] = (0, a.useState)(''),
        o = (0, a.useMemo)(() => {
          let t = l.trim().toLowerCase()
          return e.filter(
            e => (!s || e.live) && (!t || e.username.toLowerCase().includes(t))
          )
        }, [e, s, l]),
        c = e.filter(e => e.live).length
      return (0, t.jsxs)(p.ThemedCard, {
        variant: 'panel',
        blur: !0,
        padded: !1,
        className: 'p-4 lg:p-5',
        children: [
          (0, t.jsxs)('div', {
            className: 'flex flex-wrap items-center justify-between gap-3',
            children: [
              (0, t.jsx)(b.Tabs, {
                theme: 'auto',
                tabs: [
                  { id: 'all', label: `All \xb7 ${e.length}` },
                  {
                    id: 'live',
                    label: `Live Now \xb7 ${c}`,
                    leftIcon: (0, t.jsx)('span', {
                      className: 'size-1.5 rounded-full bg-[#f7575f]'
                    })
                  }
                ],
                activeId: s ? 'live' : 'all',
                onChange: e => r('live' === e),
                size: 'sm'
              }),
              (0, t.jsxs)('div', {
                className: 'flex flex-wrap items-center gap-3',
                children: [
                  (0, t.jsx)('span', {
                    className: 'hidden lg:block',
                    children: (0, t.jsx)(ep, {})
                  }),
                  (0, t.jsxs)('div', {
                    className:
                      'flex items-center gap-2 rounded-full border-[0.5px] border-[rgba(42,39,78,0.15)] dark:border-white/15 bg-white/[0.5] dark:bg-white/[0.03] px-3 py-2',
                    children: [
                      (0, t.jsx)(n.Search, {
                        size: 13,
                        className:
                          'text-[rgba(42,39,78,0.4)] dark:text-white/40'
                      }),
                      (0, t.jsx)('input', {
                        value: l,
                        onChange: e => i(e.target.value),
                        placeholder: 'Search streamer…',
                        className:
                          'w-40 bg-transparent text-[12px] text-[rgba(42,39,78,0.8)] dark:text-white/80 placeholder:text-[rgba(42,39,78,0.4)] dark:placeholder:text-white/40 focus:outline-none'
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          0 === o.length
            ? (0, t.jsx)('div', {
                className:
                  'py-12 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40',
                children: 'No streamers match this filter'
              })
            : (0, t.jsx)('div', {
                className:
                  'mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                children: o.map(e => (0, t.jsx)(ew, { s: e }, e.username))
              })
        ]
      })
    }
    function ef ({ name: e, src: a, size: s = 48 }) {
      return (0, t.jsx)(R, { name: e, src: a, size: s })
    }
    function eb ({ label: e, value: a }) {
      return (0, t.jsxs)('div', {
        className: 'flex flex-col gap-0.5',
        children: [
          (0, t.jsx)('span', {
            className:
              'text-[10px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35',
            children: e
          }),
          (0, t.jsx)('span', {
            className:
              'text-[16px] font-semibold text-[#2a274e] dark:text-white',
            children: a
          })
        ]
      })
    }
    function ew ({ s: e }) {
      let a = e.estMonthlyPayment
          ? e.estMonthlyPayment
          : e.leaderboard
          ? 'Leaderboard active'
          : 'No public deal',
        s = (0, k.formatMarketValue)((0, k.mvOf)(e))
      return (0, t.jsxs)(p.ThemedCard, {
        variant: 'glass',
        blur: !0,
        padded: !1,
        className: 'overflow-hidden',
        contentClassName: 'flex h-full flex-col gap-3.5 p-4',
        children: [
          (0, t.jsxs)('div', {
            className: 'flex items-start gap-3',
            children: [
              (0, t.jsxs)('div', {
                className: 'relative',
                children: [
                  (0, t.jsx)(ef, {
                    name: e.username,
                    src: e.avatarUrl,
                    size: 48
                  }),
                  e.live &&
                    (0, t.jsx)('span', {
                      className:
                        'absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#12151f] bg-[#f7575f]'
                    })
                ]
              }),
              (0, t.jsxs)('div', {
                className: 'flex min-w-0 flex-1 flex-col gap-1.5',
                children: [
                  (0, t.jsxs)('div', {
                    className: 'flex items-center gap-1.5',
                    children: [
                      (0, t.jsx)('span', {
                        className:
                          'truncate text-[15px] font-semibold text-[#2a274e] dark:text-white',
                        children: e.username
                      }),
                      e.live
                        ? (0, t.jsx)(ex, { viewers: e.liveViewers })
                        : (0, t.jsx)('span', {
                            className:
                              'shrink-0 text-[10px] font-medium text-[rgba(42,39,78,0.3)] dark:text-white/30',
                            children: 'OFFLINE'
                          })
                    ]
                  }),
                  (0, t.jsxs)('div', {
                    className: 'flex flex-wrap items-center gap-1.5',
                    children: [
                      (0, t.jsx)('span', {
                        className:
                          'inline-flex items-center rounded-full bg-[rgba(42,39,78,0.05)] dark:bg-white/[0.05] px-2 py-0.5 text-[11px] text-[rgba(42,39,78,0.7)] dark:text-white/70',
                        children: (0, t.jsx)(eu, {
                          name: e.currentCasino,
                          size: 14
                        })
                      }),
                      (0, t.jsx)(em, { value: e.rawFake, size: 12 }),
                      (0, t.jsx)(O, { level: e.degen })
                    ]
                  })
                ]
              })
            ]
          }),
          (0, t.jsxs)('div', {
            className:
              'grid grid-cols-2 gap-x-2 gap-y-3 border-t border-[rgba(42,39,78,0.06)] dark:border-white/[0.06] pt-3',
            children: [
              (0, t.jsx)(eb, {
                label: 'Followers',
                value: e.followers > 0 ? T(e.followers) : '—'
              }),
              (0, t.jsx)(eb, {
                label: 'Avg viewers · 30D',
                value: e.avgViewers30d > 0 ? T(e.avgViewers30d) : '—'
              }),
              (0, t.jsxs)('div', {
                className: 'flex flex-col gap-0.5',
                children: [
                  (0, t.jsx)('span', {
                    className:
                      'text-[10px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35',
                    children: 'Deal'
                  }),
                  (0, t.jsx)('span', {
                    className: `truncate text-[15px] font-semibold ${
                      e.estMonthlyPayment || e.leaderboard
                        ? 'text-[#4ad17d]'
                        : 'text-[rgba(42,39,78,0.4)] dark:text-white/40'
                    }`,
                    children: a
                  })
                ]
              }),
              (0, t.jsxs)('div', {
                className: 'flex flex-col gap-0.5',
                children: [
                  (0, t.jsx)('span', {
                    className:
                      'text-[10px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.4)] dark:text-white/35',
                    children: 'Market Value'
                  }),
                  (0, t.jsx)('span', {
                    className:
                      'w-fit bg-gradient-to-r from-[#6c2bd9] via-[#9A80F9] to-[#6c2bd9] dark:from-[#c9bcff] dark:via-white dark:to-[#c9bcff] bg-clip-text text-[16px] font-bold text-transparent [filter:drop-shadow(0_0_10px_rgba(136,116,255,0.25))] dark:[filter:drop-shadow(0_0_10px_rgba(136,116,255,0.5))]',
                    children: s ?? '—'
                  })
                ]
              })
            ]
          }),
          (0, t.jsxs)('div', {
            className:
              'mt-auto flex items-center justify-between gap-2 border-t border-[rgba(42,39,78,0.06)] dark:border-white/[0.06] pt-3',
            children: [
              (0, t.jsx)('span', {
                className:
                  'text-[11px] text-[rgba(42,39,78,0.4)] dark:text-white/35',
                suppressHydrationWarning: !0,
                children: e.live
                  ? 'Live now'
                  : e.lastStreamed
                  ? `Last live ${B(e.lastStreamed)}`
                  : 'No recent stream data'
              }),
              (0, t.jsx)(r.default, {
                href: (0, k.streamerHref)(e.username),
                className:
                  'inline-flex items-center gap-1 rounded-full border-[0.5px] border-white/20 bg-[rgba(142,142,255,0.06)] px-4 py-1.5 text-[12px] font-medium text-[#9A80F9] transition-colors hover:bg-[rgba(142,142,255,0.12)]',
                children: 'Profile'
              })
            ]
          })
        ]
      })
    }
    let ek = ['Overview', 'All Streamers', 'News']
    function ev ({ initial: e, streamers: s }) {
      let [l, n] = (0, a.useState)(e ?? null),
        [i, o] = (0, a.useState)(null),
        [c, d] = (0, a.useState)(null)
      ;(0, a.useEffect)(() => {
        if (e) return
        let t = !0
        return (
          (0, C.getStreamerNews)()
            .then(e => {
              t && n(e)
            })
            .catch(() => {
              t && n([])
            }),
          () => {
            t = !1
          }
        )
      }, [e])
      let m = (0, a.useMemo)(
          () => [...new Set((l ?? []).map(e => e.category))],
          [l]
        ),
        x = (0, a.useMemo)(() => {
          let e = new Map(
            (s ?? []).map(e => [
              e.username.trim().toLowerCase(),
              (0, k.mvOf)(e) ?? 0
            ])
          )
          return [
            ...new Set(
              (l ?? []).flatMap(e => e.streamers?.map(e => e.username) ?? [])
            )
          ].sort(
            (t, a) =>
              (e.get(a.trim().toLowerCase()) ?? 0) -
                (e.get(t.trim().toLowerCase()) ?? 0) || t.localeCompare(a)
          )
        }, [l, s]),
        h = (0, a.useMemo)(
          () =>
            (l ?? []).filter(
              e =>
                (!i || i.has(e.category)) &&
                (!c || e.streamers?.some(e => c.has(e.username)))
            ),
          [l, i, c]
        )
      return null === l
        ? (0, t.jsx)('div', {
            className:
              'py-16 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40',
            children: 'Loading news…'
          })
        : 0 === l.length
        ? (0, t.jsx)('div', {
            className:
              'rounded-2xl border border-[rgba(42,39,78,0.1)] dark:border-white/10 py-16 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40',
            children: 'No streamer news yet — check back soon.'
          })
        : (0, t.jsxs)('div', {
            className: 'flex flex-col gap-4',
            children: [
              (0, t.jsxs)('div', {
                className: 'flex flex-wrap items-center justify-end gap-2',
                children: [
                  (0, t.jsx)(f.Dropdown, {
                    theme: 'auto',
                    multiple: !0,
                    size: 'sm',
                    align: 'right',
                    options: m.map(e => ({ value: e, label: e })),
                    value: i,
                    onChange: o,
                    allLabel: 'All Categories',
                    noun: 'Category'
                  }),
                  x.length > 0 &&
                    (0, t.jsx)(f.Dropdown, {
                      theme: 'auto',
                      multiple: !0,
                      searchable: !0,
                      size: 'sm',
                      align: 'right',
                      className:
                        'min-w-0 flex-1 [&>button]:w-full [&>button]:justify-between sm:flex-none sm:[&>button]:w-auto sm:[&>button]:justify-start',
                      options: x.map(e => ({ value: e, label: e })),
                      renderIcon: (e, a) => (0, t.jsx)(R, { name: e, size: a }),
                      value: c,
                      onChange: d,
                      allLabel: 'All Streamers',
                      noun: 'Streamer'
                    })
                ]
              }),
              0 === h.length
                ? (0, t.jsx)('div', {
                    className:
                      'rounded-2xl border border-[rgba(42,39,78,0.1)] dark:border-white/10 py-16 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40',
                    children: 'No articles match these filters.'
                  })
                : (0, t.jsx)('div', {
                    className:
                      'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
                    children: h.map(e => {
                      let a = C.CATEGORY_ACCENT[e.category] ?? '#8874ff'
                      return (0, t.jsxs)(
                        r.default,
                        {
                          href: `/streamers/news/${e.slug}`,
                          className:
                            'group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[20px] ring-1 ring-white/[0.08] transition-all hover:ring-white/20',
                          children: [
                            e.coverImageUrl
                              ? (0, t.jsxs)(t.Fragment, {
                                  children: [
                                    (0, t.jsx)('img', {
                                      src: e.coverImageUrl,
                                      alt: '',
                                      className:
                                        'absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]'
                                    }),
                                    (0, t.jsx)('div', {
                                      className: 'absolute inset-0',
                                      style: {
                                        background: `radial-gradient(90% 80% at 85% 15%, ${a}30, transparent 55%)`
                                      }
                                    })
                                  ]
                                })
                              : (0, t.jsx)('div', {
                                  className:
                                    'absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]',
                                  style: { background: eS(a) }
                                }),
                            (0, t.jsx)('div', {
                              className:
                                'pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a12] via-[#080a12]/55 to-[#080a12]/10'
                            }),
                            (0, t.jsx)('div', {
                              className:
                                'pointer-events-none absolute inset-x-0 top-0 h-px',
                              style: {
                                background: `linear-gradient(90deg, transparent, ${a}88, transparent)`
                              }
                            }),
                            e.breaking &&
                              (0, t.jsx)('span', {
                                className:
                                  'absolute left-4 top-4 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-red-600/30',
                                children: 'Breaking'
                              }),
                            (0, t.jsxs)('div', {
                              className: 'relative flex flex-col gap-1.5 p-4',
                              children: [
                                (0, t.jsx)('h2', {
                                  className:
                                    'text-[15px] font-semibold leading-tight text-white line-clamp-2',
                                  children: e.title
                                }),
                                e.excerpt &&
                                  (0, t.jsx)('p', {
                                    className:
                                      'text-[13px] leading-relaxed text-white/60 line-clamp-2',
                                    children: e.excerpt
                                  }),
                                (0, t.jsx)('div', {
                                  className:
                                    'mt-1.5 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-2.5',
                                  children: (0, t.jsx)('span', {
                                    className:
                                      'text-[10px] font-semibold uppercase tracking-[0.16em]',
                                    style: { color: a, opacity: 0.85 },
                                    children: e.category
                                  })
                                })
                              ]
                            })
                          ]
                        },
                        e.id
                      )
                    })
                  })
            ]
          })
    }
    function ej ({ onQuery: e }) {
      let [s, r] = (0, a.useState)('')
      return (0, t.jsxs)('div', {
        className: 'relative w-full max-w-[340px]',
        children: [
          (0, t.jsx)(n.Search, {
            size: 15,
            className:
              'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(42,39,78,0.4)] dark:text-white/35'
          }),
          (0, t.jsx)('input', {
            type: 'text',
            value: s,
            onChange: t => {
              r(t.target.value), e(t.target.value)
            },
            placeholder: 'Search streamers…',
            className:
              'w-full rounded-full border border-[rgba(42,39,78,0.1)] dark:border-white/10 bg-white/[0.5] dark:bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-[13px] text-[#2a274e] dark:text-white outline-none placeholder:text-[rgba(42,39,78,0.3)] dark:placeholder:text-white/30 focus:border-[#8874ff]/60'
          })
        ]
      })
    }
    let eN = [
      {
        key: 'kick',
        label: 'Kick link',
        placeholder: 'https://kick.com/streamer',
        hosts: ['kick.com']
      },
      {
        key: 'x',
        label: 'X link',
        placeholder: 'https://x.com/streamer',
        hosts: ['x.com', 'twitter.com']
      },
      {
        key: 'discord',
        label: 'Discord link',
        placeholder: 'https://discord.gg/invite',
        hosts: ['discord.gg', 'discord.com']
      },
      {
        key: 'twitch',
        label: 'Twitch link',
        placeholder: 'https://twitch.tv/streamer',
        hosts: ['twitch.tv']
      }
    ]
    function ey ({ query: e }) {
      let [r, l] = (0, a.useState)(!1),
        [n, i] = (0, a.useState)(e),
        [o, c] = (0, a.useState)({ kick: '', x: '', discord: '', twitch: '' }),
        [d, m] = (0, a.useState)(!1),
        [x, h] = (0, a.useState)(''),
        [u, p] = (0, a.useState)('idle')
      ;(0, a.useEffect)(() => {
        if (!r) return
        let e = e => {
          'Escape' === e.key && l(!1)
        }
        return (
          document.addEventListener('keydown', e),
          () => document.removeEventListener('keydown', e)
        )
      }, [r])
      let g = e => {
          let t = o[e].trim()
          return t
            ? !(function (e, t) {
                try {
                  let a = new URL(/^https?:\/\//i.test(e) ? e : `https://${e}`),
                    s = a.hostname.toLowerCase().replace(/^www\./, '')
                  return (
                    t.some(e => s === e) &&
                    a.pathname.replace(/\/+$/, '').length > 1
                  )
                } catch {
                  return !1
                }
              })(t, eN.find(t => t.key === e).hosts)
              ? 'invalid'
              : 'valid'
            : 'empty'
        },
        f = 'valid' === g('kick'),
        b = eN.every(e => 'invalid' !== g(e.key)),
        w = n.trim().length >= 2 && f && b && 'sending' !== u,
        k = async () => {
          p('sending')
          try {
            let e = eN
                .filter(e => 'valid' === g(e.key))
                .map(e => o[e.key].trim())
                .join(' · '),
              t = await fetch(`${N.API_URL}/api/streamers/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: n.trim(),
                  links: e,
                  message: x.trim()
                })
              })
            p(t.ok ? 'done' : 'error')
          } catch {
            p('error')
          }
        },
        v = e =>
          `w-full rounded-xl border bg-white/[0.5] dark:bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-[#2a274e] dark:text-white outline-none placeholder:text-[rgba(42,39,78,0.3)] dark:placeholder:text-white/30 transition-colors ${
            'invalid' === e
              ? 'border-red-500/60 focus:border-red-400'
              : 'valid' === e
              ? 'border-[#3ddc97]/40 focus:border-[#3ddc97]/70'
              : 'border-[rgba(42,39,78,0.1)] dark:border-white/10 focus:border-[#8874ff]/60'
          }`
      return (0, t.jsxs)('div', {
        className: 'mx-auto max-w-md py-10 text-center',
        children: [
          (0, t.jsxs)('p', {
            className:
              'text-[14px] text-[rgba(42,39,78,0.6)] dark:text-white/60',
            children: [
              'No streamers found',
              e
                ? (0, t.jsxs)(t.Fragment, {
                    children: [
                      ' for ',
                      (0, t.jsxs)('span', {
                        className: 'font-medium text-[#2a274e] dark:text-white',
                        children: ['“', e, '”']
                      })
                    ]
                  })
                : null,
              '.'
            ]
          }),
          (0, t.jsx)('button', {
            type: 'button',
            onClick: () => {
              l(!0), 'error' === u && p('idle')
            },
            className:
              'nd-gradient-border mt-4 inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(270deg,#573bd7_0%,#8065ec_24.522%,#9a80f9_50%,#775ce7_75.485%,#573bd7_100%)] dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e] px-5 py-2.5 text-[13px] font-medium text-white backdrop-blur-[35.5px] transition-all hover:brightness-110',
            children: 'Request a streamer to be tracked by FairGambling'
          }),
          r &&
            (0, s.createPortal)(
              (0, t.jsxs)('div', {
                className:
                  'fixed inset-0 z-[300] flex items-center justify-center p-4',
                role: 'dialog',
                'aria-modal': 'true',
                children: [
                  (0, t.jsx)('div', {
                    className: 'absolute inset-0 bg-black/70 backdrop-blur-md',
                    onClick: () => l(!1)
                  }),
                  (0, t.jsx)('div', {
                    className:
                      'nd-gradient-border relative w-full max-w-[440px] rounded-2xl bg-[#10131f] p-5 text-left shadow-2xl',
                    children:
                      'done' === u
                        ? (0, t.jsxs)('div', {
                            className: 'py-6 text-center',
                            children: [
                              (0, t.jsx)('p', {
                                className:
                                  'text-[15px] font-semibold text-[#2a274e] dark:text-white',
                                children: 'Request sent 🎉'
                              }),
                              (0, t.jsx)('p', {
                                className:
                                  'mt-1.5 text-[12.5px] leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/45',
                                children:
                                  "Our team reviews every request — if the streamer checks out, they'll show up here soon."
                              }),
                              (0, t.jsx)('button', {
                                type: 'button',
                                onClick: () => l(!1),
                                className:
                                  'mt-4 rounded-full bg-[rgba(42,39,78,0.06)] dark:bg-white/[0.06] px-5 py-2 text-[12.5px] font-medium text-[rgba(42,39,78,0.7)] dark:text-white/70 hover:bg-white/[0.1] hover:text-[#2a274e] dark:hover:text-[#2a274e] dark:text-white',
                                children: 'Close'
                              })
                            ]
                          })
                        : (0, t.jsxs)(t.Fragment, {
                            children: [
                              (0, t.jsx)('h3', {
                                className:
                                  'text-[15px] font-semibold text-[#2a274e] dark:text-white',
                                children: 'Request a Streamer'
                              }),
                              (0, t.jsx)('p', {
                                className:
                                  'mt-1 text-[12px] leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/45',
                                children:
                                  "Tell us who's missing — a valid Kick link is all we need."
                              }),
                              (0, t.jsxs)('div', {
                                className: 'mt-4 flex flex-col gap-2.5',
                                children: [
                                  (0, t.jsx)('input', {
                                    type: 'text',
                                    value: n,
                                    onChange: e => i(e.target.value),
                                    placeholder: 'Streamer name',
                                    maxLength: 120,
                                    className: v('empty')
                                  }),
                                  (d ? eN : eN.slice(0, 1)).map(e => {
                                    let a = g(e.key)
                                    return (0, t.jsxs)(
                                      'div',
                                      {
                                        children: [
                                          (0, t.jsx)('input', {
                                            type: 'url',
                                            value: o[e.key],
                                            onChange: t =>
                                              c(a => ({
                                                ...a,
                                                [e.key]: t.target.value
                                              })),
                                            placeholder: e.placeholder,
                                            maxLength: 200,
                                            className: v(a)
                                          }),
                                          'invalid' === a &&
                                            (0, t.jsxs)('p', {
                                              className:
                                                'mt-1 pl-1 text-[11px] text-red-400',
                                              children: [
                                                'Not a valid ',
                                                e.label.replace(' link', ''),
                                                ' profile URL'
                                              ]
                                            })
                                        ]
                                      },
                                      e.key
                                    )
                                  }),
                                  !d &&
                                    (0, t.jsx)('button', {
                                      type: 'button',
                                      onClick: () => m(!0),
                                      className:
                                        'self-start text-[12px] font-medium text-[#8874ff] hover:text-[#a99bff]',
                                      children:
                                        '+ Add more socials (X, Discord, Twitch)'
                                    }),
                                  (0, t.jsx)('textarea', {
                                    value: x,
                                    onChange: e => h(e.target.value),
                                    placeholder:
                                      'Why should we track them? (optional)',
                                    maxLength: 2e3,
                                    rows: 3,
                                    className:
                                      'w-full resize-none rounded-xl border border-[rgba(42,39,78,0.1)] dark:border-white/10 bg-white/[0.5] dark:bg-white/[0.03] px-3.5 py-2.5 text-[13px] text-[#2a274e] dark:text-white outline-none placeholder:text-[rgba(42,39,78,0.3)] dark:placeholder:text-white/30 focus:border-[#8874ff]/60'
                                  }),
                                  'error' === u &&
                                    (0, t.jsx)('p', {
                                      className: 'text-[12px] text-red-400',
                                      children:
                                        'Could not send — please try again in a moment.'
                                    }),
                                  (0, t.jsxs)('p', {
                                    className:
                                      'text-[12px] leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/45',
                                    children: [
                                      'Are you a streamer? Reach out to',
                                      ' ',
                                      (0, t.jsx)('a', {
                                        href: 'https://x.com/DegenHighs',
                                        target: '_blank',
                                        rel: 'noopener noreferrer',
                                        className:
                                          'font-medium text-[#8874ff] hover:underline',
                                        children: '@DegenHighs'
                                      }),
                                      ' ',
                                      'on X to get fast-tracked.'
                                    ]
                                  }),
                                  (0, t.jsxs)('div', {
                                    className:
                                      'mt-1 flex items-center justify-end gap-2',
                                    children: [
                                      (0, t.jsx)('button', {
                                        type: 'button',
                                        onClick: () => l(!1),
                                        className:
                                          'rounded-full px-4 py-2 text-[12.5px] font-medium text-[rgba(42,39,78,0.5)] dark:text-white/50 hover:text-[#2a274e] dark:hover:text-[#2a274e] dark:text-white',
                                        children: 'Cancel'
                                      }),
                                      (0, t.jsx)('button', {
                                        type: 'button',
                                        disabled: !w,
                                        onClick: () => void k(),
                                        className:
                                          'nd-gradient-border inline-flex items-center rounded-full bg-[linear-gradient(270deg,#573bd7_0%,#8065ec_24.522%,#9a80f9_50%,#775ce7_75.485%,#573bd7_100%)] dark:bg-gradient-to-l dark:from-[#2a274e] dark:via-[#454181] dark:to-[#2a274e] px-5 py-2 text-[12.5px] font-medium text-white backdrop-blur-[35.5px] transition-all hover:brightness-110 disabled:opacity-50',
                                        children:
                                          'sending' === u
                                            ? 'Sending…'
                                            : 'Send request'
                                      })
                                    ]
                                  })
                                ]
                              })
                            ]
                          })
                  })
                ]
              }),
              document.body
            )
        ]
      })
    }
    function eC ({ open: e, onClose: r }) {
      return ((0, a.useEffect)(() => {
        if (e)
          return (
            (document.documentElement.style.overflow = 'hidden'),
            () => {
              document.documentElement.style.overflow = ''
            }
          )
      }, [e]),
      !e || 'u' < typeof document)
        ? null
        : (0, s.createPortal)(
            (0, t.jsx)('div', {
              className:
                'fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[10px]',
              onClick: r,
              children: (0, t.jsxs)('div', {
                className:
                  'relative w-full max-w-2xl rounded-3xl border border-[rgba(42,39,78,0.15)] dark:border-white/15 bg-gradient-to-br from-[#1a1f3a] via-[#0e111b] to-[#0a0d15] p-8 shadow-2xl backdrop-blur-[35.5px]',
                onClick: e => e.stopPropagation(),
                children: [
                  (0, t.jsx)('button', {
                    onClick: r,
                    className:
                      'absolute right-4 top-4 text-[rgba(42,39,78,0.4)] dark:text-white/40 hover:text-[#2a274e] dark:text-white transition-colors',
                    children: '✕'
                  }),
                  (0, t.jsx)('h2', {
                    className:
                      'mb-8 text-3xl font-bold text-[#2a274e] dark:text-white',
                    children: 'How Market Value is Calculated'
                  }),
                  (0, t.jsxs)('div', {
                    className: 'space-y-5',
                    children: [
                      (0, t.jsxs)('div', {
                        className:
                          'nd-gradient-border rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-[20px]',
                        children: [
                          (0, t.jsx)('h3', {
                            className:
                              'mb-4 text-sm font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.8)] dark:text-white/80',
                            children: 'Base Components'
                          }),
                          (0, t.jsxs)('div', {
                            className: 'space-y-3 text-sm',
                            children: [
                              (0, t.jsxs)('div', {
                                className: 'flex justify-between items-center',
                                children: [
                                  (0, t.jsx)('span', {
                                    className:
                                      'text-[rgba(42,39,78,0.7)] dark:text-white/70',
                                    children: 'Streamer Pay (75%)'
                                  }),
                                  (0, t.jsx)('span', {
                                    className: 'font-semibold text-[#a78bfa]',
                                    children: '7.5x monthly payment'
                                  })
                                ]
                              }),
                              (0, t.jsxs)('div', {
                                className: 'flex justify-between items-center',
                                children: [
                                  (0, t.jsx)('span', {
                                    className:
                                      'text-[rgba(42,39,78,0.7)] dark:text-white/70',
                                    children: 'Top 5 Wager (8%)'
                                  }),
                                  (0, t.jsx)('span', {
                                    className: 'font-semibold text-[#06b6d4]',
                                    children: '20% of Top 5 Wager'
                                  })
                                ]
                              }),
                              (0, t.jsxs)('div', {
                                className: 'flex justify-between items-center',
                                children: [
                                  (0, t.jsx)('span', {
                                    className:
                                      'text-[rgba(42,39,78,0.7)] dark:text-white/70',
                                    children: 'Leaderboard (9%)'
                                  }),
                                  (0, t.jsx)('span', {
                                    className: 'font-semibold text-[#10b981]',
                                    children: '15x monthly amount'
                                  })
                                ]
                              }),
                              (0, t.jsxs)('div', {
                                className: 'flex justify-between items-center',
                                children: [
                                  (0, t.jsx)('span', {
                                    className:
                                      'text-[rgba(42,39,78,0.7)] dark:text-white/70',
                                    children: 'Avg Viewers (6%)'
                                  }),
                                  (0, t.jsx)('span', {
                                    className: 'font-semibold text-[#fbbf24]',
                                    children: '$200 per viewer'
                                  })
                                ]
                              }),
                              (0, t.jsxs)('div', {
                                className: 'flex justify-between items-center',
                                children: [
                                  (0, t.jsx)('span', {
                                    className:
                                      'text-[rgba(42,39,78,0.7)] dark:text-white/70',
                                    children: 'Peak Viewers (2%)'
                                  }),
                                  (0, t.jsx)('span', {
                                    className: 'font-semibold text-[#f59e0b]',
                                    children: '$25 per peak viewer'
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      }),
                      (0, t.jsxs)('div', {
                        className:
                          'nd-gradient-border rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-[20px]',
                        children: [
                          (0, t.jsx)('h3', {
                            className:
                              'mb-4 text-sm font-semibold uppercase tracking-wide text-[rgba(42,39,78,0.8)] dark:text-white/80',
                            children: 'Penalties'
                          }),
                          (0, t.jsxs)('div', {
                            className: 'space-y-3 text-sm',
                            children: [
                              (0, t.jsxs)('div', {
                                className: 'flex justify-between items-center',
                                children: [
                                  (0, t.jsx)('span', {
                                    className:
                                      'text-[rgba(42,39,78,0.7)] dark:text-white/70',
                                    children: 'Loyalty Penalty'
                                  }),
                                  (0, t.jsx)('span', {
                                    className: 'font-semibold text-[#ff6b6b]',
                                    children:
                                      '-2% per switch in last 12 mo (max 3)'
                                  })
                                ]
                              }),
                              (0, t.jsxs)('div', {
                                className: 'flex justify-between items-center',
                                children: [
                                  (0, t.jsx)('span', {
                                    className:
                                      'text-[rgba(42,39,78,0.7)] dark:text-white/70',
                                    children: 'Non-English Penalty'
                                  }),
                                  (0, t.jsx)('span', {
                                    className: 'font-semibold text-[#ff6b6b]',
                                    children: '-30% reduction'
                                  })
                                ]
                              })
                            ]
                          })
                        ]
                      }),
                      (0, t.jsx)('p', {
                        className:
                          'text-xs text-[rgba(42,39,78,0.4)] dark:text-white/40 pt-2',
                        children:
                          'Market Value is updated daily and represents the estimated annual deal value based on streaming activity, audience, and engagement metrics.'
                      })
                    ]
                  }),
                  (0, t.jsx)('button', {
                    onClick: r,
                    className:
                      'mt-8 w-full rounded-full bg-gradient-to-r from-[#8874ff] to-[#6366f1] py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity',
                    children: 'Close'
                  })
                ]
              })
            }),
            document.body
          )
    }
    let eS = e =>
      `radial-gradient(120% 90% at 18% 12%, ${e}3d, transparent 55%), radial-gradient(90% 80% at 90% 100%, ${e}2b, transparent 50%), linear-gradient(155deg, #161a2b 0%, #0c0f19 70%)`
    function eM ({
      n: e,
      featured: a,
      onSelect: s,
      cycleKey: r,
      className: n = '',
      z: i = 1,
      slide: o,
      progressActive: c
    }) {
      let d = (0, l.useRouter)()
      return (0, t.jsxs)('div', {
        onClick: s,
        role: 'button',
        tabIndex: 0,
        style: o
          ? void 0
          : { flexGrow: a ? 2.6 : 1, flexBasis: 0, zIndex: a ? 30 : i },
        className: `group relative flex h-full min-h-[300px] cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] ring-1 ring-white/[0.08] transition-[flex-grow,box-shadow] duration-[900ms] ease-out hover:ring-white/20 ${n}`,
        children: [
          e.image
            ? (0, t.jsxs)(t.Fragment, {
                children: [
                  (0, t.jsx)('img', {
                    src: e.image,
                    alt: '',
                    className:
                      'absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]'
                  }),
                  (0, t.jsx)('div', {
                    className: 'absolute inset-0',
                    style: {
                      background: `radial-gradient(90% 80% at 85% 15%, ${e.accent}30, transparent 55%)`
                    }
                  })
                ]
              })
            : (0, t.jsx)('div', {
                className:
                  'absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]',
                style: { background: eS(e.accent) }
              }),
          (0, t.jsx)('div', {
            className:
              'pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a12] via-[#080a12]/55 to-[#080a12]/10'
          }),
          (0, t.jsx)('div', {
            className: 'pointer-events-none absolute inset-x-0 top-0 h-px',
            style: {
              background: `linear-gradient(90deg, transparent, ${e.accent}88, transparent)`
            }
          }),
          e.breaking &&
            (0, t.jsx)('span', {
              className:
                'absolute left-4 top-4 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-red-600/30',
              children: 'Breaking'
            }),
          (0, t.jsxs)('div', {
            className: `relative flex flex-col ${
              a ? 'gap-2 p-6' : 'gap-1.5 p-4'
            }`,
            children: [
              (0, t.jsx)('span', {
                className:
                  'mb-1 block h-[3px] w-16 overflow-hidden rounded-full bg-white/15',
                children:
                  (c ?? a) &&
                  (0, t.jsx)(
                    'span',
                    {
                      className:
                        'block h-full w-full origin-left rounded-full bg-white/90',
                      style: { animation: 'fgNewsFill 7500ms linear forwards' }
                    },
                    r
                  )
              }),
              (0, t.jsx)('h3', {
                className: `font-semibold leading-tight text-white ${
                  a ? 'text-[22px]' : 'text-[14px] line-clamp-3'
                }`,
                children: e.title
              }),
              a &&
                (0, t.jsx)('p', {
                  className:
                    'max-w-md text-[13px] leading-relaxed text-white/60',
                  children: e.excerpt
                }),
              (0, t.jsxs)('div', {
                className: `flex items-center justify-between gap-2 border-t border-white/[0.08] ${
                  a ? 'mt-2.5 pt-3' : 'mt-1.5 pt-2.5'
                }`,
                children: [
                  (0, t.jsx)('span', {
                    className:
                      'text-[10px] font-semibold uppercase tracking-[0.16em]',
                    style: { color: e.accent, opacity: 0.85 },
                    children: e.category
                  }),
                  a &&
                    (0, t.jsx)(g.Button, {
                      variant: 'ghost',
                      size: 'sm',
                      rightIcon: (0, t.jsx)(m.ArrowUpRight, {}),
                      className: 'shrink-0',
                      onClick: t => {
                        t.stopPropagation(), d.push(e.href)
                      },
                      children: 'Read more'
                    })
                ]
              })
            ]
          })
        ]
      })
    }
    function e$ () {
      let [e, s] = (0, a.useState)(null),
        [r, l] = (0, a.useState)(0),
        [n, i] = (0, a.useState)(0)
      ;(0, a.useEffect)(() => {
        let e = !0
        return (
          (0, C.getStreamerNews)()
            .then(async t => {
              let a = [...t].sort(
                  (e, t) => Number(t.breaking) - Number(e.breaking)
                ),
                r = await M(a, 4)
              e &&
                (s(
                  r.map(e => ({
                    id: String(e.id),
                    category: e.category,
                    title: e.title,
                    excerpt: e.excerpt ?? '',
                    href: `/streamers/news/${e.slug}`,
                    accent: C.CATEGORY_ACCENT[e.category] ?? '#8874ff',
                    image: e.coverImageUrl,
                    breaking: e.breaking
                  }))
                ),
                l(0))
            })
            .catch(() => {
              e && s([])
            }),
          () => {
            e = !1
          }
        )
      }, []),
        (0, a.useEffect)(() => {
          if (!e || e.length <= 1) return
          let t = setInterval(() => l(t => (t + 1) % e.length), 7500)
          return () => clearInterval(t)
        }, [n, e])
      let o = e => {
          l(e), i(e => e + 1)
        },
        c = `${r}-${n}`,
        d = (0, a.useRef)(null)
      return ((0, a.useEffect)(() => {
        let e = d.current
        if (!e) return
        let t = r * (e.clientWidth + 12)
        Math.abs(e.scrollLeft - t) > 4 &&
          e.scrollTo({ left: t, behavior: 'smooth' })
      }, [r]),
      null === e)
        ? (0, t.jsxs)('div', {
            className: 'flex flex-col gap-3.5',
            children: [
              (0, t.jsx)('div', {
                className:
                  'flex flex-col gap-3 sm:h-[300px] sm:flex-row sm:items-stretch',
                children: [2.6, 1, 1, 1].map((e, a) =>
                  (0, t.jsx)(
                    'div',
                    {
                      style: { flexGrow: e, flexBasis: 0 },
                      className: `min-h-[300px] animate-pulse rounded-[20px] bg-[rgba(42,39,78,0.04)] dark:bg-white/[0.04] ring-1 ring-white/[0.06] ${
                        a > 0 ? 'hidden sm:block' : ''
                      }`
                    },
                    a
                  )
                )
              }),
              (0, t.jsx)('div', {
                className: 'flex items-center justify-center gap-2',
                children: [0, 1, 2, 3].map(e =>
                  (0, t.jsx)(
                    'span',
                    {
                      className:
                        'size-1.5 rounded-full bg-[rgba(42,39,78,0.1)] dark:bg-white/10'
                    },
                    e
                  )
                )
              })
            ]
          })
        : 0 === e.length
        ? null
        : (0, t.jsxs)('div', {
            className: 'flex flex-col gap-3.5',
            children: [
              (0, t.jsx)('style', {
                children:
                  '@keyframes fgNewsFill { from { transform: scaleX(0) } to { transform: scaleX(1) } }'
              }),
              (0, t.jsx)('div', {
                ref: d,
                onScroll: () => {
                  let t = d.current
                  if (!t || !e) return
                  let a = Math.round(t.scrollLeft / (t.clientWidth + 12))
                  a !== r && a >= 0 && a < e.length && (l(a), i(e => e + 1))
                },
                className:
                  'scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto sm:hidden',
                children: e.map((e, a) =>
                  (0, t.jsx)(
                    'div',
                    {
                      className: 'w-full shrink-0 snap-center',
                      children: (0, t.jsx)(eM, {
                        n: e,
                        featured: !0,
                        slide: !0,
                        progressActive: a === r,
                        cycleKey: c
                      })
                    },
                    e.id
                  )
                )
              }),
              (0, t.jsx)('div', {
                className:
                  'hidden h-[300px] gap-3 [contain:layout] sm:flex sm:items-stretch',
                children: e.map((e, a) =>
                  (0, t.jsx)(
                    eM,
                    {
                      n: e,
                      featured: a === r,
                      onSelect: () => o(a),
                      cycleKey: c
                    },
                    e.id
                  )
                )
              }),
              (0, t.jsx)('div', {
                className: 'flex items-center justify-center gap-2',
                children: e.map((e, a) =>
                  (0, t.jsx)(
                    'button',
                    {
                      type: 'button',
                      onClick: () => o(a),
                      'aria-label': `News ${a + 1}`,
                      className: `h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
                        a === r
                          ? 'w-8 bg-gradient-to-r from-[#8874ff] to-[#6366f1] shadow-[0_0_10px_rgba(136,116,255,0.35)]'
                          : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`
                    },
                    a
                  )
                )
              })
            ]
          })
    }
    function eL ({ streamers: e }) {
      let a = (0, l.useRouter)()
      return (0, t.jsxs)('div', {
        className: 'flex flex-col gap-6',
        children: [
          (0, t.jsxs)('div', {
            className: 'flex items-center justify-between gap-3',
            children: [
              (0, t.jsx)('h2', {
                className:
                  'text-[15px] font-semibold text-[rgba(42,39,78,0.9)] dark:text-white/90',
                children: 'Latest Streamer News'
              }),
              (0, t.jsx)(g.Button, {
                theme: 'auto',
                variant: 'ghost',
                size: 'sm',
                rightIcon: (0, t.jsx)(m.ArrowUpRight, {}),
                onClick: () => a.push('/streamers/news'),
                children: 'View All'
              })
            ]
          }),
          (0, t.jsx)(e$, {}),
          (0, t.jsx)(Y, { streamers: e }),
          (0, t.jsxs)('div', {
            className: 'grid grid-cols-1 gap-6 lg:grid-cols-2',
            children: [
              (0, t.jsx)(ei, { streamers: e }),
              (0, t.jsx)(ed, { streamers: e })
            ]
          })
        ]
      })
    }
    e.s(
      [
        'CasinoTag',
        0,
        eu,
        'DegenBadge',
        0,
        O,
        'LiveBadge',
        0,
        ex,
        'MoneyLegend',
        0,
        ep,
        'MoneyTypeBadge',
        0,
        em,
        'PlatformLogo',
        0,
        function ({ platform: e, height: a = 12, className: s = '' }) {
          return 'kick' === (e || '').toLowerCase()
            ? (0, t.jsx)('img', {
                src: '/logos/platforms/kick.svg',
                alt: 'Kick',
                style: { height: a },
                className: `w-auto shrink-0 ${s}`
              })
            : (0, t.jsx)('span', { children: e })
        },
        'StreamerAvatar',
        0,
        R,
        'StreamerCasinoIcon',
        0,
        eh,
        'StreamersView',
        0,
        function ({
          liveStats: e,
          liveNow: s,
          profiles: r,
          casinoLogos: n,
          initialPage: i = 'Overview',
          newsArticles: o
        }) {
          ;(0, $.registerRemoteCasinoLogos)(n)
          let c = (0, l.useRouter)(),
            [d, m] = (0, a.useState)(i),
            x = 'News' === i,
            h = (0, a.useMemo)(
              () =>
                (0, k.mergeLiveStats)(
                  (0, k.mergeDbProfiles)(k.ALL_STREAMERS, r),
                  e,
                  s
                ),
              [e, s, r]
            )
          return (0, t.jsxs)('div', {
            className: 'flex flex-col gap-6',
            children: [
              (0, t.jsx)(b.Tabs, {
                theme: 'auto',
                tabs: ek.map(e => ({ id: e, label: e })),
                activeId: d,
                onChange: e => {
                  'News' !== e || x
                    ? 'News' !== e && x
                      ? c.push(
                          'All Streamers' === e
                            ? '/streamers?tab=all'
                            : '/streamers'
                        )
                      : m(e)
                    : c.push('/streamers/news')
                },
                fill: !0,
                size: 'md',
                sizeConfig: b.NAV_TABS_SIZE_CONFIG,
                className: 'flex w-full sm:inline-flex sm:w-fit'
              }),
              'News' === d
                ? (0, t.jsx)(ev, { initial: o, streamers: h })
                : 'All Streamers' === d
                ? (0, t.jsx)(eg, { streamers: h })
                : (0, t.jsx)(eL, { streamers: h })
            ]
          })
        },
        'pfpUrl',
        0,
        D
      ],
      818036
    )
  }