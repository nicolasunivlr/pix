const Session = require('../../../../lib/domain/models/Session');
const { expect } = require('../../../test-helper');
const _ = require('lodash');
const { domainBuilder } = require('../../../test-helper');

const SESSION_PROPS = [
  'id',
  'accessCode',
  'address',
  'certificationCenter',
  'date',
  'description',
  'examiner',
  'room',
  'time',
  'examinerGlobalComment',
  'finalizedAt',
  'resultsSentToPrescriberAt',
  'publishedAt',
  'certificationCandidates',
  'certificationCenterId',
  'assignedCertificationOfficerId',
];

describe('Unit | Domain | Models | Session', () => {
  let session;

  beforeEach(() => {
    session = new Session({
      id: 'id',
      accessCode: '',
      address: '',
      certificationCenter: '',
      date: '',
      description: '',
      examiner: '',
      room: '',
      time: '',
      examinerGlobalComment: '',
      finalizedAt: '',
      resultsSentToPrescriberAt: '',
      publishedAt: '',
      // includes
      certificationCandidates: [],
      // references
      certificationCenterId: '',
      assignedCertificationOfficerId: '',
    });
  });

  it('should create an object of the Session type', () => {
    expect(session).to.be.instanceOf(Session);
  });

  it('should create a session with all the requires properties', () => {
    expect(_.keys(session)).to.have.deep.members(SESSION_PROPS);
  });

  context('#areResultsFlaggedAsSent', () => {
    context('when session resultsSentToPrescriberAt timestamp is defined', () => {

      it('should return true', () => {
        // given
        session.resultsSentToPrescriberAt = new Date();

        // when
        const areResultsFlaggedAsSent = session.areResultsFlaggedAsSent();

        // then
        expect(areResultsFlaggedAsSent).to.be.true;
      });
    });
    context('when session resultsSentToPrescriberAt timestamp is falsy', () => {

      it('should return false', () => {
        // given
        session.resultsSentToPrescriberAt = null;

        // when
        const areResultsFlaggedAsSent = session.areResultsFlaggedAsSent();

        // then
        expect(areResultsFlaggedAsSent).to.be.false;
      });
    });
  });

  context('#get status', () => {

    context('when session publishedAt timestamp is defined', () => {

      it('should return PROCESSED', () => {
        // given
        session.publishedAt = new Date();

        // when
        const status = session.status;

        // then
        expect(status).to.equal(Session.statuses.PROCESSED);
      });
    });

    context('when session publishedAt timestamp is not defined', () => {

      context('when session assignedCertificationOfficerId is defined', () => {

        it('should return IN_PROCESS', () => {
          // given
          session.assignedCertificationOfficerId = 123;

          // when
          const status = session.status;

          // then
          expect(status).to.equal(Session.statuses.IN_PROCESS);
        });
      });

      context('when session assignedCertificationOfficerId is not defined', () => {

        context('when session finalizedAt timestamp is defined', () => {

          it('should return FINALIZED', () => {
            // given
            session.finalizedAt = new Date();

            // when
            const status = session.status;

            // then
            expect(status).to.equal(Session.statuses.FINALIZED);
          });
        });

        context('when session finalizedAt timestamp is not defined', () => {

          it('should return CREATED', () => {
            // when
            const status = session.status;

            // then
            expect(status).to.equal(Session.statuses.CREATED);
          });
        });
      });
    });
  });

  context('#isPublished', () => {
    it('returns true when the session is published', () => {
      // given
      const session = domainBuilder.buildSession({ publishedAt: new Date() });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.true;
    });

    it('returns false when the session is not published', () => {
      // given
      const session = domainBuilder.buildSession({ publishedAt: null });
      // when
      const isPublished = session.isPublished();

      // then
      expect(isPublished).to.be.false;
    });
  });

  context('#isAccessible', () => {

    it('returns true when the session is created', () => {
      // given
      const session = domainBuilder.buildSession.created();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.true;
    });

    it('returns false when the session is finalized', () => {
      // given
      const session = domainBuilder.buildSession.finalized();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.false;
    });

    it('returns false when the session is in process', () => {
      // given
      const session = domainBuilder.buildSession.inProcess();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.false;
    });

    it('returns false when the session is processed', () => {
      // given
      const session = domainBuilder.buildSession.processed();

      // when
      const isAccessible = session.isAccessible();

      // then
      expect(isAccessible).to.be.false;
    });
  });
});
