const { expect, sinon } = require('$root/tests/test-helper');
const usecases = require('$root/lib/domain/usecases');

describe('Unit | UseCase | find-paginated-filtered-sessions', () => {
  let sessionRepository;

  beforeEach(() => {
    sessionRepository = {
      findPaginatedFiltered: sinon.stub(),
    };
  });

  it('should result sessions with filtering and pagination', async () => {
    // given
    const filters = 'someFilters';
    const page = 'somePageConfiguration';
    const resolvedPagination = 'pagination';
    const matchingSessions = 'listOfMatchingSessions';
    sessionRepository.findPaginatedFiltered.withArgs({ filters, page }).resolves({ sessions: matchingSessions, pagination: resolvedPagination });

    // when
    const response = await usecases.findPaginatedFilteredSessions({ filters, page, sessionRepository });

    // then
    expect(response.sessions).to.equal(matchingSessions);
    expect(response.pagination).to.equal(resolvedPagination);
  });
});
