const PixRole = require('$root/lib/domain/models/PixRole');

module.exports = function buildPixRole({ id = 1, name = 'PIX_MASTER' } = {}) {
  return new PixRole({ id, name });
};
