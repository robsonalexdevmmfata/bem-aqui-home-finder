# BEM AQUI IMÓVEIS — Roadmap

## Done
- [x] Backend: full schema (profiles, roles, agencies, brokers, properties + images/videos/features, favorites, leads, proposals, negotiations, partnerships, notifications, simulations, analyses, valuations, activity logs, banners, partners, testimonials, reports), access rules, automatic notifications and logs
- [x] 3 demo accounts (pw 123456): admin@bemaqui.com, corretor@bemaqui.com, cliente@bemaqui.com — sign-in verified
- [x] Demo data (13 fictitious properties, leads, proposals, favorites, views)
- [x] Brand design system, logo, header/footer/WhatsApp button, notification bell
- [x] Finance engine (SAC/PRICE, valuation, investment) with tests

## Open (next turn)
- [ ] Root wiring (fonts, AuthProvider, Toaster, titles) + home page at /
- [ ] /auth (login, signup with LGPD consent, password reset), /reset-password
- [ ] Public: /imoveis, /comprar, /alugar, /imovel/$slug, /anunciar, /investir, /simulador, /valorizacao, /analise-investimento, /contato, /corretores, /privacidade
- [ ] Client area /conta (profile, LGPD export/delete, favorites, proposals, notifications)
- [ ] Broker panel /painel (dashboard, property CRUD + photo upload, leads, proposals/negotiation, reports PDF, partnerships)
- [ ] Admin /admin (dashboard, users, approvals, ads, categories, content, reports, logs, integrations)
- [ ] Realtime for notifications; end-to-end test of main flows
- [ ] Ask user: real WhatsApp number, Google Maps / Analytics keys
