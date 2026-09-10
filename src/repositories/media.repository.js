const store = [];

function applyFilters(records, { category, tags, search } = {}) {
  let results = records;

  if (category) {
    results = results.filter((record) => record.category === category);
  }

  if (tags && tags.length) {
    results = results.filter((record) => tags.every((tag) => record.tags.includes(tag)));
  }

  if (search) {
    const query = search.toLowerCase();
    results = results.filter((record) => record.title.toLowerCase().includes(query));
  }

  return results;
}

function applySort(records, sortBy, order) {
  if (!sortBy) return records;
  const direction = order === 'desc' ? -1 : 1;

  return [...records].sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1 * direction;
    if (a[sortBy] > b[sortBy]) return 1 * direction;
    return 0;
  });
}

export const mediaRepository = {
  async create(record) {
    store.push(record);
    return record;
  },

  async findById(id) {
    return store.find((record) => record.id === id) || null;
  },

  async find(filters, { skip, limit, sortBy, order }) {
    const filtered = applySort(applyFilters(store, filters), sortBy, order);
    return filtered.slice(skip, skip + limit);
  },

  async countByFilter(filters) {
    return applyFilters(store, filters).length;
  },

  async update(id, updates) {
    const record = store.find((item) => item.id === id);
    if (!record) return null;
    Object.assign(record, updates, { updatedAt: new Date().toISOString() });
    return record;
  },

  async delete(id) {
    const index = store.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const [deleted] = store.splice(index, 1);
    return deleted;
  },
};
