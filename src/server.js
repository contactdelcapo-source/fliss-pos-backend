// Test route
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Fliss POS Backend Advanced', version: '2.0' });
});

// 🔥 ROUTE LOGIN COMPATIBLE AVEC TON FRONT
app.post("/api/login", (req, res, next) => {
  req.url = "/login";
  authRouter.handle(req, res, next);
});

// Routes principales
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/agencies', agenciesRouter);
