# BEM AQUI IMÓVEIS — Roadmap

## Done
- [x] Backend: full schema (profiles, roles, agencies, brokers, properties + images/videos/features, favorites, leads, proposals, negotiations, partnerships, notifications, simulations, analyses, valuations, activity logs, banners, partners, testimonials, reports), access rules, automatic notifications and logs
- [x] 3 demo accounts (pw 123456): admin@bemaqui.com, corretor@bemaqui.com, cliente@bemaqui.com — sign-in verified
- [x] Demo data (13 fictitious properties, leads, proposals, favorites, views)
- [x] Brand design system, logo, header/footer/WhatsApp button, notification bell
- [x] Finance engine (SAC/PRICE, valuation, investment) with tests

## Done (frontend MVP)
- [x] Move `wip/` into `src/` (header, footer, menu, auth hook, protected layout)
- [x] Root wiring (fonts, AuthProvider, Toaster, titles) + home page at /
- [x] /auth (login, signup with LGPD consent, password reset), /reset-password
- [x] Public: /imoveis, /comprar, /alugar, /imovel/$slug, /anunciar, /investir, /simulador, /valorizacao, /analise-investimento, /contato, /corretores, /privacidade
- [x] Client area /conta (profile, favorites, proposals, notifications)
- [x] Broker panel /painel (dashboard, property list/create/edit, leads, proposals)
- [x] Admin /admin (dashboard, users, property approvals)

## Done (próxima leva)
- [x] Photo upload (`property-media` + fallback mock URL) + formulário completo de imóvel
- [x] Relatórios PDF/print + export JSON no painel
- [x] LGPD export/delete em /conta/privacidade
- [x] Admin categorias + banners (com fallback mock)
- [x] Patch `unenv` no postinstall/build para Nitro

## Open (next turn)
- [ ] Partnerships UI / PDF branding avançado
- [ ] Admin: logs, integrations settings
- [ ] Realtime polish; end-to-end test of main flows
- [ ] Ask user: real WhatsApp number, Google Maps / Analytics keys
