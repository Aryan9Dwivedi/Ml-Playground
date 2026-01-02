// src/api/base44Client.js

function createLocalStub() {
  const entityStub = {
    list: async () => [],
    get: async () => null,
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  };

  return {
    auth: {
      isAuthenticated: async () => false,
      me: async () => ({ id: "local-user", name: "Local User" }),
      login: async () => {},
      logout: async () => {},
    },
    entities: new Proxy(
      {},
      {
        get() {
          return entityStub;
        },
      }
    ),
    integrations: {},
    agents: {},
  };
}

// Default: local stub (safe for local + GitHub Pages)
export let base44 = createLocalStub();

// If explicitly enabled, load real Base44 client at runtime (dynamic import avoids build issues)
const useBase44 = import.meta.env.VITE_USE_BASE44 === "true";

if (useBase44) {
  (async () => {
    const { createClient } = await import("@base44/sdk");
    base44 = createClient({
      appId: "695816d9c5c92a5a51fe16b3",
      requiresAuth: true,
    });
  })().catch((err) => {
    console.warn("Falling back to local Base44 stub:", err);
    base44 = createLocalStub();
  });
}
