const DEFAULT_PAYMENT_MODE = "default";

const INITIAL_STOCK_BY_SLUG = {
  "scorta-acqua-potabile-20l": 29,
  "scorta-acqua-potabile-5l": 50,
  "chili-vegetale-liofilizzato": 8,
  "risotto-ai-funghi-liofilizzato": 0,
};

const state = {
  paymentMode: DEFAULT_PAYMENT_MODE,
};

function isDevMode() {
  return process.env.APP_MODE === "dev";
}

function getPaymentMode() {
  return state.paymentMode;
}

function setPaymentMode(mode) {
  state.paymentMode = mode;
}

function resetDemoState() {
  state.paymentMode = DEFAULT_PAYMENT_MODE;
}

function getInitialStockBySlug() {
  return { ...INITIAL_STOCK_BY_SLUG };
}

module.exports = {
  DEFAULT_PAYMENT_MODE,
  INITIAL_STOCK_BY_SLUG,
  isDevMode,
  getPaymentMode,
  setPaymentMode,
  resetDemoState,
  getInitialStockBySlug,
};
